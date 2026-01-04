import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { toast } from 'sonner';

// Cronos Testnet Configuration
const CRONOS_TESTNET = {
  chainId: '0x152', // 338 in hex
  chainName: 'Cronos Testnet',
  nativeCurrency: {
    name: 'TCRO',
    symbol: 'TCRO',
    decimals: 18,
  },
  rpcUrls: ['https://evm-t3.cronos.org/'],
  blockExplorerUrls: ['https://explorer.cronos.org/testnet'],
};

interface WalletState {
  address: string | null;
  balance: string;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: string | null;
  isCorrectNetwork: boolean;
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    balance: '0',
    isConnected: false,
    isConnecting: false,
    chainId: null,
    isCorrectNetwork: false,
  });

  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';

  // Update balance
  const updateBalance = useCallback(async (address: string, provider: ethers.BrowserProvider) => {
    try {
      const balance = await provider.getBalance(address);
      setWallet(prev => ({
        ...prev,
        balance: ethers.formatEther(balance),
      }));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  }, []);

  // Switch to Cronos Testnet
  const switchToCronosTestnet = useCallback(async () => {
    if (!window.ethereum) return false;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CRONOS_TESTNET.chainId }],
      });
      return true;
    } catch (switchError: any) {
      // Chain not added, try to add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [CRONOS_TESTNET],
          });
          return true;
        } catch (addError) {
          console.error('Error adding Cronos Testnet:', addError);
          toast.error('Failed to add Cronos Testnet');
          return false;
        }
      }
      console.error('Error switching to Cronos Testnet:', switchError);
      return false;
    }
  }, []);

  // Connect wallet
  const connect = useCallback(async () => {
    if (!isMetaMaskInstalled) {
      toast.error('MetaMask is not installed. Please install MetaMask to continue.');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setWallet(prev => ({ ...prev, isConnecting: true }));

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const walletSigner = await browserProvider.getSigner();
      const address = accounts[0];
      const network = await browserProvider.getNetwork();
      const chainId = '0x' + network.chainId.toString(16);
      const isCorrectNetwork = chainId.toLowerCase() === CRONOS_TESTNET.chainId.toLowerCase();

      setProvider(browserProvider);
      setSigner(walletSigner);
      setWallet({
        address,
        balance: '0',
        isConnected: true,
        isConnecting: false,
        chainId,
        isCorrectNetwork,
      });

      await updateBalance(address, browserProvider);

      if (!isCorrectNetwork) {
        toast.warning('Please switch to Cronos Testnet for the demo');
        await switchToCronosTestnet();
      } else {
        toast.success('Wallet connected!');
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      setWallet(prev => ({ ...prev, isConnecting: false }));
      toast.error(error.message || 'Failed to connect wallet');
    }
  }, [isMetaMaskInstalled, switchToCronosTestnet, updateBalance]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setWallet({
      address: null,
      balance: '0',
      isConnected: false,
      isConnecting: false,
      chainId: null,
      isCorrectNetwork: false,
    });
    setProvider(null);
    setSigner(null);
    toast.info('Wallet disconnected');
  }, []);

  // Send transaction
  const sendTransaction = useCallback(async (toAddress: string, amountCRO: string): Promise<string | null> => {
    if (!signer || !wallet.isConnected) {
      toast.error('Wallet not connected');
      return null;
    }

    if (!wallet.isCorrectNetwork) {
      const switched = await switchToCronosTestnet();
      if (!switched) {
        toast.error('Please switch to Cronos Testnet');
        return null;
      }
    }

    try {
      const tx = await signer.sendTransaction({
        to: toAddress,
        value: ethers.parseEther(amountCRO),
      });
      
      toast.loading('Transaction pending...', { id: 'tx-pending' });
      const receipt = await tx.wait();
      toast.dismiss('tx-pending');
      
      if (receipt && wallet.address && provider) {
        await updateBalance(wallet.address, provider);
      }
      
      return receipt?.hash || tx.hash;
    } catch (error: any) {
      toast.dismiss('tx-pending');
      console.error('Transaction error:', error);
      
      if (error.code === 'ACTION_REJECTED') {
        toast.error('Transaction rejected by user');
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        toast.error('Insufficient funds. Get testnet CRO from the faucet.');
      } else {
        toast.error(error.message || 'Transaction failed');
      }
      return null;
    }
  }, [signer, wallet.isConnected, wallet.isCorrectNetwork, wallet.address, provider, switchToCronosTestnet, updateBalance]);

  // Listen for account/chain changes
  useEffect(() => {
    if (!isMetaMaskInstalled) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== wallet.address) {
        setWallet(prev => ({ ...prev, address: accounts[0] }));
        if (provider) {
          updateBalance(accounts[0], provider);
        }
      }
    };

    const handleChainChanged = (chainId: string) => {
      const isCorrect = chainId.toLowerCase() === CRONOS_TESTNET.chainId.toLowerCase();
      setWallet(prev => ({ ...prev, chainId, isCorrectNetwork: isCorrect }));
      
      if (!isCorrect) {
        toast.warning('Please switch to Cronos Testnet');
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [isMetaMaskInstalled, wallet.address, provider, disconnect, updateBalance]);

  return {
    ...wallet,
    connect,
    disconnect,
    sendTransaction,
    switchToCronosTestnet,
    isMetaMaskInstalled,
    explorerUrl: CRONOS_TESTNET.blockExplorerUrls[0],
  };
}

// Extend window type for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
