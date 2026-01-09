// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgentMarket Protocol
 * @notice Decentralized discovery and hiring protocol for AI Agents on Cronos
 * @dev Implements identity, reputation, and payment infrastructure
 */
contract AgentMarket {
    // ============ STRUCTS ============
    
    struct AgentProfile {
        string name;
        string endpointUrl;
        string[] capabilities;
        string mcpVersion;
        address walletAddress;
        uint256 reputationScore;
        uint256 registeredAt;
        bool isActive;
    }

    // ============ STATE VARIABLES ============
    
    mapping(address => AgentProfile) public agents;
    address[] public agentAddresses;
    mapping(address => bool) public isRegistered;
    
    // Economy tracking
    mapping(address => uint256) public completedJobs;
    mapping(address => uint256) public totalEarnings;
    mapping(address => uint256) public totalSpent;
    
    // Protocol settings
    uint256 public constant PROTOCOL_FEE_BPS = 200; // 2% fee
    uint256 public constant REPUTATION_GAIN = 5;
    uint256 public constant REPUTATION_LOSS = 3;
    uint256 public constant BASE_REPUTATION = 100;
    
    address public protocolTreasury;
    address public owner;
    
    uint256 public totalTransactionVolume;
    uint256 public totalAgentsRegistered;

    // ============ EVENTS ============
    
    event AgentRegistered(
        address indexed agentAddress,
        string name,
        string[] capabilities,
        uint256 timestamp
    );
    
    event AgentUpdated(
        address indexed agentAddress,
        string name,
        uint256 timestamp
    );
    
    event AgentDeactivated(
        address indexed agentAddress,
        uint256 timestamp
    );
    
    event AgentHired(
        address indexed hirer,
        address indexed agent,
        uint256 amount,
        uint256 protocolFee,
        uint256 timestamp
    );
    
    event AgentToAgentHire(
        address indexed hiringAgent,
        address indexed hiredAgent,
        uint256 amount,
        uint256 timestamp
    );
    
    event ReputationUpdated(
        address indexed agent,
        uint256 oldScore,
        uint256 newScore,
        bool increased
    );
    
    event JobCompleted(
        address indexed agent,
        address indexed client,
        uint256 amount,
        uint256 timestamp
    );

    // ============ ERRORS ============
    
    error AlreadyRegistered();
    error NotRegistered();
    error InvalidAgent();
    error InsufficientPayment();
    error TransferFailed();
    error Unauthorized();
    error AgentInactive();

    // ============ MODIFIERS ============
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }
    
    modifier onlyRegistered() {
        if (!isRegistered[msg.sender]) revert NotRegistered();
        _;
    }
    
    modifier agentExists(address agent) {
        if (!isRegistered[agent]) revert InvalidAgent();
        if (!agents[agent].isActive) revert AgentInactive();
        _;
    }

    // ============ CONSTRUCTOR ============
    
    constructor(address _treasury) {
        owner = msg.sender;
        protocolTreasury = _treasury;
    }

    // ============ REGISTRATION FUNCTIONS ============
    
    /**
     * @notice Register a new AI agent on the protocol
     * @param profile The agent profile data
     */
    function registerAgent(AgentProfile calldata profile) external {
        if (isRegistered[msg.sender]) revert AlreadyRegistered();
        
        AgentProfile storage newAgent = agents[msg.sender];
        newAgent.name = profile.name;
        newAgent.endpointUrl = profile.endpointUrl;
        newAgent.capabilities = profile.capabilities;
        newAgent.mcpVersion = profile.mcpVersion;
        newAgent.walletAddress = msg.sender;
        newAgent.reputationScore = BASE_REPUTATION;
        newAgent.registeredAt = block.timestamp;
        newAgent.isActive = true;
        
        agentAddresses.push(msg.sender);
        isRegistered[msg.sender] = true;
        totalAgentsRegistered++;
        
        emit AgentRegistered(
            msg.sender,
            profile.name,
            profile.capabilities,
            block.timestamp
        );
    }
    
    /**
     * @notice Update an existing agent profile
     * @param profile Updated profile data
     */
    function updateAgent(AgentProfile calldata profile) external onlyRegistered {
        AgentProfile storage agent = agents[msg.sender];
        agent.name = profile.name;
        agent.endpointUrl = profile.endpointUrl;
        agent.capabilities = profile.capabilities;
        agent.mcpVersion = profile.mcpVersion;
        
        emit AgentUpdated(msg.sender, profile.name, block.timestamp);
    }
    
    /**
     * @notice Deactivate an agent (soft delete)
     */
    function deactivateAgent() external onlyRegistered {
        agents[msg.sender].isActive = false;
        emit AgentDeactivated(msg.sender, block.timestamp);
    }

    // ============ HIRING & PAYMENT FUNCTIONS ============
    
    /**
     * @notice Hire an agent and pay them directly
     * @param agent Address of the agent to hire
     */
    function hireAgent(address agent) external payable agentExists(agent) {
        if (msg.value == 0) revert InsufficientPayment();
        
        uint256 protocolFee = (msg.value * PROTOCOL_FEE_BPS) / 10000;
        uint256 agentPayment = msg.value - protocolFee;
        
        // Transfer to agent
        (bool agentSuccess, ) = payable(agent).call{value: agentPayment}("");
        if (!agentSuccess) revert TransferFailed();
        
        // Transfer protocol fee
        (bool feeSuccess, ) = payable(protocolTreasury).call{value: protocolFee}("");
        if (!feeSuccess) revert TransferFailed();
        
        // Update stats
        completedJobs[agent]++;
        totalEarnings[agent] += agentPayment;
        totalSpent[msg.sender] += msg.value;
        totalTransactionVolume += msg.value;
        
        // Increase reputation
        _increaseReputation(agent);
        
        emit AgentHired(msg.sender, agent, msg.value, protocolFee, block.timestamp);
        emit JobCompleted(agent, msg.sender, agentPayment, block.timestamp);
    }
    
    /**
     * @notice Allow an agent to hire another agent (agent-to-agent economy)
     * @param agent Address of the agent to hire
     */
    function hireAgentFromAgent(address agent) external payable onlyRegistered agentExists(agent) {
        if (msg.value == 0) revert InsufficientPayment();
        
        uint256 protocolFee = (msg.value * PROTOCOL_FEE_BPS) / 10000;
        uint256 agentPayment = msg.value - protocolFee;
        
        // Transfer to hired agent
        (bool agentSuccess, ) = payable(agent).call{value: agentPayment}("");
        if (!agentSuccess) revert TransferFailed();
        
        // Transfer protocol fee
        (bool feeSuccess, ) = payable(protocolTreasury).call{value: protocolFee}("");
        if (!feeSuccess) revert TransferFailed();
        
        // Update stats for both agents
        completedJobs[agent]++;
        totalEarnings[agent] += agentPayment;
        totalSpent[msg.sender] += msg.value;
        totalTransactionVolume += msg.value;
        
        // Reputation updates
        _increaseReputation(agent);
        _increaseReputation(msg.sender); // Hiring agent also gains reputation
        
        emit AgentToAgentHire(msg.sender, agent, msg.value, block.timestamp);
        emit JobCompleted(agent, msg.sender, agentPayment, block.timestamp);
    }

    // ============ REPUTATION FUNCTIONS ============
    
    function _increaseReputation(address agent) internal {
        uint256 oldScore = agents[agent].reputationScore;
        agents[agent].reputationScore += REPUTATION_GAIN;
        emit ReputationUpdated(agent, oldScore, agents[agent].reputationScore, true);
    }
    
    function _decreaseReputation(address agent) internal {
        uint256 oldScore = agents[agent].reputationScore;
        if (agents[agent].reputationScore > REPUTATION_LOSS) {
            agents[agent].reputationScore -= REPUTATION_LOSS;
        } else {
            agents[agent].reputationScore = 0;
        }
        emit ReputationUpdated(agent, oldScore, agents[agent].reputationScore, false);
    }
    
    /**
     * @notice Report a failed job (owner only for now)
     * @param agent Address of the agent that failed
     */
    function reportFailedJob(address agent) external onlyOwner agentExists(agent) {
        _decreaseReputation(agent);
    }

    // ============ DISCOVERY FUNCTIONS ============
    
    /**
     * @notice Find agents by capability
     * @param capability The capability to search for
     * @return Array of agent addresses with the capability
     */
    function findAgentsByCapability(string memory capability) 
        public 
        view 
        returns (address[] memory) 
    {
        uint256 count = 0;
        
        // First pass: count matches
        for (uint256 i = 0; i < agentAddresses.length; i++) {
            address agentAddr = agentAddresses[i];
            if (agents[agentAddr].isActive && _hasCapability(agentAddr, capability)) {
                count++;
            }
        }
        
        // Second pass: populate array
        address[] memory result = new address[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < agentAddresses.length; i++) {
            address agentAddr = agentAddresses[i];
            if (agents[agentAddr].isActive && _hasCapability(agentAddr, capability)) {
                result[index] = agentAddr;
                index++;
            }
        }
        
        return result;
    }
    
    function _hasCapability(address agent, string memory capability) 
        internal 
        view 
        returns (bool) 
    {
        string[] memory caps = agents[agent].capabilities;
        bytes32 capHash = keccak256(abi.encodePacked(capability));
        
        for (uint256 i = 0; i < caps.length; i++) {
            if (keccak256(abi.encodePacked(caps[i])) == capHash) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @notice Get all active agents
     * @return Array of all active agent addresses
     */
    function getAllActiveAgents() public view returns (address[] memory) {
        uint256 count = 0;
        
        for (uint256 i = 0; i < agentAddresses.length; i++) {
            if (agents[agentAddresses[i]].isActive) {
                count++;
            }
        }
        
        address[] memory result = new address[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < agentAddresses.length; i++) {
            if (agents[agentAddresses[i]].isActive) {
                result[index] = agentAddresses[i];
                index++;
            }
        }
        
        return result;
    }
    
    /**
     * @notice Get agent profile by address
     * @param agent Address of the agent
     */
    function getAgent(address agent) 
        external 
        view 
        returns (
            string memory name,
            string memory endpointUrl,
            string[] memory capabilities,
            string memory mcpVersion,
            address walletAddress,
            uint256 reputationScore,
            uint256 registeredAt,
            bool isActive,
            uint256 jobs,
            uint256 earnings
        ) 
    {
        AgentProfile storage profile = agents[agent];
        return (
            profile.name,
            profile.endpointUrl,
            profile.capabilities,
            profile.mcpVersion,
            profile.walletAddress,
            profile.reputationScore,
            profile.registeredAt,
            profile.isActive,
            completedJobs[agent],
            totalEarnings[agent]
        );
    }
    
    /**
     * @notice Get protocol statistics
     */
    function getProtocolStats() 
        external 
        view 
        returns (
            uint256 totalAgents,
            uint256 activeAgents,
            uint256 volume
        ) 
    {
        uint256 active = 0;
        for (uint256 i = 0; i < agentAddresses.length; i++) {
            if (agents[agentAddresses[i]].isActive) {
                active++;
            }
        }
        return (totalAgentsRegistered, active, totalTransactionVolume);
    }
    
    /**
     * @notice Get total number of registered agents
     */
    function getAgentCount() external view returns (uint256) {
        return agentAddresses.length;
    }

    // ============ ADMIN FUNCTIONS ============
    
    function setTreasury(address _treasury) external onlyOwner {
        protocolTreasury = _treasury;
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        owner = newOwner;
    }
}
