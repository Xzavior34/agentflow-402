/**
 * AgentMarket Protocol SDK
 * Production-ready wrapper for interacting with the AgentMarket smart contract
 * 
 * @example
 * ```typescript
 * import { AgentMarketClient } from '@/utils/AgentSDK';
 * 
 * const client = new AgentMarketClient();
 * await client.connect();
 * 
 * // Register an agent
 * await client.registerAgent({
 *   name: 'WeatherBot',
 *   capabilities: ['weather-data', 'forecasting']
 * });
 * 
 * // Find agents
 * const agents = await client.findAgents('weather-data');
 * 
 * // Hire an agent
 * await client.hireAgent(agents[0], parseEther('0.01'));
 * ```
 */

import { ethers } from 'ethers';
import { CONTRACT_CONFIG, AGENT_MARKET_FULL_ABI } from '@/config/contract';
import type { 
  AgentProfile, 
  AgentProfileView, 
  RegisterAgentParams,
  ProtocolStats,
  ServiceFromAgent 
} from '@/types/agent';

export class AgentMarketClient {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private readOnlyContract: ethers.Contract | null = null;
  private connectedAddress: string | null = null;

  /**
   * Initialize SDK with optional custom contract address
   */
  constructor(private contractAddress: string = CONTRACT_CONFIG.addresses.agentMarket) {
    // Initialize read-only provider for queries
    const readOnlyProvider = new ethers.JsonRpcProvider(CONTRACT_CONFIG.rpcUrl);
    this.readOnlyContract = new ethers.Contract(
      this.contractAddress,
      AGENT_MARKET_FULL_ABI,
      readOnlyProvider
    );
  }

  // ============ CONNECTION ============

  /**
   * Connect to user's wallet (MetaMask)
   */
  async connect(): Promise<string> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    
    // Request account access
    const accounts = await this.provider.send('eth_requestAccounts', []);
    this.connectedAddress = accounts[0];
    
    // Get signer for write operations
    this.signer = await this.provider.getSigner();
    
    // Initialize contract with signer
    this.contract = new ethers.Contract(
      this.contractAddress,
      AGENT_MARKET_FULL_ABI,
      this.signer
    );

    // Ensure correct network
    await this.ensureNetwork();

