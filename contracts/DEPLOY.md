# DARK PUNKS Activation Vault deployment

Deploy `DarkPunksActivationVault.sol` on Robinhood Chain (chain ID 4663).

## Constructor

1. `nft_`
   `0x7553539C27B550d14fcdccd19fa78f8F6CD057BB`

2. `darkToken_`
   `0x1318A45dDeCd1d22064ce859462be4f40CCD0a21`

3. `activationCost_`
   The raw ERC-20 amount. If $DARK has 18 decimals:

   - 50,000 DARK = `50000000000000000000000`
   - 100,000 DARK = `100000000000000000000000`

Do not deploy until the final activation amount is chosen.

## Flow

User:

1. Owns the selected DARK PUNK.
2. Approves the vault to spend the activation amount of $DARK.
3. Calls `activate(tokenId)`.
4. Vault calls `$DARK.burnFrom(user, activationCost)`.
5. Vault assigns 3x weight for activations 1-250, 2x for 251-750, then 1x.

## Reward funding

Send ETH using `fundRewards()` or a plain ETH transfer to the vault.

The vault allocates ETH by total activation weight. A new activation does not receive ETH deposited before its activation.

## Important

Pons creator-fee automation is not included in this contract. The vault is ready to receive ETH, but routing Pons creator fees directly into it must be verified against the exact Pons fee-claim contract/API before setting the creator fee recipient to the vault.
