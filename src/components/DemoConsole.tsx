import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TerminalLog, LogEntry, LogType } from './TerminalLog';
import { TransactionReceipt } from './TransactionReceipt';
import { useWallet } from '@/hooks/useWallet';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useHireAgent } from '@/hooks/useAgentContract';
import { agentMarket, AgentMarketClient } from '@/utils/AgentSDK';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import confetti from 'canvas-confetti';
import { CONTRACT_CONFIG } from '@/config/contract';

// Demo service configuration
const DEMO_SERVICE_ADDRESS = CONTRACT_CONFIG.addresses.agentMarket !== '0x0000000000000000000000000000000000000000'
  ? CONTRACT_CONFIG.addresses.agentMarket 
  : '0x000000000000000000000000000000000000dead'; // Fallback for pre-deployment
const DEMO_SERVICE_NAME = 'Weather Oracle v1';
const DEMO_COST_CRO = '0.0001';

type DemoStep = 'idle' | 'awaiting_payment' | 'verifying' | 'success';

interface DemoState {
  step: DemoStep;
  clientLogs: LogEntry[];
  serverLogs: LogEntry[];
  txHash: string | null;
  showReceipt: boolean;
  useOnChainHire: boolean; // Toggle between direct transfer and hireAgent
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
  const { playTerminalBeep, playErrorBeep, playPaymentBeep, playSuccessChime } = useSoundEffects();
  const { hire, isHiring, txHash: hireTxHash } = useHireAgent();
  
  const [state, setState] = useState<DemoState>({
    step: 'idle',
    clientLogs: [],
    serverLogs: [],
    txHash: null,
    showReceipt: false,
    useOnChainHire: CONTRACT_CONFIG.addresses.agentMarket !== '0x0000000000000000000000000000000000000000',
  });

  const addClientLog = useCallback((type: LogType, message: string, data?: string) => {
    playTerminalBeep();
    setState(prev => ({
      ...prev,
      clientLogs: [...prev.clientLogs, createLogEntry(type, message, data)],
    }));
  }, [playTerminalBeep]);

  const addServerLog = useCallback((type: LogType, message: string, data?: string) => {
    playTerminalBeep();
    setState(prev => ({
      ...prev,
      serverLogs: [...prev.serverLogs, createLogEntry(type, message, data)],
    }));
  }, [playTerminalBeep]);

