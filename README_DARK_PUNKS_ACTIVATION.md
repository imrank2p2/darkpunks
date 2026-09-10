# DARK PUNKS Activation + ETH Rewards

This package contains the website plus a deploy-ready Solidity vault.

## Current addresses

NFT: `0x7553539C27B550d14fcdccd19fa78f8F6CD057BB`

$DARK: `0x1318A45dDeCd1d22064ce859462be4f40CCD0a21`

Network: Robinhood Chain, chain ID `4663`

## Current activation amount

The frontend constant is currently `50,000 DARK`.

Before deployment, confirm the final amount. The Solidity constructor takes the raw ERC-20 amount, not the human-readable amount.

## Contract deployment

Open `contracts/DarkPunksActivationVault.sol` in Remix, compile with Solidity 0.8.24 or compatible 0.8.x, connect your wallet to Robinhood Chain, and deploy using the constructor values documented in `contracts/DEPLOY.md`.

After deployment:

1. Put the deployed vault address in `.env.local`:
   `NEXT_PUBLIC_ACTIVATION_CONTRACT=0x...`
2. Restart `npm run dev`.
3. The website will automatically switch from deployment-safe mode to live approval, burn, activation, and claim calls.

## Live flow

`ACTIVATE FOR 50,000 DARK`:

- checks the selected NFT is owned by the wallet in the vault
- checks the user's $DARK balance
- requests ERC-20 approval if needed
- calls `activate(tokenId)`
- vault calls `$DARK.burnFrom(user, activationCost)`
- vault assigns 3x / 2x / 1x weight

ETH rewards are funded into the vault with `fundRewards()` or a direct ETH transfer after at least one Punk is active.
