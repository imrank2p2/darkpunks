// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC721Owner {
    function ownerOf(uint256 tokenId) external view returns (address);
}

/// @notice Minimal, testnet-first Arena session ledger for HOOD PLAYERS.
/// @dev This contract records an 8-hour session and test points. It does NOT
///      lock the NFT. A true transfer lock requires support from the NFT contract itself.
contract ArenaController {
    uint256 public constant ARENA_DURATION = 8 hours;
    IERC721Owner public immutable playerNFT;

    struct Session {
        uint64 startedAt;
        uint64 endsAt;
        uint64 points;
        bool claimed;
    }

    mapping(uint256 => Session) public sessions;

    event ArenaEntered(uint256 indexed tokenId, address indexed owner, uint256 endsAt);
    event RewardClaimed(uint256 indexed tokenId, address indexed owner, uint256 points);

    constructor(address nft) {
        require(nft != address(0), "NFT required");
        playerNFT = IERC721Owner(nft);
    }

    function enterArena(uint256 tokenId) external {
        require(playerNFT.ownerOf(tokenId) == msg.sender, "Not player owner");
        Session storage s = sessions[tokenId];
        require(s.endsAt == 0 || block.timestamp >= s.endsAt, "Arena active");

        s.startedAt = uint64(block.timestamp);
        s.endsAt = uint64(block.timestamp + ARENA_DURATION);
        s.points = 100;
        s.claimed = false;
        emit ArenaEntered(tokenId, msg.sender, s.endsAt);
    }

    function claimReward(uint256 tokenId) external returns (uint256 points) {
        require(playerNFT.ownerOf(tokenId) == msg.sender, "Not player owner");
        Session storage s = sessions[tokenId];
        require(s.endsAt != 0 && block.timestamp >= s.endsAt, "Arena not complete");
        require(!s.claimed, "Already claimed");
        s.claimed = true;
        points = s.points;
        emit RewardClaimed(tokenId, msg.sender, points);
    }

    function getSession(uint256 tokenId) external view returns (Session memory) {
        return sessions[tokenId];
    }
}