  const setStep = useCallback((step: DemoStep) => {
    setState(prev => ({ ...prev, step }));
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00ffff', '#ffd700', '#00ff00'],
    });
  };

  // Handle on-chain hire using the SDK
  const handleOnChainHire = async (): Promise<string | null> => {
    try {
      // Connect SDK if not connected
      if (!agentMarket.isConnected()) {
        await agentMarket.connect();
      }

      addClientLog('payment', 'Calling hireAgent() on AgentMarket contract...');
      addServerLog('info', 'Awaiting on-chain hire transaction...');

      const value = AgentMarketClient.parseCRO(DEMO_COST_CRO);
      const receipt = await agentMarket.hireAgent(DEMO_SERVICE_ADDRESS, value);
      
      addClientLog('success', 'hireAgent() transaction confirmed!');
      addServerLog('payment', `On-chain hire verified! TX: ${receipt.hash.slice(0, 20)}...`);
      
      return receipt.hash;
    } catch (error: any) {
      console.error('On-chain hire failed:', error);
      // Fall back to direct transfer
      addClientLog('warning', 'Contract call failed, falling back to direct transfer...');
      return null;
    }
  };

  // Single-click flow: Request -> 402 -> Wallet -> Verify -> Success
  const handleRequestData = useCallback(async () => {
    if (!isConnected) {
      toast.error('Connect your wallet first!');
      return;
    }

    // Step 1: Client sends request
    addClientLog('info', 'Initializing Agent-Client v2.4.1...');
    addClientLog('request', 'GET /api/weather-data HTTP/1.1');
    addClientLog('request', 'Host: agent-weather-1.agentmarket.io');
    addClientLog('info', 'Awaiting response from Service Node...');

    // Small delay for visual effect
    await new Promise(r => setTimeout(r, 400));

    // Step 2: Server responds with 402 - show while waiting for wallet
    addServerLog('info', 'Incoming request from Agent-Client...');
    addServerLog('warning', 'No valid payment token detected');
    playErrorBeep();
    addServerLog('error', 'HTTP/1.1 402 Payment Required', JSON.stringify({
      error: 'PAYMENT_REQUIRED',
      invoice: {
        amount: DEMO_COST_CRO,
        currency: 'TCRO',
        network: 'cronos-testnet',
        payTo: DEMO_SERVICE_ADDRESS,
        validFor: '60s',
        service: 'weather-data-v1',
        protocol: state.useOnChainHire ? 'AgentMarket.hireAgent()' : 'direct-transfer'
      },
      message: 'Payment required to access this resource'
    }, null, 2));

    setStep('awaiting_payment');
    playErrorBeep();
    addClientLog('error', 'Received HTTP 402: Payment Required');
    addClientLog('info', `Invoice: ${DEMO_COST_CRO} TCRO to ${DEMO_SERVICE_ADDRESS.slice(0, 10)}...`);
    playPaymentBeep();
    
    if (state.useOnChainHire) {
      addClientLog('payment', 'Using AgentMarket protocol for on-chain hire...');
    } else {
      addClientLog('payment', 'Initiating wallet transaction...');
    }
    addServerLog('warning', 'Awaiting blockchain payment...');

    // Step 3: Trigger wallet transaction
    toast.loading('Sign the transaction in MetaMask...', { id: 'signing' });

    try {
      let txHash: string | null = null;

      // Try on-chain hire first if enabled
      if (state.useOnChainHire) {
        txHash = await handleOnChainHire();
      }

      // Fall back to direct transfer if on-chain hire fails or is disabled
      if (!txHash) {
        txHash = await sendTransaction(DEMO_SERVICE_ADDRESS, DEMO_COST_CRO);
      }

      toast.dismiss('signing');

      if (!txHash) {
        addClientLog('error', 'Transaction failed or rejected');
        addServerLog('error', 'Payment timeout - request cancelled');
        setStep('idle');
        toast.error('Transaction cancelled');
        return;
      }

      // Step 4: Transaction sent, now verifying
      setState(prev => ({ ...prev, txHash }));
      setStep('verifying');

      addClientLog('success', 'Transaction signed and broadcast!');
      addClientLog('payment', `TX Hash: ${txHash}`);
      
      addServerLog('payment', 'Payment detected on chain...');
      addServerLog('info', `Verifying TX: ${txHash.slice(0, 20)}...`);

      // Log transaction to Supabase
      await supabase.from('transactions').insert({
        from_agent: `Agent-${address?.slice(2, 8)}`,
        to_agent: 'Agent-Weather-1',
        service_name: 'Weather Oracle',
        amount_cro: parseFloat(DEMO_COST_CRO),
        tx_hash: txHash,
        status: 'completed',
      });

      // Simulate verification delay
      await new Promise(r => setTimeout(r, 1500));

      // Step 5: Success!
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
        },
        payment: {
          verified: true,
          txHash: txHash,
          amount: DEMO_COST_CRO,
          method: state.useOnChainHire ? 'AgentMarket.hireAgent()' : 'direct-transfer',
          protocolFee: state.useOnChainHire ? '2%' : '0%'
        }
      }, null, 2));

      addClientLog('success', 'Data received successfully!');
      addClientLog('info', 'x402 transaction complete.');

      setStep('success');
      playSuccessChime();
      triggerConfetti();
      
      // Show receipt after 1 second delay
      setTimeout(() => {
        setState(prev => ({ ...prev, showReceipt: true }));
      }, 1000);
      
      toast.success('🎉 x402 Flow Complete!', {
        description: state.useOnChainHire 
          ? 'Agent hired via on-chain protocol with reputation update!'
          : 'The agent successfully paid for and received data.',
        duration: 5000,
      });

    } catch (error: any) {
      toast.dismiss('signing');
      addClientLog('error', `Transaction failed: ${error.message || 'Unknown error'}`);
      addServerLog('error', 'Payment timeout - request cancelled');
      setStep('idle');
      toast.error('Transaction failed');
    }
  }, [isConnected, address, sendTransaction, addClientLog, addServerLog, setStep, playErrorBeep, playPaymentBeep, playSuccessChime, state.useOnChainHire]);

  // Reset Demo
  const handleReset = useCallback(() => {
    setState({
      step: 'idle',
      clientLogs: [],
      serverLogs: [],
      txHash: null,
      showReceipt: false,
      useOnChainHire: CONTRACT_CONFIG.addresses.agentMarket !== '0x0000000000000000000000000000000000000000',
    });
    toast.info('Demo reset. Ready to start again!');
  }, []);

  const handleCloseReceipt = useCallback(() => {
    setState(prev => ({ ...prev, showReceipt: false }));
  }, []);

  const getStepStatus = () => {
    switch (state.step) {
      case 'idle': return 'Ready to demo';
      case 'awaiting_payment': return 'Awaiting wallet confirmation...';
      case 'verifying': return 'Verifying payment...';
      case 'success': return 'Payment complete!';
    }
  };

  const getStepColor = () => {
    switch (state.step) {
      case 'idle': return 'text-muted-foreground';
      case 'awaiting_payment': return 'text-status-error animate-pulse';
      case 'verifying': return 'text-neon-gold animate-pulse';
      case 'success': return 'text-status-success';
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
              state.step === 'awaiting_payment' ? 'bg-status-error animate-pulse' :
              state.step === 'verifying' ? 'bg-neon-gold animate-pulse' :
              'bg-status-success animate-pulse'
            }`} />
            <span className={`font-mono text-sm uppercase ${getStepColor()}`}>
              {getStepStatus()}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {!isConnected ? (
            <Button onClick={connect} variant="outline" className="font-mono">
              Connect Wallet First
            </Button>
          ) : state.step === 'idle' ? (
            <Button 
              onClick={handleRequestData} 
              className="bg-neon-cyan hover:bg-neon-cyan/90 text-background font-mono gap-2"
            >
              <Play className="w-4 h-4" />
              Request Data
            </Button>
          ) : state.step === 'awaiting_payment' || state.step === 'verifying' ? (
            <Button disabled className="font-mono gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {state.step === 'awaiting_payment' ? 'Awaiting Wallet...' : 'Verifying...'}
            </Button>
          ) : (
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
          )}
        </div>
      </div>

      {/* Split Terminal View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        <div className={`h-[400px] lg:h-full transition-all duration-300 ${
          state.step === 'awaiting_payment' ? 'ring-2 ring-status-error/50' : ''
        }`}>
          <TerminalLog
            title="Client Agent"
            subtitle="agent-client.local"
            entries={state.clientLogs}
            isActive={state.step === 'awaiting_payment' || state.step === 'verifying'}
            variant="client"
          />
        </div>
        <div className={`h-[400px] lg:h-full transition-all duration-300 ${
          state.step === 'awaiting_payment' ? 'ring-2 ring-status-error/50 animate-pulse' :
          state.step === 'verifying' ? 'ring-2 ring-neon-gold/50' :
          state.step === 'success' ? 'ring-2 ring-status-success/50' : ''
        }`}>
          <TerminalLog
            title="Service Node"
            subtitle="agent-weather-1.agentmarket.io"
            entries={state.serverLogs}
            isActive={state.step === 'awaiting_payment' || state.step === 'verifying'}
            variant="server"
          />
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex justify-center gap-2 p-4">
        {['idle', 'awaiting_payment', 'verifying', 'success'].map((step, index) => (
          <motion.div
            key={step}
            className={`w-3 h-3 rounded-full transition-all ${
              state.step === step 
                ? step === 'awaiting_payment' ? 'bg-status-error scale-125 animate-pulse' :
                  step === 'verifying' ? 'bg-neon-gold scale-125 animate-pulse' :
                  step === 'success' ? 'bg-status-success scale-125' :
                  'bg-neon-cyan scale-125 neon-glow'
                : index < ['idle', 'awaiting_payment', 'verifying', 'success'].indexOf(state.step)
                  ? 'bg-status-success'
                  : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Transaction Receipt Modal */}
      <TransactionReceipt
        isOpen={state.showReceipt}
        onClose={handleCloseReceipt}
        txHash={state.txHash || ''}
        explorerUrl={explorerUrl}
        amount={DEMO_COST_CRO}
        serviceName={DEMO_SERVICE_NAME}
      />
    </div>
  );
}
