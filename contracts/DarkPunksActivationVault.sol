// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC721OwnerOf {
    function ownerOf(uint256 tokenId) external view returns (address);
}

interface IDarkBurnable {
    function burnFrom(address account, uint256 amount) external;
}

/// @title DarkPunksActivationVault
/// @notice Activates DARK PUNKS by burning $DARK and distributes ETH rewards by activation weight.
/// @dev Rewards follow the NFT: only the current owner of an activated tokenId can claim that token's accrued ETH.
contract DarkPunksActivationVault {
    uint256 public constant ACC = 1e27;
    uint256 public constant GENESIS_COUNT = 250;
    uint256 public constant EARLY_COUNT = 500;
    uint256 public constant GENESIS_WEIGHT = 3e18;
    uint256 public constant EARLY_WEIGHT = 2e18;
    uint256 public constant STANDARD_WEIGHT = 1e18;

    IERC721OwnerOf public immutable darkPunks;
    IDarkBurnable public immutable darkToken;
    uint256 public immutable activationCost;

    uint256 public activationCount;
    uint256 public totalWeight;
    uint256 public rewardPerWeight;
    uint256 public totalRewardsFunded;
    uint256 public totalRewardsClaimed;

    struct Activation {
        bool activated;
        uint64 activatedAt;
        uint192 weight;
        uint64 activationNumber;
        uint256 rewardDebt;
        uint256 accrued;
    }

    mapping(uint256 => Activation) private activations;

    event PunkActivated(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 activationNumber,
        uint256 weight,
        uint256 darkBurned
    );
    event RewardsFunded(address indexed funder, uint256 amount, uint256 rewardPerWeight);
    event RewardsClaimed(uint256 indexed tokenId, address indexed owner, uint256 amount);

    error NotPunkOwner();
    error AlreadyActivated();
    error NoActiveWeight();
    error NothingToClaim();
    error TransferFailed();
    error ZeroAddress();
    error ZeroActivationCost();

    constructor(address nft_, address darkToken_, uint256 activationCost_) {
        if (nft_ == address(0) || darkToken_ == address(0)) revert ZeroAddress();
        if (activationCost_ == 0) revert ZeroActivationCost();
        darkPunks = IERC721OwnerOf(nft_);
        darkToken = IDarkBurnable(darkToken_);
        activationCost = activationCost_;
    }

    /// @notice Burns activationCost $DARK from msg.sender and activates tokenId.
    /// @dev User must first approve this vault to spend at least activationCost.
    function activate(uint256 tokenId) external {
        if (darkPunks.ownerOf(tokenId) != msg.sender) revert NotPunkOwner();
        Activation storage a = activations[tokenId];
        if (a.activated) revert AlreadyActivated();

        // burnFrom must enforce allowance according to the $DARK token implementation.
        darkToken.burnFrom(msg.sender, activationCost);

        uint256 number = ++activationCount;
        uint256 weight = _weightForActivation(number);

        a.activated = true;
        a.activatedAt = uint64(block.timestamp);
        a.weight = uint192(weight);
        a.activationNumber = uint64(number);
        // New activations cannot claim rewards deposited before they activated.
        a.rewardDebt = (weight * rewardPerWeight) / ACC;

        totalWeight += weight;

        emit PunkActivated(tokenId, msg.sender, number, weight, activationCost);
    }

    /// @notice Funds the ETH reward pool.
    /// @dev Reverts if no Punks are active, preventing accidental unallocatable deposits.
    function fundRewards() external payable {
        _fund(msg.sender, msg.value);
    }

    receive() external payable {
        _fund(msg.sender, msg.value);
    }

    function _fund(address funder, uint256 amount) internal {
        if (totalWeight == 0) revert NoActiveWeight();
        if (amount == 0) return;
        rewardPerWeight += (amount * ACC) / totalWeight;
        totalRewardsFunded += amount;
        emit RewardsFunded(funder, amount, rewardPerWeight);
    }

    function claim(uint256 tokenId) external returns (uint256 amount) {
        if (darkPunks.ownerOf(tokenId) != msg.sender) revert NotPunkOwner();
        Activation storage a = activations[tokenId];
        if (!a.activated) revert NothingToClaim();

        amount = _pending(a);
        if (amount == 0) revert NothingToClaim();

        a.accrued = 0;
        a.rewardDebt = (uint256(a.weight) * rewardPerWeight) / ACC;
        totalRewardsClaimed += amount;

        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        if (!ok) revert TransferFailed();

        emit RewardsClaimed(tokenId, msg.sender, amount);
    }

    /// @notice Checkpoint accrued rewards for a token without transferring ETH.
    function checkpoint(uint256 tokenId) external {
        Activation storage a = activations[tokenId];
        if (!a.activated) revert NothingToClaim();
        uint256 pending_ = _pending(a);
        a.accrued = pending_;
        a.rewardDebt = (uint256(a.weight) * rewardPerWeight) / ACC;
    }

    function pendingRewards(uint256 tokenId) public view returns (uint256) {
        Activation storage a = activations[tokenId];
        if (!a.activated) return 0;
        return _pending(a);
    }

    function isActivated(uint256 tokenId) external view returns (bool) {
        return activations[tokenId].activated;
    }

    function activationInfo(uint256 tokenId)
        external
        view
        returns (
            bool activated,
            uint256 activatedAt,
            uint256 weight,
            uint256 activationNumber,
            uint256 pending
        )
    {
        Activation storage a = activations[tokenId];
        activated = a.activated;
        activatedAt = a.activatedAt;
        weight = a.weight;
        pending = a.activated ? _pending(a) : 0;
        activationNumber = a.activationNumber;
    }

    function weightForNextActivation() external view returns (uint256) {
        return _weightForActivation(activationCount + 1);
    }

    function _pending(Activation storage a) internal view returns (uint256) {
        uint256 accumulated = (uint256(a.weight) * rewardPerWeight) / ACC;
        return a.accrued + accumulated - a.rewardDebt;
    }

    function _weightForActivation(uint256 number) internal pure returns (uint256) {
        if (number <= GENESIS_COUNT) return GENESIS_WEIGHT;
        if (number <= GENESIS_COUNT + EARLY_COUNT) return EARLY_WEIGHT;
        return STANDARD_WEIGHT;
    }


}
