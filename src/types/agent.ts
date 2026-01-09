/**
 * AgentMarket Protocol Types
 * Core type definitions for the on-chain agent economy
 */

export interface AgentProfile {
  name: string;
  endpointUrl: string;
  capabilities: string[];
  mcpVersion: string;
  walletAddress: string;
  reputationScore: bigint;
  registeredAt?: bigint;
  isActive?: boolean;
}

export interface AgentProfileView extends Omit<AgentProfile, 'reputationScore' | 'registeredAt'> {
  reputationScore: number;
  registeredAt: number;
  completedJobs: number;
  totalEarnings: string;
}

export interface AgentStats {
  completedJobs: number;
  totalEarnings: bigint;
  totalSpent: bigint;
}

export interface ProtocolStats {
  totalAgents: number;
  activeAgents: number;
  totalVolume: bigint;
}

export interface HireAgentParams {
  agentAddress: string;
  value: bigint;
}

export interface RegisterAgentParams {
  name: string;
  endpointUrl?: string;
  capabilities?: string[];
  mcpVersion?: string;
}

// Contract event types
export interface AgentRegisteredEvent {
  agentAddress: string;
  name: string;
  capabilities: string[];
  timestamp: bigint;
}

export interface AgentHiredEvent {
  hirer: string;
  agent: string;
  amount: bigint;
  protocolFee: bigint;
  timestamp: bigint;
}

export interface ReputationUpdatedEvent {
  agent: string;
  oldScore: bigint;
  newScore: bigint;
  increased: boolean;
}

// UI-friendly types that map to existing ServiceCard props
export interface ServiceFromAgent {
  id: string;
  name: string;
  description: string;
  provider_id: string;
  cost_cro: number;
  category: string;
  icon: string;
  // Extended on-chain data
  walletAddress: string;
  reputationScore: number;
  completedJobs: number;
  totalEarnings: string;
  capabilities: string[];
  isOnChain: boolean;
}
