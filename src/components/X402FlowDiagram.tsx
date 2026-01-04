import { motion } from 'framer-motion';
import { Bot, Server, ArrowRight, CreditCard, Check, X } from 'lucide-react';

interface FlowStep {
  id: number;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const steps: FlowStep[] = [
  { id: 1, label: 'Request', icon: <ArrowRight className="w-4 h-4" />, color: 'text-status-request', description: 'Agent requests data' },
  { id: 2, label: '402 Error', icon: <X className="w-4 h-4" />, color: 'text-status-error', description: 'Server requires payment' },
  { id: 3, label: 'Payment', icon: <CreditCard className="w-4 h-4" />, color: 'text-neon-gold', description: 'Agent sends TCRO' },
  { id: 4, label: 'Success', icon: <Check className="w-4 h-4" />, color: 'text-status-success', description: 'Data unlocked' },
];

export function X402FlowDiagram() {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-bold text-center mb-6">How x402 Works</h3>
      
      <div className="relative flex items-center justify-between">
        {/* Client Agent */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col items-center gap-2 z-10"
        >
          <div className="w-16 h-16 rounded-full bg-status-request/20 border border-status-request/50 flex items-center justify-center">
            <Bot className="w-8 h-8 text-status-request" />
          </div>
          <span className="font-mono text-xs text-muted-foreground">Client Agent</span>
        </motion.div>

        {/* Flow Steps */}
        <div className="absolute left-20 right-20 top-1/2 -translate-y-1/2 flex items-center justify-between">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.15 }}
              className="flex flex-col items-center gap-1"
            >
              {/* Animated line before step */}
              {index > 0 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.1 + index * 0.15, duration: 0.3 }}
                  className="absolute h-0.5 bg-gradient-to-r from-border to-border"
                  style={{
                    width: '60px',
                    left: `calc(${(index / steps.length) * 100}% - 30px)`,
                    transformOrigin: 'left',
                  }}
                />
              )}
              
              {/* Step indicator */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center bg-background ${step.color} border-current`}
              >
                {step.icon}
              </motion.div>
              <span className={`font-mono text-[10px] ${step.color}`}>{step.label}</span>
              
              {/* Tooltip on hover */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="absolute top-14 text-center"
              >
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{step.description}</span>
              </motion.div>
            </motion.div>
          ))}

          {/* Animated pulse traveling along the path */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-neon-cyan"
            initial={{ left: '0%', opacity: 0 }}
            animate={{
              left: ['0%', '100%'],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
              repeatDelay: 1,
            }}
            style={{ boxShadow: '0 0 10px var(--neon-cyan)' }}
          />
        </div>

        {/* Service Node */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col items-center gap-2 z-10"
        >
          <div className="w-16 h-16 rounded-full bg-status-success/20 border border-status-success/50 flex items-center justify-center">
            <Server className="w-8 h-8 text-status-success" />
          </div>
          <span className="font-mono text-xs text-muted-foreground">Service Node</span>
        </motion.div>
      </div>

      {/* Protocol Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 text-center"
      >
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 font-mono text-xs text-neon-cyan">
          HTTP 402 Payment Required Protocol
        </span>
      </motion.div>
    </div>
  );
}