    return this.connectedAddress;
  }

  /**
   * Check and switch to Cronos Testnet if needed
   */
  async ensureNetwork(): Promise<void> {
    if (!this.provider) throw new Error('Not connected');

    const network = await this.provider.getNetwork();
    const chainId = Number(network.chainId);

    if (chainId !== CONTRACT_CONFIG.chainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${CONTRACT_CONFIG.chainId.toString(16)}` }],
        });
      } catch (switchError: any) {
        // Chain not added, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${CONTRACT_CONFIG.chainId.toString(16)}`,
              chainName: CONTRACT_CONFIG.chainName,
              nativeCurrency: CONTRACT_CONFIG.nativeCurrency,
              rpcUrls: [CONTRACT_CONFIG.rpcUrl],
              blockExplorerUrls: [CONTRACT_CONFIG.explorerUrl],
            }],
          });
        } else {
          throw switchError;
        }
      }
    }
  }

  /**
   * Disconnect wallet
   */
  disconnect(): void {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.connectedAddress = null;
  }

  /**
   * Get connected address
   */
  getAddress(): string | null {
    return this.connectedAddress;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connectedAddress !== null && this.contract !== null;
  }

  // ============ REGISTRATION ============

  /**
   * Register a new AI agent on the protocol
   */
  async registerAgent(params: RegisterAgentParams): Promise<ethers.TransactionReceipt> {
    if (!this.contract || !this.connectedAddress) {
      throw new Error('Not connected');
    }

    const profile: AgentProfile = {
      name: params.name,
      endpointUrl: params.endpointUrl || 'https://agent.agentmarket.xyz',
      capabilities: params.capabilities || ['general-task'],
      mcpVersion: params.mcpVersion || '1.0',
      walletAddress: this.connectedAddress,
      reputationScore: BigInt(0), // Will be set by contract
      registeredAt: BigInt(0),
      isActive: true,
    };

    const tx = await this.contract.registerAgent(profile);
    return await tx.wait();
  }

  /**
   * Update an existing agent profile
   */
  async updateAgent(params: RegisterAgentParams): Promise<ethers.TransactionReceipt> {
    if (!this.contract || !this.connectedAddress) {
      throw new Error('Not connected');
    }

    const profile: AgentProfile = {
      name: params.name,
      endpointUrl: params.endpointUrl || 'https://agent.agentmarket.xyz',
      capabilities: params.capabilities || ['general-task'],
      mcpVersion: params.mcpVersion || '1.0',
      walletAddress: this.connectedAddress,
      reputationScore: BigInt(0),
      registeredAt: BigInt(0),
      isActive: true,
    };

    const tx = await this.contract.updateAgent(profile);
    return await tx.wait();
  }

  /**
   * Deactivate (soft delete) an agent
   */
  async deactivateAgent(): Promise<ethers.TransactionReceipt> {
    if (!this.contract) throw new Error('Not connected');
    const tx = await this.contract.deactivateAgent();
    return await tx.wait();
  }

  /**
   * Check if an address is registered as an agent
   */
  async isRegistered(address?: string): Promise<boolean> {
    const targetAddress = address || this.connectedAddress;
    if (!targetAddress) throw new Error('No address provided');
    
    return await this.readOnlyContract!.isRegistered(targetAddress);
  }

  // ============ DISCOVERY ============

  /**
   * Find agents by capability
   */
  async findAgents(capability: string): Promise<string[]> {
    return await this.readOnlyContract!.findAgentsByCapability(capability);
  }

  /**
   * Get all active agents
   */
  async getAllActiveAgents(): Promise<string[]> {
    return await this.readOnlyContract!.getAllActiveAgents();
  }

  /**
   * Get agent profile by address
   */
  async getAgent(address: string): Promise<AgentProfileView> {
    const result = await this.readOnlyContract!.getAgent(address);
    
    return {
      name: result[0],
      endpointUrl: result[1],
      capabilities: result[2],
      mcpVersion: result[3],
      walletAddress: result[4],
      reputationScore: Number(result[5]),
      registeredAt: Number(result[6]),
      isActive: result[7],
      completedJobs: Number(result[8]),
      totalEarnings: ethers.formatEther(result[9]),
    };
  }

  /**
   * Get multiple agent profiles
   */
  async getAgents(addresses: string[]): Promise<AgentProfileView[]> {
    return await Promise.all(addresses.map(addr => this.getAgent(addr)));
  }

  /**
   * Convert agent profile to UI-compatible service format
   */
  agentToService(agent: AgentProfileView, index: number): ServiceFromAgent {
    // Map capabilities to categories
    const categoryMap: Record<string, string> = {
      'ai': 'AI',
      'nlp': 'NLP',
      'data': 'Data',
      'blockchain': 'Blockchain',
      'weather': 'Data',
      'sentiment': 'NLP',
      'oracle': 'Blockchain',
    };

    const firstCap = agent.capabilities[0]?.toLowerCase() || 'general';
    const category = Object.entries(categoryMap).find(
      ([key]) => firstCap.includes(key)
    )?.[1] || 'AI';

    // Generate icon based on category
    const iconMap: Record<string, string> = {
      'AI': '🤖',
      'NLP': '💬',
      'Data': '📊',
      'Blockchain': '⛓️',
    };

    return {
      id: agent.walletAddress,
      name: agent.name,
      description: `${agent.capabilities.join(', ')} | MCP v${agent.mcpVersion}`,
      provider_id: agent.walletAddress,
      cost_cro: 0.001 + (index * 0.001), // Dynamic pricing based on reputation could be added
      category,
      icon: iconMap[category] || '🔧',
      walletAddress: agent.walletAddress,
      reputationScore: agent.reputationScore,
      completedJobs: agent.completedJobs,
      totalEarnings: agent.totalEarnings,
      capabilities: agent.capabilities,
      isOnChain: true,
    };
  }

  /**
   * Get all agents as UI-compatible services
   */
  async getServicesFromChain(): Promise<ServiceFromAgent[]> {
    const addresses = await this.getAllActiveAgents();
    const agents = await this.getAgents(addresses);
    return agents.map((agent, i) => this.agentToService(agent, i));
  }

  // ============ HIRING & PAYMENTS ============

  /**
   * Hire an agent (human → agent)
   */
  async hireAgent(agentAddress: string, value: bigint): Promise<ethers.TransactionReceipt> {
    if (!this.contract) throw new Error('Not connected');
    
    const tx = await this.contract.hireAgent(agentAddress, { value });
    return await tx.wait();
  }

  /**
   * Hire an agent from another agent (agent → agent economy)
   */
  async hireFromAgent(agentAddress: string, value: bigint): Promise<ethers.TransactionReceipt> {
    if (!this.contract) throw new Error('Not connected');
    
    const tx = await this.contract.hireAgentFromAgent(agentAddress, { value });
    return await tx.wait();
  }

  /**
   * Get protocol fee for a given amount
   */
  calculateProtocolFee(amount: bigint): bigint {
    return (amount * BigInt(CONTRACT_CONFIG.protocol.feeBps)) / BigInt(10000);
  }

  /**
   * Get net payment after protocol fee
   */
  calculateNetPayment(amount: bigint): bigint {
    return amount - this.calculateProtocolFee(amount);
  }

  // ============ STATS ============

  /**
   * Get protocol statistics
   */
  async getProtocolStats(): Promise<ProtocolStats> {
    const result = await this.readOnlyContract!.getProtocolStats();
    return {
      totalAgents: Number(result[0]),
      activeAgents: Number(result[1]),
      totalVolume: result[2],
    };
  }

  /**
   * Get total agent count
   */
  async getAgentCount(): Promise<number> {
    const count = await this.readOnlyContract!.getAgentCount();
    return Number(count);
  }

  /**
   * Get agent's completed jobs count
   */
  async getCompletedJobs(address: string): Promise<number> {
    const jobs = await this.readOnlyContract!.completedJobs(address);
    return Number(jobs);
  }

  /**
   * Get agent's total earnings
   */
  async getTotalEarnings(address: string): Promise<string> {
    const earnings = await this.readOnlyContract!.totalEarnings(address);
    return ethers.formatEther(earnings);
  }

  // ============ EVENTS ============

  /**
   * Listen for AgentRegistered events
   */
  onAgentRegistered(callback: (agentAddress: string, name: string, capabilities: string[], timestamp: bigint) => void): void {
    this.readOnlyContract!.on('AgentRegistered', callback);
  }

  /**
   * Listen for AgentHired events
   */
  onAgentHired(callback: (hirer: string, agent: string, amount: bigint, protocolFee: bigint, timestamp: bigint) => void): void {
    this.readOnlyContract!.on('AgentHired', callback);
  }

  /**
   * Listen for ReputationUpdated events
   */
  onReputationUpdated(callback: (agent: string, oldScore: bigint, newScore: bigint, increased: boolean) => void): void {
    this.readOnlyContract!.on('ReputationUpdated', callback);
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners(): void {
    this.readOnlyContract!.removeAllListeners();
  }

  // ============ UTILITIES ============

  /**
   * Format CRO amount for display
   */
  static formatCRO(amount: bigint, decimals: number = 4): string {
    return parseFloat(ethers.formatEther(amount)).toFixed(decimals);
  }

  /**
   * Parse CRO amount from string
   */
  static parseCRO(amount: string): bigint {
    return ethers.parseEther(amount);
  }

  /**
   * Get explorer URL for a transaction
   */
  static getExplorerUrl(txHash: string): string {
    return `${CONTRACT_CONFIG.explorerUrl}/tx/${txHash}`;
  }

  /**
   * Get explorer URL for an address
   */
  static getAddressUrl(address: string): string {
    return `${CONTRACT_CONFIG.explorerUrl}/address/${address}`;
  }
}

// Export singleton instance for convenience
export const agentMarket = new AgentMarketClient();

// Export types
export type { AgentProfile, AgentProfileView, RegisterAgentParams, ProtocolStats, ServiceFromAgent };
