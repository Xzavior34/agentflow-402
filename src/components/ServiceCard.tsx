import { motion } from 'framer-motion';
import { 
  Image, Brain, Cloud, Wallet, Languages, TrendingUp, Zap 
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
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  image: Image,
  brain: Brain,
  cloud: Cloud,
  wallet: Wallet,
  languages: Languages,
  'trending-up': TrendingUp,
  zap: Zap,
};

export function ServiceCard({ 
  id, name, description, provider_id, cost_cro, category, icon, onSelect 
}: ServiceCardProps) {
  const IconComponent = iconMap[icon] || Zap;

  const handlePing = () => {
    toast.success(`${name} is online!`, {
      description: `Response time: ${Math.floor(Math.random() * 50 + 10)}ms`,
    });
  };

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
        <span className="text-xs font-mono px-2 py-1 rounded bg-muted text-muted-foreground uppercase">
          {category}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="font-semibold text-lg mb-2">{name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
      </div>

      {/* Provider & Cost */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div>
          <p className="text-xs text-muted-foreground">Provider</p>
          <p className="font-mono text-sm text-neon-cyan">{provider_id}</p>
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
          Purchase
        </Button>
      </div>
    </motion.div>
  );
}
