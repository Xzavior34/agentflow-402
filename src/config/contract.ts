/**
 * AgentMarket Contract Configuration
 * Cronos Testnet deployment settings
 */

// Network configurations
export const NETWORK_CONFIGS = {
  cronosZkEvm: {
    chainId: 240,
    chainName: 'Cronos zkEVM Testnet',
    rpcUrl: 'https://testnet.zkevm.cronos.org',
    explorerUrl: 'https://explorer.zkevm.cronos.org',
    nativeCurrency: {
      name: 'Test CRO',
      symbol: 'TCRO',
      decimals: 18,
    },
  },
  cronosTestnet: {
    chainId: 338,
    chainName: 'Cronos Testnet',
    rpcUrl: 'https://evm-t3.cronos.org/',
    explorerUrl: 'https://explorer.cronos.org/testnet',
    nativeCurrency: {
      name: 'Test CRO',
      symbol: 'TCRO',
      decimals: 18,
    },
  },
} as const;

// Active network (switch between zkEVM and regular testnet)
const ACTIVE_NETWORK: keyof typeof NETWORK_CONFIGS = 'cronosZkEvm';

export const CONTRACT_CONFIG = {
  // Use active network config
  ...NETWORK_CONFIGS[ACTIVE_NETWORK],
  
  // Contract addresses (auto-updated by deploy script)
  addresses: {
    agentMarket: '0x0000000000000000000000000000000000000000', // TODO: Deploy and update
    treasury: '0x0000000000000000000000000000000000000000',
  },
  
  // Protocol constants (match contract)
  protocol: {
    feeBps: 200, // 2%
    baseReputation: 100,
    reputationGain: 5,
    reputationLoss: 3,
  },
} as const;

// Contract ABI - essential functions only for gas optimization
export const AGENT_MARKET_ABI = [
  // Read functions
  'function agents(address) view returns (string name, string endpointUrl, string mcpVersion, address walletAddress, uint256 reputationScore, uint256 registeredAt, bool isActive)',
  'function isRegistered(address) view returns (bool)',
  'function completedJobs(address) view returns (uint256)',
  'function totalEarnings(address) view returns (uint256)',
  'function totalSpent(address) view returns (uint256)',
  'function getAgent(address) view returns (string name, string endpointUrl, string[] capabilities, string mcpVersion, address walletAddress, uint256 reputationScore, uint256 registeredAt, bool isActive, uint256 jobs, uint256 earnings)',
  'function getAllActiveAgents() view returns (address[])',
  'function findAgentsByCapability(string) view returns (address[])',
  'function getProtocolStats() view returns (uint256 totalAgents, uint256 activeAgents, uint256 volume)',
  'function getAgentCount() view returns (uint256)',
  
  // Write functions
  'function registerAgent(tuple(string name, string endpointUrl, string[] capabilities, string mcpVersion, address walletAddress, uint256 reputationScore, uint256 registeredAt, bool isActive) profile)',
  'function updateAgent(tuple(string name, string endpointUrl, string[] capabilities, string mcpVersion, address walletAddress, uint256 reputationScore, uint256 registeredAt, bool isActive) profile)',
  'function deactivateAgent()',
  'function hireAgent(address agent) payable',
  'function hireAgentFromAgent(address agent) payable',
  
  // Events
  'event AgentRegistered(address indexed agentAddress, string name, string[] capabilities, uint256 timestamp)',
  'event AgentHired(address indexed hirer, address indexed agent, uint256 amount, uint256 protocolFee, uint256 timestamp)',
  'event AgentToAgentHire(address indexed hiringAgent, address indexed hiredAgent, uint256 amount, uint256 timestamp)',
  'event ReputationUpdated(address indexed agent, uint256 oldScore, uint256 newScore, bool increased)',
  'event JobCompleted(address indexed agent, address indexed client, uint256 amount, uint256 timestamp)',
] as const;

