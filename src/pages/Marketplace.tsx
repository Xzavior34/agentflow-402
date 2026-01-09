import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Blocks, Database } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ServiceCard } from '@/components/ServiceCard';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useOnChainServices, useProtocolStats } from '@/hooks/useAgentContract';
import type { ServiceFromAgent } from '@/types/agent';

interface Service {
  id: string;
  name: string;
  description: string;
  provider_id: string;
  cost_cro: number;
  category: string;
  icon: string;
}

// Combined service type for UI
interface CombinedService extends Service {
  walletAddress?: string;
  reputationScore?: number;
  completedJobs?: number;
  totalEarnings?: string;
  capabilities?: string[];
  isOnChain?: boolean;
}

const categories = ['All', 'AI', 'NLP', 'Data', 'Blockchain'];

export default function Marketplace() {
  const [offChainServices, setOffChainServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showOnChainOnly, setShowOnChainOnly] = useState(false);
  const navigate = useNavigate();

  // On-chain data from smart contract
  const { services: onChainServices, loading: onChainLoading } = useOnChainServices();
  const { stats } = useProtocolStats();

  // Fetch off-chain services from Supabase
  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching services:', error);
        toast.error('Failed to load services');
      } else {
        setOffChainServices(data || []);
      }
      setLoading(false);
    };

    fetchServices();
  }, []);

  // Combine on-chain and off-chain services
  const combinedServices: CombinedService[] = useMemo(() => {
    const onChain: CombinedService[] = onChainServices.map((agent: ServiceFromAgent) => ({
      ...agent,
      isOnChain: true,
    }));

    const offChain: CombinedService[] = offChainServices.map(service => ({
      ...service,
      isOnChain: false,
    }));

    if (showOnChainOnly) {
      return onChain;
    }

    // Merge and deduplicate by name
    const all = [...onChain, ...offChain];
    const seen = new Set<string>();
    return all.filter(s => {
      if (seen.has(s.name.toLowerCase())) return false;
      seen.add(s.name.toLowerCase());
      return true;
    });
  }, [onChainServices, offChainServices, showOnChainOnly]);

  const filteredServices = combinedServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectService = (service: Service) => {
    toast.info(`Selected: ${service.name}`, {
      description: 'Redirecting to demo console...',
    });
    navigate('/demo');
  };

  const isLoading = loading || onChainLoading;

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Service <span className="text-neon-cyan">Registry</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Discover APIs and data services offered by autonomous agents. 
            Pay per request with CRO.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-border focus:border-neon-cyan"
            />
          </div>

          {/* On-Chain Toggle */}
          <Button
            variant="outline"
            size="sm"
            className={`font-mono whitespace-nowrap gap-2 ${
              showOnChainOnly
                ? 'bg-neon-gold/10 border-neon-gold text-neon-gold'
                : 'border-border hover:border-neon-gold/50'
            }`}
            onClick={() => setShowOnChainOnly(!showOnChainOnly)}
          >
            <Blocks className="w-4 h-4" />
            On-Chain Only
          </Button>

          {/* Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            {categories.map((category) => (
              <Button
                key={category}
                variant="outline"
                size="sm"
                className={`font-mono whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan'
                    : 'border-border hover:border-neon-cyan/50'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="h-12 w-12 bg-muted rounded-lg mb-4" />
                <div className="h-6 w-3/4 bg-muted rounded mb-2" />
                <div className="h-4 w-full bg-muted rounded mb-4" />
                <div className="h-4 w-1/2 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-mono">No services found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ServiceCard 
                  {...service} 
                  onSelect={handleSelectService}
                  walletAddress={service.walletAddress}
                  reputationScore={service.reputationScore}
                  completedJobs={service.completedJobs}
                  isOnChain={service.isOnChain}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { 
              label: 'Active Services', 
              value: combinedServices.length,
              icon: Blocks 
            },
            { 
              label: 'On-Chain Agents', 
              value: stats?.activeAgents || onChainServices.length,
              icon: Database 
            },
            { 
              label: 'Avg Cost', 
              value: `${(combinedServices.reduce((a, b) => a + b.cost_cro, 0) / combinedServices.length || 0).toFixed(3)} CRO` 
            },
            { label: 'Protocol', value: 'x402' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-neon-cyan font-mono">{stat.value}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
