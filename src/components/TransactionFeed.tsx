import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Zap } from 'lucide-react';

interface Transaction {
  id: string;
  from_agent: string;
  to_agent: string;
  service_name: string;
  amount_cro: number;
  created_at: string;
}

export function TransactionFeed() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Fetch initial transactions
    const fetchTransactions = async () => {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (data) {
        setTransactions(data);
      }
    };

    fetchTransactions();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('transactions-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transactions' },
        (payload) => {
          setTransactions(prev => [payload.new as Transaction, ...prev.slice(0, 19)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Double the transactions for seamless loop
  const tickerItems = [...transactions, ...transactions];

  if (transactions.length === 0) {
    return (
      <div className="h-10 bg-muted/30 border-y border-border flex items-center justify-center">
        <span className="text-muted-foreground text-sm font-mono">Loading transaction feed...</span>
      </div>
    );
  }

  return (
    <div className="h-10 bg-muted/30 border-y border-border overflow-hidden">
      <div className="h-full flex items-center">
        <div className="flex items-center gap-2 px-4 border-r border-border bg-background/50">
          <Zap className="w-4 h-4 text-neon-cyan" />
          <span className="text-xs font-mono text-neon-cyan uppercase tracking-wider">Live</span>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <motion.div
            className="flex items-center gap-8 whitespace-nowrap ticker-scroll"
            animate={{ x: [0, '-50%'] }}
            transition={{ 
              duration: 30, 
              repeat: Infinity, 
              ease: 'linear' 
            }}
          >
            {tickerItems.map((tx, index) => (
              <div key={`${tx.id}-${index}`} className="flex items-center gap-2 text-sm font-mono">
                <span className="text-muted-foreground">{tx.from_agent}</span>
                <ArrowRight className="w-3 h-3 text-neon-cyan" />
                <span className="text-neon-gold">{tx.amount_cro} CRO</span>
                <span className="text-muted-foreground">for</span>
                <span className="text-foreground">{tx.service_name}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