// Full ABI for ethers.js Contract
export const AGENT_MARKET_FULL_ABI = [
  {
    inputs: [{ internalType: 'address', name: '_treasury', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  { inputs: [], name: 'AgentInactive', type: 'error' },
  { inputs: [], name: 'AlreadyRegistered', type: 'error' },
  { inputs: [], name: 'InsufficientPayment', type: 'error' },
  { inputs: [], name: 'InvalidAgent', type: 'error' },
  { inputs: [], name: 'NotRegistered', type: 'error' },
  { inputs: [], name: 'TransferFailed', type: 'error' },
  { inputs: [], name: 'Unauthorized', type: 'error' },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'hirer', type: 'address' },
      { indexed: true, internalType: 'address', name: 'agent', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'protocolFee', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'AgentHired',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'agentAddress', type: 'address' },
      { indexed: false, internalType: 'string', name: 'name', type: 'string' },
      { indexed: false, internalType: 'string[]', name: 'capabilities', type: 'string[]' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'AgentRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'hiringAgent', type: 'address' },
      { indexed: true, internalType: 'address', name: 'hiredAgent', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'AgentToAgentHire',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'agent', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'oldScore', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'newScore', type: 'uint256' },
      { indexed: false, internalType: 'bool', name: 'increased', type: 'bool' },
    ],
    name: 'ReputationUpdated',
    type: 'event',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'agents',
    outputs: [
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'string', name: 'endpointUrl', type: 'string' },
      { internalType: 'string', name: 'mcpVersion', type: 'string' },
      { internalType: 'address', name: 'walletAddress', type: 'address' },
      { internalType: 'uint256', name: 'reputationScore', type: 'uint256' },
      { internalType: 'uint256', name: 'registeredAt', type: 'uint256' },
      { internalType: 'bool', name: 'isActive', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'completedJobs',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'deactivateAgent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: 'capability', type: 'string' }],
    name: 'findAgentsByCapability',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'agent', type: 'address' }],
    name: 'getAgent',
    outputs: [
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'string', name: 'endpointUrl', type: 'string' },
      { internalType: 'string[]', name: 'capabilities', type: 'string[]' },
      { internalType: 'string', name: 'mcpVersion', type: 'string' },
      { internalType: 'address', name: 'walletAddress', type: 'address' },
      { internalType: 'uint256', name: 'reputationScore', type: 'uint256' },
      { internalType: 'uint256', name: 'registeredAt', type: 'uint256' },
      { internalType: 'bool', name: 'isActive', type: 'bool' },
      { internalType: 'uint256', name: 'jobs', type: 'uint256' },
      { internalType: 'uint256', name: 'earnings', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAgentCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllActiveAgents',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getProtocolStats',
    outputs: [
      { internalType: 'uint256', name: 'totalAgents', type: 'uint256' },
      { internalType: 'uint256', name: 'activeAgents', type: 'uint256' },
      { internalType: 'uint256', name: 'volume', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'agent', type: 'address' }],
    name: 'hireAgent',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'agent', type: 'address' }],
    name: 'hireAgentFromAgent',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'isRegistered',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'string', name: 'name', type: 'string' },
          { internalType: 'string', name: 'endpointUrl', type: 'string' },
          { internalType: 'string[]', name: 'capabilities', type: 'string[]' },
          { internalType: 'string', name: 'mcpVersion', type: 'string' },
          { internalType: 'address', name: 'walletAddress', type: 'address' },
          { internalType: 'uint256', name: 'reputationScore', type: 'uint256' },
          { internalType: 'uint256', name: 'registeredAt', type: 'uint256' },
          { internalType: 'bool', name: 'isActive', type: 'bool' },
        ],
        internalType: 'struct AgentMarket.AgentProfile',
        name: 'profile',
        type: 'tuple',
      },
    ],
    name: 'registerAgent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'totalEarnings',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'totalSpent',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'string', name: 'name', type: 'string' },
          { internalType: 'string', name: 'endpointUrl', type: 'string' },
          { internalType: 'string[]', name: 'capabilities', type: 'string[]' },
          { internalType: 'string', name: 'mcpVersion', type: 'string' },
          { internalType: 'address', name: 'walletAddress', type: 'address' },
          { internalType: 'uint256', name: 'reputationScore', type: 'uint256' },
          { internalType: 'uint256', name: 'registeredAt', type: 'uint256' },
          { internalType: 'bool', name: 'isActive', type: 'bool' },
        ],
        internalType: 'struct AgentMarket.AgentProfile',
        name: 'profile',
        type: 'tuple',
      },
    ],
    name: 'updateAgent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
