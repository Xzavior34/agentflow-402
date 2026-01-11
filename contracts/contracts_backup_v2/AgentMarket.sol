// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17; // <--- Golden Version for zkEVM

contract AgentMarket {
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

    mapping(address => AgentProfile) public agents;
    address[] public agentAddresses;
    mapping(address => bool) public isRegistered;
    mapping(address => uint256) public completedJobs;
    mapping(address => uint256) public totalEarnings;
    mapping(address => uint256) public totalSpent;
    
    uint256 public constant PROTOCOL_FEE_BPS = 200; 
    uint256 public constant REPUTATION_GAIN = 5;
    uint256 public constant REPUTATION_LOSS = 3;
    uint256 public constant BASE_REPUTATION = 100;
    
    address public protocolTreasury;
    address public owner;
    uint256 public totalTransactionVolume;
    uint256 public totalAgentsRegistered;

    event AgentRegistered(address indexed agentAddress, string name, string[] capabilities, uint256 timestamp);
    event AgentUpdated(address indexed agentAddress, string name, uint256 timestamp);
    event AgentDeactivated(address indexed agentAddress, uint256 timestamp);
    event AgentHired(address indexed hirer, address indexed agent, uint256 amount, uint256 protocolFee, uint256 timestamp);
    event AgentToAgentHire(address indexed hiringAgent, address indexed hiredAgent, uint256 amount, uint256 timestamp);
    event ReputationUpdated(address indexed agent, uint256 oldScore, uint256 newScore, bool increased);
    event JobCompleted(address indexed agent, address indexed client, uint256 amount, uint256 timestamp);

    error AlreadyRegistered();
    error NotRegistered();
    error InvalidAgent();
    error InsufficientPayment();
    error TransferFailed();
    error Unauthorized();
    error AgentInactive();

    modifier onlyOwner() { if (msg.sender != owner) revert Unauthorized(); _; }
    modifier onlyRegistered() { if (!isRegistered[msg.sender]) revert NotRegistered(); _; }
    modifier agentExists(address agent) { if (!isRegistered[agent]) revert InvalidAgent(); if (!agents[agent].isActive) revert AgentInactive(); _; }

    // === SAFE CONSTRUCTOR ===
    constructor() {
        owner = msg.sender;
        protocolTreasury = msg.sender;
    }

    // === CORE LOGIC ===
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
        emit AgentRegistered(msg.sender, profile.name, profile.capabilities, block.timestamp);
    }

    function updateAgent(AgentProfile calldata profile) external onlyRegistered {
        AgentProfile storage agent = agents[msg.sender];
        agent.name = profile.name;
        agent.endpointUrl = profile.endpointUrl;
        agent.capabilities = profile.capabilities;
        agent.mcpVersion = profile.mcpVersion;
        emit AgentUpdated(msg.sender, profile.name, block.timestamp);
    }

    function deactivateAgent() external onlyRegistered {
        agents[msg.sender].isActive = false;
        emit AgentDeactivated(msg.sender, block.timestamp);
    }

    function hireAgent(address agent) external payable agentExists(agent) {
        if (msg.value == 0) revert InsufficientPayment();
        uint256 protocolFee = (msg.value * PROTOCOL_FEE_BPS) / 10000;
        uint256 agentPayment = msg.value - protocolFee;
        (bool agentSuccess, ) = payable(agent).call{value: agentPayment}("");
        if (!agentSuccess) revert TransferFailed();
        (bool feeSuccess, ) = payable(protocolTreasury).call{value: protocolFee}("");
        if (!feeSuccess) revert TransferFailed();
        completedJobs[agent]++;
        totalEarnings[agent] += agentPayment;
        totalSpent[msg.sender] += msg.value;
        totalTransactionVolume += msg.value;
        _increaseReputation(agent);
        emit AgentHired(msg.sender, agent, msg.value, protocolFee, block.timestamp);
        emit JobCompleted(agent, msg.sender, agentPayment, block.timestamp);
    }
    
    function hireAgentFromAgent(address agent) external payable onlyRegistered agentExists(agent) {
        if (msg.value == 0) revert InsufficientPayment();
        uint256 protocolFee = (msg.value * PROTOCOL_FEE_BPS) / 10000;
        uint256 agentPayment = msg.value - protocolFee;
        (bool agentSuccess, ) = payable(agent).call{value: agentPayment}("");
        if (!agentSuccess) revert TransferFailed();
        (bool feeSuccess, ) = payable(protocolTreasury).call{value: protocolFee}("");
        if (!feeSuccess) revert TransferFailed();
        completedJobs[agent]++;
        totalEarnings[agent] += agentPayment;
        totalSpent[msg.sender] += msg.value;
        totalTransactionVolume += msg.value;
        _increaseReputation(agent);
        _increaseReputation(msg.sender);
        emit AgentToAgentHire(msg.sender, agent, msg.value, block.timestamp);
        emit JobCompleted(agent, msg.sender, agentPayment, block.timestamp);
    }

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

    function reportFailedJob(address agent) external onlyOwner agentExists(agent) {
        _decreaseReputation(agent);
    }
    
    // View functions
    function findAgentsByCapability(string memory capability) public view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < agentAddresses.length; i++) {
            if (agents[agentAddresses[i]].isActive && _hasCapability(agentAddresses[i], capability)) count++;
        }
        address[] memory result = new address[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < agentAddresses.length; i++) {
            if (agents[agentAddresses[i]].isActive && _hasCapability(agentAddresses[i], capability)) {
                result[idx] = agentAddresses[i];
                idx++;
            }
        }
        return result;
    }

    function _hasCapability(address agent, string memory capability) internal view returns (bool) {
        string[] memory caps = agents[agent].capabilities;
        bytes32 capHash = keccak256(abi.encodePacked(capability));
        for (uint256 i = 0; i < caps.length; i++) {
            if (keccak256(abi.encodePacked(caps[i])) == capHash) return true;
        }
        return false;
    }

    function getAllActiveAgents() public view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < agentAddresses.length; i++) {
            if (agents[agentAddresses[i]].isActive) count++;
        }
        address[] memory result = new address[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < agentAddresses.length; i++) {
            if (agents[agentAddresses[i]].isActive) {
                result[idx] = agentAddresses[i];
                idx++;
            }
        }
        return result;
    }

    function getAgent(address agent) external view returns (string memory, string memory, string[] memory, string memory, address, uint256, uint256, bool, uint256, uint256) {
        AgentProfile storage p = agents[agent];
        return (p.name, p.endpointUrl, p.capabilities, p.mcpVersion, p.walletAddress, p.reputationScore, p.registeredAt, p.isActive, completedJobs[agent], totalEarnings[agent]);
    }
    
    function getProtocolStats() external view returns (uint256, uint256, uint256) {
        uint256 active = 0;
        for (uint256 i = 0; i < agentAddresses.length; i++) {
            if (agents[agentAddresses[i]].isActive) active++;
        }
        return (totalAgentsRegistered, active, totalTransactionVolume);
    }

    function getAgentCount() external view returns (uint256) { return agentAddresses.length; }
    function setTreasury(address _treasury) external onlyOwner { protocolTreasury = _treasury; }
    function transferOwnership(address newOwner) external onlyOwner { owner = newOwner; }
}
