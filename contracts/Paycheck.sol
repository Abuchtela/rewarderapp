// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * ██████╗  █████╗ ██╗   ██╗ ██████╗██╗  ██╗███████╗ ██████╗██╗  ██╗
 * ██╔══██╗██╔══██╗╚██╗ ██╔╝██╔════╝██║  ██║██╔════╝██╔════╝██║ ██╔╝
 * ██████╔╝███████║ ╚████╔╝ ██║     ███████║█████╗  ██║     █████╔╝
 * ██╔═══╝ ██╔══██║  ╚██╔╝  ██║     ██╔══██║██╔══╝  ██║     ██╔═██╗
 * ██║     ██║  ██║   ██║   ╚██████╗██║  ██║███████╗╚██████╗██║  ██╗
 * ╚═╝     ╚═╝  ╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝  ╚═╝
 *
 * @title Paycheck
 * @notice ETH tip router with protocol fee — deployed on Base
 * @dev Tips flow through this contract. 1.5% stays as protocol fee
 *      for abuchtela.base.eth. The rest goes directly to the builder.
 *
 * Deployed by: abuchtela.base.eth
 * Chain: Base (chainId 8453)
 */
contract Paycheck {
    // ── STATE ──────────────────────────────────────────────────────────────

    /// @notice Protocol owner — receives the 1.5% fee
    address public owner;

    /// @notice Fee in basis points (150 = 1.5%)
    uint256 public feeBps;

    /// @notice Max fee cap: 5%
    uint256 public constant MAX_FEE_BPS = 500;

    /// @notice Total ETH routed through the protocol
    uint256 public totalVolume;

    /// @notice Total protocol fees collected
    uint256 public totalFees;

    /// @notice Per-builder tip totals
    mapping(address => uint256) public builderTipTotal;

    /// @notice Per-builder tip count
    mapping(address => uint256) public builderTipCount;

    // ── EVENTS ─────────────────────────────────────────────────────────────

    event TipSent(
        address indexed from,
        address indexed builder,
        uint256 amount,
        uint256 fee,
        uint256 timestamp
    );

    event FeesWithdrawn(address indexed to, uint256 amount);
    event FeeUpdated(uint256 oldBps, uint256 newBps);
    event OwnerUpdated(address indexed oldOwner, address indexed newOwner);

    // ── ERRORS ─────────────────────────────────────────────────────────────

    error NotOwner();
    error ZeroAddress();
    error ZeroValue();
    error FeeTooHigh();
    error TransferFailed();

    // ── CONSTRUCTOR ────────────────────────────────────────────────────────

    /**
     * @param _owner  Protocol fee recipient (abuchtela.base.eth)
     * @param _feeBps Initial fee in basis points (150 = 1.5%)
     */
    constructor(address _owner, uint256 _feeBps) {
        if (_owner == address(0)) revert ZeroAddress();
        if (_feeBps > MAX_FEE_BPS) revert FeeTooHigh();
        owner = _owner;
        feeBps = _feeBps;
    }

    // ── CORE: TIP ──────────────────────────────────────────────────────────

    /**
     * @notice Send a tip to a builder. 1.5% stays as protocol fee.
     * @param builder  The Farcaster builder's wallet address to tip
     *
     * Example: tip 0.01 ETH to a builder
     *   → builder receives 0.00985 ETH
     *   → protocol fee: 0.00015 ETH → goes to abuchtela.base.eth
     */
    function tip(address builder) external payable {
        if (builder == address(0)) revert ZeroAddress();
        if (msg.value == 0) revert ZeroValue();

        // Calculate fee
        uint256 fee = (msg.value * feeBps) / 10_000;
        uint256 builderAmount = msg.value - fee;

        // Track stats
        totalVolume += msg.value;
        totalFees += fee;
        builderTipTotal[builder] += builderAmount;
        builderTipCount[builder]++;

        // Send to builder
        (bool sent, ) = builder.call{value: builderAmount}("");
        if (!sent) revert TransferFailed();

        emit TipSent(msg.sender, builder, builderAmount, fee, block.timestamp);
    }

    // ── OWNER: WITHDRAW FEES ──────────────────────────────────────────────

    /**
     * @notice Withdraw accumulated protocol fees to owner
     * @dev Only callable by owner (abuchtela.base.eth)
     */
    function withdrawFees() external {
        if (msg.sender != owner) revert NotOwner();
        uint256 balance = address(this).balance;
        if (balance == 0) revert ZeroValue();

        (bool sent, ) = owner.call{value: balance}("");
        if (!sent) revert TransferFailed();

        emit FeesWithdrawn(owner, balance);
    }

    // ── OWNER: CONFIG ─────────────────────────────────────────────────────

    /**
     * @notice Update protocol fee (capped at 5%)
     * @param _feeBps New fee in basis points
     */
    function setFee(uint256 _feeBps) external {
        if (msg.sender != owner) revert NotOwner();
        if (_feeBps > MAX_FEE_BPS) revert FeeTooHigh();
        emit FeeUpdated(feeBps, _feeBps);
        feeBps = _feeBps;
    }

    /**
     * @notice Transfer protocol ownership
     * @param _newOwner New owner address
     */
    function transferOwnership(address _newOwner) external {
        if (msg.sender != owner) revert NotOwner();
        if (_newOwner == address(0)) revert ZeroAddress();
        emit OwnerUpdated(owner, _newOwner);
        owner = _newOwner;
    }

    // ── VIEW: STATS ───────────────────────────────────────────────────────

    /**
     * @notice Get full stats for a builder
     * @param builder Builder wallet address
     * @return total Total ETH received by this builder
     * @return count Number of tips received
     */
    function builderStats(address builder)
        external
        view
        returns (uint256 total, uint256 count)
    {
        return (builderTipTotal[builder], builderTipCount[builder]);
    }

    /**
     * @notice Pending fees sitting in the contract
     */
    function pendingFees() external view returns (uint256) {
        return address(this).balance;
    }

    // ── RECEIVE ───────────────────────────────────────────────────────────

    /// @dev Accept direct ETH sends as protocol donations (no fee split)
    receive() external payable {
        totalFees += msg.value;
    }
}
