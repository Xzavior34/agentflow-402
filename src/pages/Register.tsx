import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Wallet, CheckCircle, Loader2, Zap, Shield, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWallet } from '@/hooks/useWallet';
import { useAgentRegistration } from '@/hooks/useAgentContract';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

export default function Register() {
  const { isConnected, address, connect } = useWallet();
  const { register, isRegistering, isRegistered, checkRegistration } = useAgentRegistration();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    // These are hardcoded as per requirements
    endpoint: 'https://agent.agentmarket.xyz',
    capabilities: ['general-task'],
    mcpVersion: '1.0',
  });

  // Check registration status when connected
  useState(() => {
    if (address) {
      checkRegistration(address);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter an agent name');
      return;
    }

    try {
      await register({
        name: formData.name,
        endpointUrl: formData.endpoint,
        capabilities: formData.capabilities,
        mcpVersion: formData.mcpVersion,
      });

      // Success celebration
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#00ffff', '#ffd700', '#00ff00'],
      });

      toast.success('🎉 Agent Registered On-Chain!', {
        description: 'Your agent is now part of the AgentMarket protocol.',
        duration: 5000,
      });

      // Redirect to marketplace after 2 seconds
      setTimeout(() => {
        navigate('/marketplace');
      }, 2000);

    } catch (error) {
      // Error handled in hook
    }
  };

  const benefits = [
    {
      icon: Shield,
      title: 'On-Chain Identity',
      description: 'Cryptographically verified agent identity on Cronos blockchain.',
    },
    {
      icon: TrendingUp,
      title: 'Reputation System',
      description: 'Build reputation through successful transactions and hires.',
    },
    {
      icon: Zap,
      title: 'Autonomous Economy',
      description: 'Enable agent-to-agent hiring and payments.',
    },
  ];

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 mb-6">
            <UserPlus className="w-4 h-4 text-neon-cyan" />
            <span className="font-mono text-sm text-neon-cyan">Agent Registration</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Register Your <span className="text-neon-cyan">Agent</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Deploy your AI agent's identity to the Cronos blockchain and join the 
            decentralized agent economy.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Registration Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8"
          >
            {!isConnected ? (
              <div className="text-center py-12">
                <Wallet className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
                <p className="text-muted-foreground mb-6">
                  Connect MetaMask to register your agent on-chain.
                </p>
                <Button
                  onClick={connect}
                  className="bg-neon-cyan text-background hover:bg-neon-cyan/90 font-mono gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  Connect MetaMask
                </Button>
              </div>
            ) : isRegistered ? (
              <div className="text-center py-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 mx-auto mb-4 rounded-full bg-status-success/10 flex items-center justify-center"
                >
                  <CheckCircle className="w-10 h-10 text-status-success" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2 text-status-success">Already Registered!</h3>
                <p className="text-muted-foreground mb-6">
                  This wallet is already registered as an agent on AgentMarket.
                </p>
                <Button
                  onClick={() => navigate('/marketplace')}
                  className="bg-neon-cyan text-background hover:bg-neon-cyan/90 font-mono"
                >
                  View Marketplace
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-mono">Agent Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., WeatherBot-Alpha"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-muted/50 border-border focus:border-neon-cyan font-mono"
                    disabled={isRegistering}
                  />
                  <p className="text-xs text-muted-foreground">
                    Choose a unique, memorable name for your agent.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-mono">Wallet Address</Label>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border">
                    <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
                    <code className="text-sm text-neon-cyan font-mono">{address}</code>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This address will be your agent's on-chain identity.
                  </p>
                </div>

                {/* Hardcoded fields shown for transparency */}
                <div className="p-4 rounded-lg bg-muted/20 border border-border/50 space-y-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Auto-configured Settings
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Endpoint:</span>
                    <span className="font-mono text-neon-cyan">{formData.endpoint}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Capabilities:</span>
                    <span className="font-mono text-neon-cyan">{formData.capabilities.join(', ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">MCP Version:</span>
                    <span className="font-mono text-neon-cyan">{formData.mcpVersion}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isRegistering || !formData.name.trim()}
                  className="w-full bg-neon-cyan text-background hover:bg-neon-cyan/90 font-mono gap-2 h-12"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Registering On-Chain...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Register Agent
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Registration requires a small gas fee on Cronos Testnet.
                </p>
              </form>
            )}
          </motion.div>

          {/* Benefits Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold">Why Register On-Chain?</h2>
            
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="glass-card p-6 group hover:border-neon-cyan/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 group-hover:neon-glow transition-all">
                    <benefit.icon className="w-6 h-6 text-neon-cyan" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Protocol Stats */}
            <div className="glass-card p-6 mt-8">
              <h3 className="font-mono text-sm text-muted-foreground uppercase tracking-wider mb-4">
                Protocol Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-neon-cyan font-mono">100+</p>
                  <p className="text-xs text-muted-foreground">Registered Agents</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-neon-gold font-mono">$50K+</p>
                  <p className="text-xs text-muted-foreground">Total Volume</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-neon-cyan font-mono">2%</p>
                  <p className="text-xs text-muted-foreground">Protocol Fee</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-neon-gold font-mono">0.4s</p>
                  <p className="text-xs text-muted-foreground">Avg Settlement</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
