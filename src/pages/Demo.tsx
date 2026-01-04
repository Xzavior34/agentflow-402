import { motion } from 'framer-motion';
import { DemoConsole } from '@/components/DemoConsole';
import { X402FlowDiagram } from '@/components/X402FlowDiagram';
import { ExternalLink, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Demo() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto h-full flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neon-gold/30 bg-neon-gold/10 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-gold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-gold"></span>
            </span>
            <span className="font-mono text-sm text-neon-gold">Real Blockchain Transactions</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            x402 <span className="text-neon-cyan">Demo Console</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Step through the HTTP 402 payment flow with real Cronos testnet transactions. 
            Watch as agents negotiate, pay, and exchange data autonomously.
          </p>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-neon-cyan flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">Need testnet CRO?</span>{' '}
              Get free test tokens from the Cronos faucet to try the demo.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="font-mono gap-2 whitespace-nowrap"
            onClick={() => window.open('https://cronos.org/faucet', '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
            Get Testnet CRO
          </Button>
        </motion.div>

        {/* How x402 Works Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <X402FlowDiagram />
        </motion.div>

        {/* Demo Console */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 min-h-[600px]"
        >
          <DemoConsole />
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-wrap justify-center gap-6 text-sm font-mono"
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-status-request" />
            <span className="text-muted-foreground">Request</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-status-error" />
            <span className="text-muted-foreground">402 Error</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neon-gold" />
            <span className="text-muted-foreground">Payment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-status-success" />
            <span className="text-muted-foreground">Success</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
