import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export type LogType = 'request' | 'error' | 'payment' | 'success' | 'info' | 'warning';

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: LogType;
  message: string;
  data?: string;
}

interface TerminalLogProps {
  title: string;
  subtitle?: string;
  entries: LogEntry[];
  isActive?: boolean;
  variant?: 'client' | 'server';
}

const typeStyles: Record<LogType, { color: string; prefix: string }> = {
  request: { color: 'text-status-request', prefix: '→' },
  error: { color: 'text-status-error', prefix: '✗' },
  payment: { color: 'text-neon-gold', prefix: '$' },
  success: { color: 'text-status-success', prefix: '✓' },
  info: { color: 'text-muted-foreground', prefix: 'ℹ' },
  warning: { color: 'text-neon-gold', prefix: '⚠' },
};

function TypewriterText({ text, speed = 20 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span>
      {displayedText}
      {displayedText.length < text.length && <span className="animate-pulse">▋</span>}
    </span>
  );
}

export function TerminalLog({ title, subtitle, entries, isActive, variant = 'client' }: TerminalLogProps) {
  const formatTime = (date: Date) => {
    const time = date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
    });
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    return `${time}.${ms}`;
  };

  return (
    <div className={`terminal h-full flex flex-col ${isActive ? 'pulse-neon' : ''}`}>
      {/* Terminal Header */}
      <div className="terminal-header">
        <div className="flex gap-1.5">
          <div className={`terminal-dot ${variant === 'client' ? 'bg-status-request' : 'bg-status-success'}`} />
          <div className="terminal-dot bg-neon-gold" />
          <div className="terminal-dot bg-muted" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-xs font-mono text-muted-foreground">{title}</span>
          {subtitle && (
            <span className="text-xs font-mono text-muted-foreground/50 ml-2">— {subtitle}</span>
          )}
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <AnimatePresence mode="popLayout">
          {entries.map((entry, index) => {
            const style = typeStyles[entry.type];
            const isLatest = index === entries.length - 1;
            
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0.5 }}
                transition={{ duration: 0.3 }}
                className="font-mono text-xs leading-relaxed"
              >
                <span className="text-muted-foreground/50">[{formatTime(entry.timestamp)}]</span>
                <span className={`${style.color} mx-2`}>{style.prefix}</span>
                {isLatest ? (
                  <TypewriterText text={entry.message} speed={15} />
                ) : (
                  <span className={style.color}>{entry.message}</span>
                )}
                {entry.data && (
                  <motion.pre 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-2 ml-6 p-3 bg-muted/50 rounded border border-border overflow-x-auto"
                  >
                    {entry.data}
                  </motion.pre>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {entries.length === 0 && (
          <div className="text-muted-foreground/50 text-center py-8 font-mono text-xs">
            Waiting for commands...
          </div>
        )}
      </div>
    </div>
  );
}
