// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AegisGuard
 * @notice A smart wallet that enforces Function-Level Intents AND Parameter-Level Spending Limits.
 * @dev Supports native ETH and ERC-20 tokens.
 */
contract AegisGuard is Pausable {
    // --- State Variables ---

    address public owner;
    address public agent;

    // Target Contract -> Function Selector -> Allowed
    mapping(address => mapping(bytes4 => bool)) public allowedSelectors;

    // Recipient Whitelist for Transfers
    mapping(address => bool) public recipientWhitelist;

    // Struct for Streaming Allowances
    struct Limit {
        uint256 amount;      // Max amount per period
        uint256 period;      // Period in seconds (e.g., 86400 for daily)
        uint256 lastReset;   // Timestamp of last reset
        uint256 currentUsage;// Amount spent in current period
    }

    // Token Address -> Limit Config
    mapping(address => Limit) public spendingLimits;

    // --- Events ---
    event Deposit(address indexed sender, uint256 amount);
    event PolicyUpdated(address indexed target, bytes4 indexed selector, bool allowed);
    event RecipientWhitelisted(address indexed recipient, bool allowed);
    event LimitUpdated(address indexed token, uint256 limit);
    event Executed(address indexed target, bytes4 indexed selector, uint256 value, bytes data);
    event AgentUpdated(address indexed newAgent);
    event PolicyViolation(address indexed target, bytes4 indexed selector, string reason, bytes data);

    // --- Modifiers ---
    modifier onlyOwner() {
        require(msg.sender == owner, "Aegis: Only Owner");
        _;
    }

    modifier onlyAgentOrOwner() {
        require(msg.sender == agent || msg.sender == owner, "Aegis: Unauthorized");
        _;
    }

    constructor(address _agent) {
        owner = msg.sender;
        agent = _agent;
    }

    // --- Policy Management ---

    function setPolicy(address target, bytes4 selector, bool allowed) external onlyOwner {
        allowedSelectors[target][selector] = allowed;
        emit PolicyUpdated(target, selector, allowed);
    }

    function setRecipientWhitelist(address recipient, bool allowed) external onlyOwner {
        recipientWhitelist[recipient] = allowed;
        emit RecipientWhitelisted(recipient, allowed);
    }

    function setSpendingLimit(address token, uint256 amount, uint256 period) external onlyOwner {
        spendingLimits[token] = Limit(amount, period, block.timestamp, 0);
        emit LimitUpdated(token, amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function setAgent(address _agent) external onlyOwner {
        agent = _agent;
        emit AgentUpdated(_agent);
    }

    // --- Execution Logic ---

    function execute(address target, bytes calldata data) external onlyAgentOrOwner whenNotPaused payable {
        require(data.length >= 4, "Aegis: Data too short");
        bytes4 selector = bytes4(data[:4]);

        // 1. Policy Check (Function Whitelist)
        if (msg.sender == agent) {
            // Check if function is allowed OR if it's a transfer to a whitelisted recipient
            bool isAllowed = allowedSelectors[target][selector];
            
            // Selector for transfer(address,uint256) is 0xa9059cbb
            if (selector == 0xa9059cbb) {
                address recipient = _getRecipient(data);
                if (recipientWhitelist[recipient]) {
                    isAllowed = true;
                }
            }

            if (!isAllowed) {
                emit PolicyViolation(target, selector, "Policy Violation - Not Authorized", data);
                return;
            }
            
            // 2. Parameter Check (Spending Limit for ERC20 Transfers)
            if (selector == 0xa9059cbb) {
                if (!_checkSpendingLimit(target, data)) {
                    return;
                }
            }
        }

        // 3. Execute Call
        (bool success, bytes memory result) = target.call{value: msg.value}(data);
        require(success, string(abi.encodePacked("Aegis: Call Failed - ", result)));

        emit Executed(target, selector, msg.value, data);
    }

    function _checkSpendingLimit(address token, bytes calldata data) internal returns (bool) {
        if (data.length < 68) {
             emit PolicyViolation(token, bytes4(data[:4]), "Invalid Transfer Data", data);
             return false;
        }
        
        uint256 amount;
        assembly {
            // Skip selector (4) + address (32) = 36
            amount := calldataload(add(data.offset, 36))
        }

        Limit storage limit = spendingLimits[token];
        
        // If period is 0, no limit is enforced
        if (limit.period > 0) {
            // Check if period has passed
            if (block.timestamp >= limit.lastReset + limit.period) {
                limit.currentUsage = 0;
                limit.lastReset = block.timestamp;
            }

            if (limit.currentUsage + amount > limit.amount) {
                emit PolicyViolation(token, bytes4(data[:4]), "Spending Limit Exceeded", data);
                return false;
            }
            limit.currentUsage += amount;
        }
        return true;
    }

    function _getRecipient(bytes calldata data) internal pure returns (address) {
        if (data.length < 36) return address(0);
        address recipient;
        assembly {
            recipient := calldataload(add(data.offset, 4))
        }
        return recipient;
    }

    // --- Receive Function ---
    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }
}
