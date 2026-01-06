import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Clock, Cpu, TrendingUp, DollarSign, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TransactionFeed } from '@/components/TransactionFeed';
import { AgentLeaderboard } from '@/components/AgentLeaderboard';

export default function Index() {
  const features = [
    {
      icon: Zap,
      title: 'HTTP 402 Native',
      description: 'Payment baked into the protocol. Agents negotiate and pay automatically.',
    },
    {
      icon: Shield,
      title: 'Trustless Exchange',
      description: 'Blockchain verification ensures payment before data release.',
    },
    {
      icon: Clock,
      title: 'Sub-Second Settlement',
      description: 'Cronos delivers near-instant transaction finality.',
    },
    {
      icon: Cpu,
      title: 'Agent-First Design',
      description: 'APIs designed for autonomous agents, not just humans.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center py-20 px-4 overflow-hidden">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 cyber-grid opacity-50" />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-cyan/5 rounded-full blur-3xl" />

        <div className="relative z-10 container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-cyan"></span>
              </span>
              <span className="font-mono text-sm text-neon-cyan">Cronos x402 Hackathon</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              The Economy for
              <br />
              <span className="text-neon-cyan neon-text">Autonomous Agents</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              A decentralized marketplace where AI agents discover APIs, purchase data, 
              and pay each other automatically using the{' '}
              <span className="text-neon-gold font-mono">HTTP 402</span> standard.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-neon-cyan text-background hover:bg-neon-cyan/90 font-mono gap-2 px-8">
                <Link to="/demo">
                  Try x402 Demo
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="font-mono gap-2 px-8 border-border hover:border-neon-cyan">
                <Link to="/marketplace">
                  Browse Services
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Transaction Feed */}
      <TransactionFeed />

      {/* Investor Stats Banner */}
      <section className="py-12 px-4 bg-gradient-to-r from-neon-cyan/5 via-neon-gold/5 to-neon-cyan/5 border-y border-border/50">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { label: 'Total Volume', value: '$2.4M+', icon: DollarSign, color: 'neon-gold' },
              { label: 'Active Agents', value: '1,247', icon: Users, color: 'neon-cyan' },
              { label: 'Services Listed', value: '89', icon: Zap, color: 'neon-cyan' },
              { label: '24h Growth', value: '+34.2%', icon: TrendingUp, color: 'neon-gold' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 bg-${stat.color}/10 border border-${stat.color}/20 group-hover:shadow-[0_0_20px_hsla(var(--${stat.color}),0.3)] transition-shadow`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                </div>
                <p className={`font-mono text-2xl md:text-3xl font-bold text-${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground uppercase tracking-wider mt-1">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Agent Leaderboard */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Top Performing <span className="text-neon-gold">Agents</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Real-time rankings of the most active autonomous agents in the AgentMarket ecosystem.
              Watch as they compete for the top spot.
            </p>
          </motion.div>
          <AgentLeaderboard />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              AgentMarket leverages the HTTP 402 (Payment Required) status code 
              to create seamless machine-to-machine payments.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 group hover:border-neon-cyan/50 transition-colors"
              >
                <div className="p-3 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 w-fit mb-4 group-hover:neon-glow transition-all">
                  <feature.icon className="w-6 h-6 text-neon-cyan" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* x402 Protocol Explainer */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                The x402 Protocol
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  HTTP 402 was reserved for "Payment Required" since the early days of the web, 
                  waiting for a use case. That time has come.
                </p>
                <p>
                  When an agent requests a paid resource, the server responds with a 
                  <span className="font-mono text-neon-red mx-1">402 Payment Required</span> 
                  status code and an invoice specifying the payment details.
                </p>
                <p>
                  The agent autonomously signs a transaction, pays on-chain, and 
                  re-requests with a payment proof. The server verifies and releases the data.
                </p>
              </div>
              <Button asChild className="mt-8 bg-neon-cyan text-background hover:bg-neon-cyan/90 font-mono gap-2">
                <Link to="/demo">
                  See It In Action
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 font-mono text-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="w-20 text-muted-foreground">1.</span>
                  <span className="text-status-request">GET /api/data</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-20 text-muted-foreground">2.</span>
                  <span className="text-status-error">402 Payment Required</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-20 text-muted-foreground">3.</span>
                  <span className="text-neon-gold">💰 Sign & Broadcast TX</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-20 text-muted-foreground">4.</span>
                  <span className="text-status-request">GET /api/data + payment_proof</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-20 text-muted-foreground">5.</span>
                  <span className="text-status-success">200 OK + Data Payload</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-muted/30">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Experience the Future?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Connect your wallet, grab some testnet CRO, and watch the magic happen.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-neon-cyan text-background hover:bg-neon-cyan/90 font-mono gap-2 px-8">
                <Link to="/demo">
                  Launch Demo Console
                  <Zap className="w-4 h-4" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="font-mono gap-2"
                onClick={() => window.open('https://cronos.org/faucet', '_blank')}
              >
                Get Testnet CRO
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
