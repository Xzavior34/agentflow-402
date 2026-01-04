import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Bot, Wrench, DollarSign, Activity } from 'lucide-react';

interface TickerItem {
  id: string;
  icon: 'transaction' | 'bot' | 'service' | 'stats';
  message: string;
  highlight?: string;
}

const TICKER_MESSAGES: Omit<TickerItem, 'id'>[] = [
  { icon: 'transaction', message: 'Agent-X9 purchased Weather Oracle Data', highlight: '0.001 TCRO' },
  { icon: 'bot', message: 'Bot-Alpha-7 paid for Sentiment Analysis', highlight: '0.02 TCRO' },
  { icon: 'service', message: 'New Service Listed: Solana Price Feed Oracle' },
  { icon: 'stats', message: '1,402 Transactions settled in the last hour' },
  { icon: 'transaction', message: 'Agent-Gamma purchased NFT Metadata API', highlight: '0.005 TCRO' },
  { icon: 'bot', message: 'DataBot-3 accessed Market Analytics', highlight: '0.015 TCRO' },
  { icon: 'service', message: 'New Service Listed: GPT-4 Translation API' },
  { icon: 'transaction', message: 'Agent-Zeta paid for Image Recognition', highlight: '0.008 TCRO' },
  { icon: 'stats', message: '847 Active Agents connected to marketplace' },
  { icon: 'bot', message: 'TraderBot-X executed Price Feed query', highlight: '0.003 TCRO' },
];

const getIcon = (type: TickerItem['icon']) => {
  switch (type) {
    case 'transaction': return <Zap className="w-4 h-4" />;
    case 'bot': return <Bot className="w-4 h-4" />;
    case 'service': return <Wrench className="w-4 h-4" />;
    case 'stats': return <Activity className="w-4 h-4" />;
  }
};

export function LiveEconomyTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    // Initialize with shuffled messages
    const shuffled = [...TICKER_MESSAGES]
      .sort(() => Math.random() - 0.5)
      .map((item, i) => ({ ...item, id: `ticker-${i}-${Date.now()}` }));
    setItems(shuffled);
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % items.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) return null;

  const currentItem = items[currentIndex];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-t border-border">
      <div className="container mx-auto px-4">
        <div className="h-12 flex items-center justify-center gap-3">
          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-2 pr-4 border-r border-border">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-status-success"></span>
            </span>
            <span className="font-mono text-xs text-status-success uppercase tracking-wider">Live</span>
          </div>

          {/* Ticker content */}
          <div className="flex-1 overflow-hidden max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem.id + currentIndex}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center gap-3 font-mono text-sm"
              >
                <span className="text-status-success">{getIcon(currentItem.icon)}</span>
                <span className="text-foreground">{currentItem.message}</span>
                {currentItem.highlight && (
                  <span className="text-neon-gold font-semibold">({currentItem.highlight})</span>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Stats badge */}
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-border">
            <DollarSign className="w-4 h-4 text-neon-gold" />
            <span className="font-mono text-xs text-muted-foreground">
              <span className="text-neon-gold">24.7K</span> TCRO today
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
