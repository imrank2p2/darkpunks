export const CONTRACT_ADDRESS = "0x7553539C27B550d14fcdccd19fa78f8F6CD057BB";

export const DARK_TOKEN_ADDRESS =
  "0x1318A45dDeCd1d22064ce859462be4f40CCD0a21";

export const ACTIVATION_COST_DARK = 50000;

export const ACTIVATION_CONTRACT_ADDRESS =
  "0xfD18CB588e221e4512Cd1759A5F392AEF984230a";

export const RH_MAINNET = {
  chainId: "0x1237",
  chainIdDecimal: 4663,
  chainName: "Robinhood Chain",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.mainnet.chain.robinhood.com"],
  blockExplorerUrls: ["https://robinhoodchain.blockscout.com/"],
} as const;