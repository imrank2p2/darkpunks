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
  const response = await fetch(`/api/owned-nfts?address=${encodeURIComponent(address)}`, { cache: "no-store" });
  const data = await response.json() as { ids?: number[]; error?: string };
  if (!response.ok) throw new Error(data.error || "Could not load NFT ownership from Blockscout.");
  return { balance: data.ids?.length || 0, ids: data.ids || [] };
}

export async function getConnectedAccount() {
  if (typeof window === "undefined" || !window.ethereum) return "";
  try {
    const provider = getProvider();
    const accounts = await provider.request({ method: "eth_accounts" }) as string[];
    return accounts?.[0] || "";
  } catch { return ""; }
}
