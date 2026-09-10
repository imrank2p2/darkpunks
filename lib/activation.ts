import { BrowserProvider, Contract, formatEther, formatUnits, parseUnits } from "ethers";
import { ACTIVATION_CONTRACT_ADDRESS, ACTIVATION_COST_DARK, DARK_TOKEN_ADDRESS } from "@/lib/contract";
import { ensureRobinhoodChain } from "@/lib/wallet";

const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
];

const VAULT_ABI = [
  "function activationCost() view returns (uint256)",
  "function isActivated(uint256) view returns (bool)",
  "function pendingRewards(uint256) view returns (uint256)",
  "function activationInfo(uint256) view returns (bool,uint256,uint256,uint256,uint256)",
  "function activate(uint256)",
  "function claim(uint256)",
];

function requireVaultAddress() {
  if (!ACTIVATION_CONTRACT_ADDRESS) {
    throw new Error("ACTIVATION CONTRACT NOT DEPLOYED YET");
  }
  return ACTIVATION_CONTRACT_ADDRESS;
}

async function signerContext() {
  await ensureRobinhoodChain();
  if (!window.ethereum) throw new Error("NO WALLET FOUND");
  const provider = new BrowserProvider(window.ethereum as any);
  const signer = await provider.getSigner();
  return { provider, signer, account: await signer.getAddress() };
}

export async function readDarkBalance(address: string) {
  if (!window.ethereum) {
  return {
    raw: BigInt(0),
    formatted: "0",
    decimals: 18,
  };
}
  const provider = new BrowserProvider(window.ethereum as any);
  const token = new Contract(DARK_TOKEN_ADDRESS, ERC20_ABI, provider);
  const [raw, decimals] = await Promise.all([token.balanceOf(address), token.decimals()]);
  return { raw: BigInt(raw), formatted: formatUnits(raw, Number(decimals)), decimals: Number(decimals) };
}

export async function readActivationState(tokenId: number) {
  const vaultAddress = requireVaultAddress();
  if (!window.ethereum) return { activated: false, pendingEth: "0", weight: "0.00X", activationNumber: 0 };
  const provider = new BrowserProvider(window.ethereum as any);
  const vault = new Contract(vaultAddress, VAULT_ABI, provider);
  const [activated, pending, info] = await Promise.all([
    vault.isActivated(tokenId),
    vault.pendingRewards(tokenId),
    vault.activationInfo(tokenId),
  ]);
  const weightRaw = BigInt(info[2]);
  return {
    activated: Boolean(activated),
    pendingEth: formatEther(pending),
    weight: `${Number(weightRaw / (BigInt(10) ** BigInt(16))) / 100}X`,
    activationNumber: Number(info[3]),
  };
}

export async function activatePunk(tokenId: number) {
  const vaultAddress = requireVaultAddress();
  const { signer, account } = await signerContext();
  const token = new Contract(DARK_TOKEN_ADDRESS, ERC20_ABI, signer);
  const vault = new Contract(vaultAddress, VAULT_ABI, signer);

  const decimals = Number(await token.decimals());
  const fallbackCost = parseUnits(String(ACTIVATION_COST_DARK), decimals);
  const cost = BigInt(await vault.activationCost().catch(() => fallbackCost));
  const balance = BigInt(await token.balanceOf(account));
  if (balance < cost) throw new Error(`INSUFFICIENT $DARK. REQUIRED: ${formatUnits(cost, decimals)}`);

  const allowance = BigInt(await token.allowance(account, vaultAddress));
  if (allowance < cost) {
    const approveTx = await token.approve(vaultAddress, cost);
    await approveTx.wait();
  }

  const activateTx = await vault.activate(tokenId);
  const receipt = await activateTx.wait();
  return { hash: activateTx.hash, receipt };
}

export async function claimPunkRewards(tokenId: number) {
  const vaultAddress = requireVaultAddress();
  const { signer } = await signerContext();
  const vault = new Contract(vaultAddress, VAULT_ABI, signer);
  const tx = await vault.claim(tokenId);
  const receipt = await tx.wait();
  return { hash: tx.hash, receipt };
}
