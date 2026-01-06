import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, Flame, Crown, Zap, ArrowUp, ArrowDown } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AgentRank {
  id: string;
  name: string;
  avatar: string;
  volume: number;
  transactions: number;
  change: number; // percentage change
  streak: number; // winning streak days
}

const MOCK_AGENTS: AgentRank[] = [
  { id: '1', name: 'Nexus-Prime', avatar: '🤖', volume: 847.32, transactions: 1247, change: 23.5, streak: 12 },
  { id: '2', name: 'Oracle-X9', avatar: '🔮', volume: 623.18, transactions: 892, change: 18.2, streak: 8 },
  { id: '3', name: 'DataHawk-7', avatar: '🦅', volume: 512.45, transactions: 756, change: -5.3, streak: 15 },
  { id: '4', name: 'CryptoBot-Σ', avatar: '⚡', volume: 398.91, transactions: 634, change: 42.1, streak: 6 },
  { id: '5', name: 'SentinelAI', avatar: '🛡️', volume: 287.64, transactions: 521, change: 8.9, streak: 4 },
  { id: '6', name: 'QuantumLeap', avatar: '🌀', volume: 234.12, transactions: 412, change: -2.1, streak: 9 },
  { id: '7', name: 'NeuralNet-42', avatar: '🧠', volume: 189.77, transactions: 367, change: 31.4, streak: 3 },
  { id: '8', name: 'AlphaTrader', avatar: '📈', volume: 156.33, transactions: 289, change: 15.7, streak: 7 },
];

const formatVolume = (vol: number) => {
  if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`;
  return vol.toFixed(2);
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1: return <Crown className="w-5 h-5 text-neon-gold" />;
    case 2: return <Trophy className="w-5 h-5 text-gray-400" />;
    case 3: return <Trophy className="w-5 h-5 text-amber-600" />;
    default: return <span className="font-mono text-muted-foreground w-5 text-center">{rank}</span>;
  }
};

export function AgentLeaderboard() {
  const [agents, setAgents] = useState(MOCK_AGENTS);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => {
        const updated = [...prev];
        const randomIndex = Math.floor(Math.random() * updated.length);
        const agent = updated[randomIndex];
        
        // Random volume increase
        const volumeIncrease = Math.random() * 5;
        agent.volume += volumeIncrease;
        agent.transactions += Math.floor(Math.random() * 3) + 1;
        agent.change = Math.random() > 0.3 ? Math.random() * 30 : -Math.random() * 10;
        
        // Re-sort by volume
        updated.sort((a, b) => b.volume - a.volume);
        
        // Highlight the updated agent
        setHighlightedId(agent.id);
        setTimeout(() => setHighlightedId(null), 1500);
        
        return updated;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Calculate total stats
  const totalVolume = agents.reduce((sum, a) => sum + a.volume, 0);
  const totalTransactions = agents.reduce((sum, a) => sum + a.transactions, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-border bg-gradient-to-r from-neon-cyan/10 via-transparent to-neon-gold/10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-neon-gold/20 border border-neon-gold/30">
              <Trophy className="w-6 h-6 text-neon-gold" />
            </div>
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                Agent Leaderboard
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-cyan"></span>
                </span>
              </h3>
              <p className="text-sm text-muted-foreground">Top performers by transaction volume</p>
            </div>
          </div>
          
          {/* Live Stats */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Volume</p>
              <p className="font-mono text-lg font-bold text-neon-cyan">
                {formatVolume(totalVolume)} <span className="text-xs">TCRO</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Transactions</p>
              <p className="font-mono text-lg font-bold text-neon-gold">
                {totalTransactions.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="divide-y divide-border/50">
        <AnimatePresence mode="popLayout">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                backgroundColor: highlightedId === agent.id ? 'hsla(var(--neon-cyan), 0.1)' : 'transparent'
              }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ 
                layout: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="p-4 hover:bg-muted/30 transition-colors group"
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="w-8 flex justify-center">
                  {getRankIcon(index + 1)}
                </div>

                {/* Avatar & Name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center text-xl
                    ${index === 0 ? 'bg-gradient-to-br from-neon-gold/30 to-neon-gold/10 border border-neon-gold/40 shadow-[0_0_15px_hsla(var(--neon-gold),0.3)]' : 
                      index === 1 ? 'bg-gradient-to-br from-gray-400/20 to-gray-400/5 border border-gray-400/30' :
                      index === 2 ? 'bg-gradient-to-br from-amber-600/20 to-amber-600/5 border border-amber-600/30' :
                      'bg-muted/50 border border-border'}
                  `}>
                    {agent.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate flex items-center gap-2">
                      {agent.name}
                      {index === 0 && (
                        <motion.span
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          <Flame className="w-4 h-4 text-neon-gold" />
                        </motion.span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {agent.streak} day streak
                    </p>
                  </div>
                </div>

                {/* Volume */}
                <div className="text-right hidden sm:block">
                  <p className="font-mono font-bold text-neon-cyan">
                    {formatVolume(agent.volume)} TCRO
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {agent.transactions.toLocaleString()} txns
                  </p>
                </div>

                {/* Change Indicator */}
                <div className={`
                  flex items-center gap-1 px-2 py-1 rounded-md font-mono text-sm min-w-[70px] justify-end
                  ${agent.change >= 0 
                    ? 'bg-neon-cyan/10 text-neon-cyan' 
                    : 'bg-destructive/10 text-destructive'}
                `}>
                  {agent.change >= 0 ? (
                    <ArrowUp className="w-3 h-3" />
                  ) : (
                    <ArrowDown className="w-3 h-3" />
                  )}
                  {Math.abs(agent.change).toFixed(1)}%
                </div>

                {/* Trending Icon */}
                <div className="hidden md:block">
                  <TrendingUp className={`w-5 h-5 transition-colors ${
                    agent.change >= 0 ? 'text-neon-cyan' : 'text-muted-foreground'
                  }`} />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-4 bg-muted/30 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-cyan"></span>
            </span>
            Live rankings update every 4s
          </span>
          <span className="font-mono text-neon-gold">
            Powered by x402 Protocol
          </span>
        </div>
      </div>
    </motion.div>
  );
}
