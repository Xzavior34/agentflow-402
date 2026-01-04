import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, SkipForward, RotateCcw, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TerminalLog, LogEntry, LogType } from './TerminalLog';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import confetti from 'canvas-confetti';

// Demo service provider address (receives payment)
const DEMO_SERVICE_ADDRESS = '0x000000000000000000000000000000000000dead';
const DEMO_COST_CRO = '0.001'; // Small amount for demo

type DemoStep = 'idle' | 'requesting' | 'error402' | 'signing' | 'verifying' | 'success';

interface DemoState {
  step: DemoStep;
  clientLogs: LogEntry[];
  serverLogs: LogEntry[];
  txHash: string | null;
}

const createLogEntry = (type: LogType, message: string, data?: string): LogEntry => ({
  id: crypto.randomUUID(),
  timestamp: new Date(),
  type,
  message,
  data,
});

export function DemoConsole() {
  const { isConnected, address, sendTransaction, connect, explorerUrl } = useWallet();
  
  const [state, setState] = useState<DemoState>({
    step: 'idle',
    clientLogs: [],
    serverLogs: [],
    txHash: null,
  });

  const addClientLog = useCallback((type: LogType, message: string, data?: string) => {
    setState(prev => ({
      ...prev,
      clientLogs: [...prev.clientLogs, createLogEntry(type, message, data)],
    }));
  }, []);

  const addServerLog = useCallback((type: LogType, message: string, data?: string) => {
    setState(prev => ({
      ...prev,
      serverLogs: [...prev.serverLogs, createLogEntry(type, message, data)],
    }));
  }, []);

  const setStep = useCallback((step: DemoStep) => {
    setState(prev => ({ ...prev, step }));
  }, []);

  // Step 1: Request Data
  const handleRequestData = useCallback(() => {
    if (!isConnected) {
      toast.error('Connect your wallet first!');
      return;
    }

    setStep('requesting');
    addClientLog('info', 'Initializing Agent-Client v2.4.1...');
    addClientLog('request', 'GET /api/weather-data HTTP/1.1');
    addClientLog('request', 'Host: agent-weather-1.agentmarket.io');
    addClientLog('info', 'Awaiting response from Service Node...');
    
    toast.info('Request sent! Click "Next Step" to see the response.', {
      duration: 3000,
    });
  }, [isConnected, addClientLog, setStep]);

  // Step 2: Receive 402 Error
  const handleReceive402 = useCallback(() => {
    setStep('error402');
    
    addServerLog('info', 'Incoming request from Agent-Client...');
    addServerLog('warning', 'No valid payment token detected');
    addServerLog('error', 'HTTP/1.1 402 Payment Required', JSON.stringify({
      error: 'PAYMENT_REQUIRED',
      invoice: {
        amount: DEMO_COST_CRO,
        currency: 'CRO',
        network: 'cronos-testnet',
        payTo: DEMO_SERVICE_ADDRESS,
        validFor: '60s',
        service: 'weather-data-v1'
      },
      message: 'Payment required to access this resource'
    }, null, 2));

    addClientLog('error', 'Received HTTP 402: Payment Required');
    addClientLog('info', `Invoice: ${DEMO_COST_CRO} CRO to ${DEMO_SERVICE_ADDRESS.slice(0, 10)}...`);

    toast.error('Access Denied! Payment required.', {
      description: 'Click "Sign & Pay" to send the payment.',
      duration: 5000,
    });
  }, [addClientLog, addServerLog, setStep]);

  // Step 3: Sign and Send Payment
  const handleSignAndPay = useCallback(async () => {
    setStep('signing');
    
    addClientLog('payment', 'Initiating blockchain transaction...');
    addClientLog('info', `Amount: ${DEMO_COST_CRO} CRO`);
    addClientLog('info', `Recipient: ${DEMO_SERVICE_ADDRESS}`);
    addClientLog('info', 'Awaiting wallet signature...');

    toast.loading('Sign the transaction in MetaMask...', { id: 'signing' });

    // Actually send the transaction!
    const txHash = await sendTransaction(DEMO_SERVICE_ADDRESS, DEMO_COST_CRO);
    toast.dismiss('signing');

    if (!txHash) {
      addClientLog('error', 'Transaction failed or rejected');
      setStep('error402');
      return;
    }

    setState(prev => ({ ...prev, txHash }));
    addClientLog('success', 'Transaction signed and broadcast!');
    addClientLog('payment', `TX Hash: ${txHash}`);
    
    // Log transaction to Supabase
    await supabase.from('transactions').insert({
      from_agent: `Agent-${address?.slice(2, 8)}`,
      to_agent: 'Agent-Weather-1',
      service_name: 'Weather Oracle',
      amount_cro: parseFloat(DEMO_COST_CRO),
      tx_hash: txHash,
      status: 'completed',
    });

    toast.success('Payment sent!', {
      description: 'Click "Next Step" to verify payment.',
      action: {
        label: 'View TX',
        onClick: () => window.open(`${explorerUrl}tx/${txHash}`, '_blank'),
      },
    });

    setStep('verifying');
  }, [address, sendTransaction, addClientLog, setStep, explorerUrl]);

  // Step 4: Verify and Release Data
  const handleVerifyPayment = useCallback(() => {
    setStep('success');
    
    addServerLog('payment', 'Payment detected on chain...');
    addServerLog('info', `Verifying TX: ${state.txHash?.slice(0, 20)}...`);
    addServerLog('success', 'Payment verified! Releasing data...');
    addServerLog('success', 'HTTP/1.1 200 OK', JSON.stringify({
      status: 'success',
      data: {
        location: 'San Francisco, CA',
        temperature: 68,
        unit: 'fahrenheit',
        conditions: 'Partly Cloudy',
        humidity: 65,
        wind: { speed: 12, direction: 'NW' },
        forecast: [
          { day: 'Tomorrow', high: 72, low: 58 },
          { day: 'Day After', high: 75, low: 60 }
        ]
      },
      payment: {
        verified: true,
        txHash: state.txHash,
        amount: DEMO_COST_CRO
      }
    }, null, 2));

    addClientLog('success', 'Data received successfully!');
    addClientLog('info', 'x402 transaction complete.');

    // Celebration!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00ffff', '#ffd700', '#00ff00'],
    });

    toast.success('🎉 x402 Flow Complete!', {
      description: 'The agent successfully paid for and received data.',
      duration: 5000,
    });
  }, [state.txHash, addClientLog, addServerLog, setStep]);

  // Reset Demo
  const handleReset = useCallback(() => {
    setState({
      step: 'idle',
      clientLogs: [],
      serverLogs: [],
      txHash: null,
    });
    toast.info('Demo reset. Ready to start again!');
  }, []);

  // Get current action button
  const getActionButton = () => {
    switch (state.step) {
      case 'idle':
        return (
          <Button 
            onClick={handleRequestData} 
            className="bg-status-request hover:bg-status-request/90 text-white font-mono gap-2"
            disabled={!isConnected}
          >
            <Play className="w-4 h-4" />
            Request Data
          </Button>
        );
      case 'requesting':
        return (
          <Button 
            onClick={handleReceive402} 
            className="bg-neon-cyan hover:bg-neon-cyan/90 text-background font-mono gap-2"
          >
            <SkipForward className="w-4 h-4" />
            Next Step
          </Button>
        );
      case 'error402':
        return (
          <Button 
            onClick={handleSignAndPay} 
            className="bg-neon-gold hover:bg-neon-gold/90 text-background font-mono gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Sign & Pay ({DEMO_COST_CRO} CRO)
          </Button>
        );
      case 'signing':
        return (
          <Button disabled className="font-mono gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Awaiting Signature...
          </Button>
        );
      case 'verifying':
        return (
          <Button 
            onClick={handleVerifyPayment} 
            className="bg-status-success hover:bg-status-success/90 text-white font-mono gap-2"
          >
            <SkipForward className="w-4 h-4" />
            Verify & Release
          </Button>
        );
      case 'success':
        return (
          <div className="flex gap-2">
            <Button 
              onClick={handleReset} 
              variant="outline"
              className="font-mono gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Demo
            </Button>
            {state.txHash && (
              <Button 
                variant="outline"
                className="font-mono gap-2"
                onClick={() => window.open(`${explorerUrl}tx/${state.txHash}`, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
                View Transaction
              </Button>
            )}
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Control Bar */}
      <div className="flex items-center justify-between p-4 glass-card">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              state.step === 'idle' ? 'bg-muted' :
              state.step === 'success' ? 'bg-status-success animate-pulse' :
              'bg-neon-cyan animate-pulse'
            }`} />
            <span className="font-mono text-sm text-muted-foreground uppercase">
              Step: {state.step}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {!isConnected && (
            <Button onClick={connect} variant="outline" className="font-mono">
              Connect Wallet First
            </Button>
          )}
          {getActionButton()}
        </div>
      </div>

      {/* Split Terminal View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        <div className="h-[400px] lg:h-full">
          <TerminalLog
            title="Client Agent"
            subtitle="agent-client.local"
            entries={state.clientLogs}
            isActive={state.step === 'requesting' || state.step === 'signing'}
            variant="client"
          />
        </div>
        <div className="h-[400px] lg:h-full">
          <TerminalLog
            title="Service Node"
            subtitle="agent-weather-1.agentmarket.io"
            entries={state.serverLogs}
            isActive={state.step === 'error402' || state.step === 'verifying'}
            variant="server"
          />
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex justify-center gap-2 p-4">
        {['idle', 'requesting', 'error402', 'signing', 'verifying', 'success'].map((step, index) => (
          <motion.div
            key={step}
            className={`w-3 h-3 rounded-full transition-all ${
              state.step === step 
                ? 'bg-neon-cyan neon-glow scale-125' 
                : index < ['idle', 'requesting', 'error402', 'signing', 'verifying', 'success'].indexOf(state.step)
                  ? 'bg-status-success'
                  : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
