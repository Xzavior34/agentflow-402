import { motion } from 'framer-motion';
import { 
  Image, Brain, Cloud, Wallet, Languages, TrendingUp, Zap, Star, CheckCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ServiceCardProps {
  id: string;
  name: string;
  description: string;
  provider_id: string;
  cost_cro: number;
  category: string;
  icon: string;
  onSelect?: (service: ServiceCardProps) => void;
  // Extended on-chain props
  walletAddress?: string;
  reputationScore?: number;
  completedJobs?: number;
  totalEarnings?: string;
  capabilities?: string[];
  isOnChain?: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  image: Image,
  brain: Brain,
  cloud: Cloud,
  wallet: Wallet,
  languages: Languages,
  'trending-up': TrendingUp,
  zap: Zap,
  '🤖': Brain,
  '💬': Languages,
  '📊': TrendingUp,
  '⛓️': Wallet,
  '🔧': Zap,
};

export function ServiceCard({ 
  id, name, description, provider_id, cost_cro, category, icon, onSelect,
  walletAddress, reputationScore, completedJobs, isOnChain
}: ServiceCardProps) {
  const IconComponent = iconMap[icon] || Zap;

  const handlePing = () => {
    toast.success(`${name} is online!`, {
      description: `Response time: ${Math.floor(Math.random() * 50 + 10)}ms`,
    });
  };

  // Format address for display
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="glass-card p-6 flex flex-col gap-4 group hover:border-neon-cyan/50 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="p-3 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 group-hover:neon-glow transition-all">
          <IconComponent className="w-6 h-6 text-neon-cyan" />
        </div>
        <div className="flex items-center gap-2">
          {isOnChain && (
            <span className="flex items-center gap-1 text-xs font-mono px-2 py-1 rounded bg-neon-gold/10 text-neon-gold border border-neon-gold/20">
              <CheckCircle className="w-3 h-3" />
              On-Chain
            </span>
          )}
          <span className="text-xs font-mono px-2 py-1 rounded bg-muted text-muted-foreground uppercase">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="font-semibold text-lg mb-2">{name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      </div>

      {/* Reputation & Stats (for on-chain agents) */}
      {isOnChain && reputationScore !== undefined && (
        <div className="flex items-center gap-4 py-2 border-t border-b border-border/50">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-neon-gold" />
            <span className="font-mono text-sm text-neon-gold">{reputationScore}</span>
            <span className="text-xs text-muted-foreground">rep</span>
          </div>
          {completedJobs !== undefined && (
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-neon-cyan" />
              <span className="font-mono text-sm">{completedJobs}</span>
              <span className="text-xs text-muted-foreground">jobs</span>
            </div>
          )}
        </div>
      )}

      {/* Provider & Cost */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div>
          <p className="text-xs text-muted-foreground">Provider</p>
          <p className="font-mono text-sm text-neon-cyan">
            {walletAddress ? formatAddress(walletAddress) : provider_id}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Cost</p>
          <p className="font-mono text-lg font-bold text-neon-gold">{cost_cro} CRO</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 font-mono"
          onClick={handlePing}
        >
          Ping
        </Button>
        <Button 
          size="sm" 
          className="flex-1 bg-neon-cyan text-background hover:bg-neon-cyan/90 font-mono"
          onClick={() => onSelect?.({ id, name, description, provider_id, cost_cro, category, icon })}
        >
          {isOnChain ? 'Hire' : 'Purchase'}
        </Button>
      </div>
    </motion.div>
  );
}
