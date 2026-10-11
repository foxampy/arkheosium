import { ethers } from "ethers";

// Define provider interfaces
export interface Web3Provider {
  provider: any;
  name: string;
  icon: string;
}

// Mock token data for VOD and subtokens
export const tokenPrices = {
  VOD: 0.87, // $0.87 per VOD
  VOD_Uzbekistan: 0.65,
  VOD_Aral: 0.72,
  VOD_Ural: 0.58
};

// Define mock ABI for VOD token (would be replaced with real ABI)
export const vodTokenABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 amount)"
];

// Connect to wallet
export async function connectWallet(providerType: string = 'metamask'): Promise<string | null> {
  try {
    // For MetaMask or other injected providers
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          return accounts[0];
        }
      } catch (error) {
        console.error('Error connecting to wallet:', error);
        throw new Error('Failed to connect wallet');
      }
    } else {
      throw new Error('No Ethereum wallet detected. Please install MetaMask or another Web3 wallet.');
    }
    return null;
  } catch (error) {
    console.error('Connection error:', error);
    throw error;
  }
}

// Get the current provider
export function getProvider(): ethers.BrowserProvider | null {
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
}

// Get token balance (mock implementation for frontend demo)
export async function getTokenBalance(
  address: string, 
  tokenSymbol: string = 'VOD'
): Promise<number> {
  // In a real implementation, this would query the blockchain
  // For the demo, return mock balances
  const mockBalances: Record<string, Record<string, number>> = {
    'default': {
      'VOD': 587.45,
      'VOD_Uzbekistan': 245.30,
      'VOD_Aral': 142.15,
      'VOD_Ural': 200.00
    }
  };
  
  // Return either the address-specific balance or default
  return mockBalances[address]?.[tokenSymbol] || mockBalances['default'][tokenSymbol] || 0;
}

// Get token value in USD
export function getTokenValueUSD(amount: number, tokenSymbol: string = 'VOD'): number {
  return amount * (tokenPrices[tokenSymbol as keyof typeof tokenPrices] || 0);
}

// Available wallet providers
export const walletProviders: Web3Provider[] = [
  {
    name: 'MetaMask',
    provider: 'metamask',
    icon: 'https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg'
  },
  {
    name: 'WalletConnect',
    provider: 'walletconnect',
    icon: 'https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Icon/Black/Icon.svg'
  },
  {
    name: 'Trust Wallet',
    provider: 'trustwallet',
    icon: 'https://trustwallet.com/assets/images/favicon.svg'
  }
];

// Mock transaction types for UI
export enum TransactionType {
  RECEIVED = 'Received',
  SENT = 'Sent',
  STAKING = 'Staking',
  DAO_VOTE = 'DAO Vote'
}

// Mock transaction status
export enum TransactionStatus {
  COMPLETED = 'Completed',
  PENDING = 'Pending',
  FAILED = 'Failed'
}

// For the mock implementation
export type Transaction = {
  id: string;
  type: TransactionType;
  token: string;
  amount: number;
  date: Date;
  status: TransactionStatus;
};

// Mock transaction data
export const mockTransactions: Transaction[] = [
  {
    id: '0x1234567890abcdef1',
    type: TransactionType.RECEIVED,
    token: 'VOD',
    amount: 25.0,
    date: new Date('2023-07-15'),
    status: TransactionStatus.COMPLETED
  },
  {
    id: '0x1234567890abcdef2',
    type: TransactionType.STAKING,
    token: 'VOD_Aral',
    amount: -50.0,
    date: new Date('2023-07-10'),
    status: TransactionStatus.COMPLETED
  },
  {
    id: '0x1234567890abcdef3',
    type: TransactionType.DAO_VOTE,
    token: 'VOD',
    amount: -10.0,
    date: new Date('2023-07-08'),
    status: TransactionStatus.COMPLETED
  },
  {
    id: '0x1234567890abcdef4',
    type: TransactionType.SENT,
    token: 'VOD_Uzbekistan',
    amount: -75.5,
    date: new Date('2023-07-05'),
    status: TransactionStatus.COMPLETED
  }
];

// Global type definitions for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
