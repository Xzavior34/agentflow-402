import { motion } from 'framer-motion';
import { CheckCircle, ExternalLink, Copy, Download, X, Clock, Fuel, Hash, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface TransactionReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  txHash: string;
  explorerUrl: string;
  amount: string;
  serviceName: string;
}

export function TransactionReceipt({
  isOpen,
  onClose,
  txHash,
  explorerUrl,
  amount,
  serviceName,
}: TransactionReceiptProps) {
  const shortHash = txHash ? `${txHash.slice(0, 10)}...${txHash.slice(-8)}` : '';
  const timestamp = new Date().toLocaleTimeString();

  const handleCopyHash = () => {
    navigator.clipboard.writeText(txHash);
    toast.success('Transaction hash copied!');
  };

  const handleDownloadJSON = () => {
    const receiptData = {
      transaction: {
        hash: txHash,
        network: 'Cronos Testnet',
        chainId: 338,
        status: 'confirmed',
        timestamp: new Date().toISOString(),
      },
      payment: {
        amount: amount,
        currency: 'TCRO',
        gasUsed: '< 0.001 TCRO',
        settlementTime: '0.4s',
      },
      service: {
        name: serviceName,
        provider: 'Agent-Weather-1',
        version: 'v1.0',
      },
      protocol: {
        name: 'x402',
        httpStatus: 402,
        description: 'HTTP Payment Required Protocol',
      },
    };

    const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `x402-receipt-${txHash.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Receipt downloaded!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-status-success/30 overflow-hidden">
        {/* Success glow effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-status-success/10 to-transparent pointer-events-none" />
        
        <DialogHeader className="relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="mx-auto mb-4"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-status-success/20 flex items-center justify-center neon-glow-green">
                <CheckCircle className="w-10 h-10 text-status-success" />
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="w-5 h-5 text-neon-gold" />
              </motion.div>
            </div>
          </motion.div>
          
          <DialogTitle className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-status-success/20 text-status-success font-mono text-sm mb-2">
                PAYMENT SUCCESSFUL
              </span>
              <p className="text-lg font-semibold text-foreground mt-2">Transaction Receipt</p>
            </motion.div>
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative space-y-4"
        >
          {/* Receipt details */}
          <div className="space-y-3 p-4 rounded-lg bg-muted/50 border border-border font-mono text-sm">
            {/* Transaction Hash */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Hash className="w-4 h-4" />
                <span>TX Hash</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyHash}
                  className="text-neon-cyan hover:text-neon-cyan/80 transition-colors cursor-pointer"
                >
                  {shortHash}
                </button>
                <Copy 
                  className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" 
                  onClick={handleCopyHash}
                />
              </div>
            </div>

            {/* Gas Used */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Fuel className="w-4 h-4" />
                <span>Gas Used</span>
              </div>
              <span className="text-neon-gold">&lt; 0.001 TCRO</span>
            </div>

            {/* Settlement Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Settlement</span>
              </div>
              <span className="text-status-success">0.4s</span>
            </div>

            {/* Divider */}
            <div className="border-t border-border my-2" />

            {/* Service Unlocked */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Service Unlocked</span>
              <span className="text-foreground">{serviceName}</span>
            </div>

            {/* Amount Paid */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="text-neon-gold font-semibold">{amount} TCRO</span>
            </div>

            {/* Timestamp */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Timestamp</span>
              <span className="text-foreground">{timestamp}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1 font-mono gap-2"
              onClick={() => window.open(`${explorerUrl}tx/${txHash}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
              View on Explorer
            </Button>
            <Button
              variant="outline"
              className="flex-1 font-mono gap-2"
              onClick={handleDownloadJSON}
            >
              <Download className="w-4 h-4" />
              Download JSON
            </Button>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-status-success hover:bg-status-success/90 text-background font-mono"
          >
            Close Receipt
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
