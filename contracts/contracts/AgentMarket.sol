// SPDX-License-Identifier: MIT
pragma solidity 0.8.19; // Using 0.8.19 for maximum zkEVM stability

contract AgentMarket {
    // === STRUCTS ===
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

    // === STATE ===
    mapping(address => AgentProfile) public agents;
    address[] public agentAddresses;
    mapping(address => bool) public isRegistered;
    
    mapping(address => uint256) public completedJobs;
    mapping(address => uint256) public totalEarnings;
    mapping(address => uint256) public totalSpent;
    
    uint256 public constant PROTOCOL_FEE_BPS = 200; 
    uint256 public constant REPUTATION_GAIN = 5;
    
    address public protocolTreasury;
    address public owner;
    
    uint256 public totalTransactionVolume;
    uint256 public totalAgentsRegistered;

    // === EVENTS ===
    event AgentRegistered(address indexed agent, string name, uint256 timestamp);
    event AgentHired(address indexed hirer, address indexed agent, uint256 amount, uint256 fee, uint256 timestamp);
    event JobCompleted(address indexed agent, address indexed client, uint256 amount, uint256 timestamp);

    // === ERRORS ===
    error AlreadyRegistered();
    error NotRegistered();
    error InsufficientPayment();
    error TransferFailed();
    error Unauthorized();

    // === SAFETY CONSTRUCTOR ===
    // No arguments. Cannot fail.
    constructor() {
        owner = msg.sender;
        protocolTreasury = msg.sender; 
    }

    // === CORE FUNCTIONS ===
    function registerAgent(AgentProfile calldata profile) external {
        if (isRegistered[msg.sender]) revert AlreadyRegistered();
        
        AgentProfile storage newAgent = agents[msg.sender];
        newAgent.name = profile.name;
        newAgent.endpointUrl = profile.endpointUrl;
        newAgent.capabilities = profile.capabilities;
        newAgent.mcpVersion = profile.mcpVersion;
        newAgent.walletAddress = msg.sender;
        newAgent.reputationScore = 100;
        newAgent.registeredAt = block.timestamp;
        newAgent.isActive = true;
        
        agentAddresses.push(msg.sender);
        isRegistered[msg.sender] = true;
        totalAgentsRegistered++;
        
        emit AgentRegistered(msg.sender, profile.name, block.timestamp);
    }

    function hireAgent(address agent) external payable {
        if (!isRegistered[agent]) revert NotRegistered();
        if (msg.value == 0) revert InsufficientPayment();
        
        uint256 fee = (msg.value * PROTOCOL_FEE_BPS) / 10000;
        uint256 payment = msg.value - fee;
        
        (bool successAgent, ) = payable(agent).call{value: payment}("");
        if (!successAgent) revert TransferFailed();
        
        (bool successTreasury, ) = payable(protocolTreasury).call{value: fee}("");
        if (!successTreasury) revert TransferFailed();
        
        completedJobs[agent]++;
        totalEarnings[agent] += payment;
        totalSpent[msg.sender] += msg.value;
        totalTransactionVolume += msg.value;
        
        emit AgentHired(msg.sender, agent, msg.value, fee, block.timestamp);
        emit JobCompleted(agent, msg.sender, payment, block.timestamp);
    }

    function getAgent(address agent) external view returns (string memory name, string memory endpointUrl, uint256 reputation, bool active) {
        return (agents[agent].name, agents[agent].endpointUrl, agents[agent].reputationScore, agents[agent].isActive);
    }
    
    function setTreasury(address _treasury) external {
        if (msg.sender != owner) revert Unauthorized();
        protocolTreasury = _treasury;
    }
}
