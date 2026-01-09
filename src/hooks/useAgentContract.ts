/**
 * React hooks for AgentMarket Protocol
 * Provides reactive state management for contract interactions
 */

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { AgentMarketClient, agentMarket } from '@/utils/AgentSDK';
import type { 
  AgentProfileView, 
  ProtocolStats, 
  RegisterAgentParams,
  ServiceFromAgent 
} from '@/types/agent';
import { toast } from 'sonner';

// ============ PROTOCOL STATS HOOK ============

export function useProtocolStats() {
  const [stats, setStats] = useState<ProtocolStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await agentMarket.getProtocolStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

// ============ AGENTS LIST HOOK ============

export function useAgents() {
  const [agents, setAgents] = useState<AgentProfileView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const addresses = await agentMarket.getAllActiveAgents();
      const profiles = await agentMarket.getAgents(addresses);
      setAgents(profiles);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return { agents, loading, error, refetch: fetchAgents };
}

// ============ SERVICES FROM CHAIN HOOK ============

export function useOnChainServices() {
  const [services, setServices] = useState<ServiceFromAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await agentMarket.getServicesFromChain();
      setServices(data);
      setError(null);
    } catch (err) {
      // Fallback - contract might not be deployed yet
      console.warn('Could not fetch on-chain services:', err);
      setError(err as Error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return { services, loading, error, refetch: fetchServices };
}

// ============ SINGLE AGENT HOOK ============

export function useAgent(address: string | null) {
  const [agent, setAgent] = useState<AgentProfileView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!address) {
      setAgent(null);
      return;
    }

    const fetch = async () => {
      try {
        setLoading(true);
        const data = await agentMarket.getAgent(address);
        setAgent(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [address]);

  return { agent, loading, error };
}

// ============ AGENT REGISTRATION HOOK ============

export function useAgentRegistration() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const checkRegistration = useCallback(async (address: string) => {
    try {
      const registered = await agentMarket.isRegistered(address);
      setIsRegistered(registered);
      return registered;
    } catch (err) {
      console.error('Failed to check registration:', err);
      return false;
    }
  }, []);

  const register = useCallback(async (params: RegisterAgentParams) => {
    try {
      setIsRegistering(true);
      setError(null);

      // Connect if not connected
      if (!agentMarket.isConnected()) {
        await agentMarket.connect();
      }

      const receipt = await agentMarket.registerAgent(params);
      
      toast.success('Agent Registered!', {
        description: `TX: ${receipt.hash.slice(0, 10)}...`,
      });

      setIsRegistered(true);
      return receipt;
    } catch (err: any) {
      const error = err as Error;
      setError(error);
      
      // Handle specific errors
      if (error.message.includes('AlreadyRegistered')) {
        toast.error('Already registered as an agent');
        setIsRegistered(true);
      } else {
        toast.error('Registration failed', {
          description: error.message,
        });
      }
      throw error;
    } finally {
      setIsRegistering(false);
    }
  }, []);

  return { register, isRegistering, isRegistered, checkRegistration, error };
}

// ============ HIRE AGENT HOOK ============

export function useHireAgent() {
  const [isHiring, setIsHiring] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const hire = useCallback(async (agentAddress: string, amountCRO: string) => {
    try {
      setIsHiring(true);
      setError(null);
      setTxHash(null);

      // Connect if not connected
      if (!agentMarket.isConnected()) {
        await agentMarket.connect();
      }

      const value = ethers.parseEther(amountCRO);
      const receipt = await agentMarket.hireAgent(agentAddress, value);
      
      setTxHash(receipt.hash);
      
      toast.success('Agent Hired Successfully!', {
        description: `Paid ${amountCRO} TCRO`,
      });

      return receipt;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Hire failed', {
        description: error.message,
      });
      throw error;
    } finally {
      setIsHiring(false);
    }
  }, []);

  const hireFromAgent = useCallback(async (agentAddress: string, amountCRO: string) => {
    try {
      setIsHiring(true);
      setError(null);
      setTxHash(null);

      if (!agentMarket.isConnected()) {
        await agentMarket.connect();
      }

      const value = ethers.parseEther(amountCRO);
      const receipt = await agentMarket.hireFromAgent(agentAddress, value);
      
      setTxHash(receipt.hash);
      
      toast.success('Agent-to-Agent Hire Complete!', {
        description: `Autonomous payment: ${amountCRO} TCRO`,
      });

      return receipt;
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Agent hire failed', {
        description: error.message,
      });
      throw error;
    } finally {
      setIsHiring(false);
    }
  }, []);

  const reset = useCallback(() => {
    setTxHash(null);
    setError(null);
  }, []);

  return { 
    hire, 
    hireFromAgent, 
    isHiring, 
    txHash, 
    error, 
    reset,
    getExplorerUrl: () => txHash ? AgentMarketClient.getExplorerUrl(txHash) : null,
  };
}

// ============ FIND AGENTS HOOK ============

export function useFindAgents() {
  const [results, setResults] = useState<AgentProfileView[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback(async (capability: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const addresses = await agentMarket.findAgents(capability);
      const profiles = await agentMarket.getAgents(addresses);
      
      setResults(profiles);
      return profiles;
    } catch (err) {
      setError(err as Error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { search, results, loading, error };
}

// ============ CONTRACT EVENTS HOOK ============

export function useContractEvents() {
  const [recentHires, setRecentHires] = useState<Array<{
    hirer: string;
    agent: string;
    amount: string;
    timestamp: number;
  }>>([]);

  useEffect(() => {
    // Subscribe to AgentHired events
    agentMarket.onAgentHired((hirer, agent, amount, _fee, timestamp) => {
      setRecentHires(prev => [{
        hirer,
        agent,
        amount: ethers.formatEther(amount),
        timestamp: Number(timestamp),
      }, ...prev.slice(0, 9)]); // Keep last 10
    });

    return () => {
      agentMarket.removeAllListeners();
    };
  }, []);

  return { recentHires };
}

// ============ COMBINED MARKETPLACE HOOK ============

/**
 * Combined hook for marketplace page
 * Fetches both on-chain and off-chain services
 */
export function useMarketplace() {
  const { services: onChainServices, loading: onChainLoading, refetch: refetchOnChain } = useOnChainServices();
  const { stats, loading: statsLoading } = useProtocolStats();

  return {
    onChainServices,
    stats,
    loading: onChainLoading || statsLoading,
    refetch: refetchOnChain,
  };
}
