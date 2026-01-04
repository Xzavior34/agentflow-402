import { Link, useLocation } from 'react-router-dom';
import { Wallet, Zap, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const location = useLocation();
  const { address, balance, isConnected, isConnecting, connect, disconnect, isCorrectNetwork } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Terminal' },
    { path: '/marketplace', label: 'Marketplace' },
    { path: '/demo', label: 'x402 Demo' },
  ];

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const formatBalance = (bal: string) => parseFloat(bal).toFixed(4);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Zap className="w-8 h-8 text-neon-cyan transition-all group-hover:drop-shadow-[0_0_8px_hsl(var(--neon-cyan))]" />
            <div className="absolute inset-0 bg-neon-cyan/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-bold text-xl tracking-tight">
            Agent<span className="text-neon-cyan">Market</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-md font-mono text-sm transition-all ${
                location.pathname === link.path
                  ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Wallet Button */}
        <div className="flex items-center gap-4">
          {isConnected ? (
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="font-mono text-xs text-neon-cyan">
                  {formatBalance(balance)} CRO
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {formatAddress(address!)}
                </span>
              </div>
              {!isCorrectNetwork && (
                <span className="text-xs text-neon-gold px-2 py-1 bg-neon-gold/10 rounded border border-neon-gold/30">
                  Wrong Network
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={disconnect}
                className="border-border hover:border-destructive hover:text-destructive"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              onClick={connect}
              disabled={isConnecting}
              className="bg-neon-cyan text-background hover:bg-neon-cyan/90 font-mono"
            >
              <Wallet className="w-4 h-4 mr-2" />
              {isConnecting ? 'Connecting...' : 'Connect'}
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-md"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-md font-mono text-sm transition-all ${
                    location.pathname === link.path
                      ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isConnected && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm text-neon-cyan">{formatBalance(balance)} CRO</p>
                      <p className="font-mono text-xs text-muted-foreground">{formatAddress(address!)}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={disconnect}>
                      Disconnect
                    </Button>
                  </div>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
