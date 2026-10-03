export const RH_MAINNET = {
  chainId: "0x1237",
  chainIdDecimal: 4663,
  chainName: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://rpc.mainnet.chain.robinhood.com"],
  blockExplorerUrls: ["https://robinhoodchain.blockscout.com/"],
} as const;

export type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
  isMetaMask?: boolean;
  isRabby?: boolean;
  isRobinhood?: boolean;
  providers?: EthereumProvider[];
};

declare global { interface Window { ethereum?: EthereumProvider; } }

function getProvider(): EthereumProvider {
  if (typeof window === "undefined") throw new Error("Wallet is only available in the browser.");
  const root = window.ethereum;
  if (!root) throw new Error("No browser wallet found. Install MetaMask, Rabby, or Robinhood Wallet.");
  const providers = root.providers || [];
  return providers.find((p) => p.isRobinhood) || providers.find((p) => p.isMetaMask) || providers.find((p) => p.isRabby) || root;
}

export async function ensureRobinhoodChain() {
  const provider = getProvider();
  const current = String(await provider.request({ method: "eth_chainId" })).toLowerCase();
  if (current === RH_MAINNET.chainId.toLowerCase()) return;

  try {
    await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: RH_MAINNET.chainId }] });
  } catch (error: unknown) {
    const code = typeof error === "object" && error && "code" in error ? Number((error as { code: number }).code) : 0;
    if (code !== 4902) {
      throw new Error(`Wallet is on chain ${parseInt(current, 16)}. Approve the switch to Robinhood Chain (4663).`);
    }
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: RH_MAINNET.chainId,
        chainName: RH_MAINNET.chainName,
        nativeCurrency: RH_MAINNET.nativeCurrency,
        rpcUrls: [...RH_MAINNET.rpcUrls],
        blockExplorerUrls: [...RH_MAINNET.blockExplorerUrls],
      }],
    });
  }
}

export async function connectWallet() {
  const provider = getProvider();
  const accounts = await provider.request({ method: "eth_requestAccounts" }) as string[];
  const address = accounts?.[0];
  if (!address) throw new Error("Wallet did not return an account.");
  await ensureRobinhoodChain();
  return address;
}

export async function readOwnedTokenIds(address: string) {
  const provider = getProvider();
  const owner = address.toLowerCase();
  const contract = "0x7553539C27B550d14fcdccd19fa78f8F6CD057BB";

  const pad32 = (value: string) => value.replace(/^0x/, "").padStart(64, "0");
  const call = async (data: string) => {
    const result = await provider.request({
      method: "eth_call",
      params: [{ to: contract, data }, "latest"],
    });
    return String(result);
  };

  const decodeUint = (value: string) => {
    const hex = value.replace(/^0x/, "");
    if (!hex) throw new Error("EMPTY RPC RESPONSE");
    return Number(BigInt(`0x${hex}`));
  };

  // Dark Punks is an ERC-721 collection. Prefer ERC-721Enumerable when the
  // deployed contract exposes tokenOfOwnerByIndex. This gives us the exact
  // NFTs in the connected wallet without depending on an external indexer/API.
  try {
    const balance = decodeUint(await call(`0x70a08231${pad32(owner)}`));
    if (balance === 0) return { balance: 0, ids: [] };

    const ids: number[] = [];
    const CHUNK = 12;

    for (let start = 0; start < balance; start += CHUNK) {
      const end = Math.min(start + CHUNK, balance);
      const batch = await Promise.all(
        Array.from({ length: end - start }, async (_, offset) => {
          const index = start + offset;
          const result = await call(
            `0x2f745c59${pad32(owner)}${pad32(`0x${index.toString(16)}`)}`
          );
          return decodeUint(result);
        })
      );
      ids.push(...batch);
    }

    return {
      balance: ids.length,
      ids: [...new Set(ids)].sort((a, b) => a - b),
    };
  } catch {
    // If the contract is not ERC-721Enumerable, fall back to ownerOf().
    // The collection has 426 NFTs, so scanning the token range is bounded.
    const ids: number[] = [];
    const CHUNK = 20;

    for (let start = 1; start <= 426; start += CHUNK) {
      const end = Math.min(start + CHUNK - 1, 426);
      const batch = await Promise.all(
        Array.from({ length: end - start + 1 }, async (_, offset) => {
          const tokenId = start + offset;
          try {
            const result = await call(
              `0x6352211e${pad32(`0x${tokenId.toString(16)}`)}`
            );
            const tokenOwner = `0x${result.slice(-40)}`.toLowerCase();
            return tokenOwner === owner ? tokenId : null;
          } catch {
            return null;
          }
        })
      );

      for (const id of batch) {
        if (id !== null) ids.push(id);
      }
    }

    return {
      balance: ids.length,
      ids: ids.sort((a, b) => a - b),
    };
  }
}

export async function getConnectedAccount() {
  if (typeof window === "undefined" || !window.ethereum) return "";
  try {
    const provider = getProvider();
    const accounts = await provider.request({ method: "eth_accounts" }) as string[];
    return accounts?.[0] || "";
  } catch { return ""; }
}
