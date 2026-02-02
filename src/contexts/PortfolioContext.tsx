'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import apiClient from '@/lib/apiClient';

interface Stock {
  ticker: string;
  name?: string;
  price?: number;
  change?: number;
  changePercent?: number;
  marketCap?: number;
  volume?: number;
  peRatio?: number;
}

interface Transaction {
  _id?: string;
  ticker: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  date: Date;
}

interface Holding {
  ticker: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  totalValue: number;
  totalCost: number;
  gain: number;
  gainPercent: number;
}

interface PortfolioState {
  totalValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPercent: number;
  holdings: Holding[];
  transactions: Transaction[];
  watchlist: Stock[];
  loading: boolean;
  error: string;
  lastUpdated?: string;
}

interface PortfolioContextType {
  state: PortfolioState;
  addTransaction: (transaction: Omit<Transaction, '_id' | 'date'>) => Promise<void>;
  removeFromWatchlist: (ticker: string) => Promise<void>;
  addToWatchlist: (ticker: string) => Promise<void>;
  refreshPortfolio: () => Promise<void>;
  refreshWatchlist: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

type PortfolioAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_PORTFOLIO'; payload: Partial<PortfolioState> }
  | { type: 'SET_WATCHLIST'; payload: Stock[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_HOLDINGS'; payload: Holding[] };

const initialState: PortfolioState = {
  totalValue: 0,
  totalCost: 0,
  totalGain: 0,
  totalGainPercent: 0,
  holdings: [],
  transactions: [],
  watchlist: [],
  loading: false,
  error: '',
  lastUpdated: undefined,
};

function portfolioReducer(state: PortfolioState, action: PortfolioAction): PortfolioState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_PORTFOLIO':
      return { ...state, ...action.payload, loading: false };
    case 'SET_WATCHLIST':
      return { ...state, watchlist: action.payload };
    case 'ADD_TRANSACTION':
      return { 
        ...state, 
        transactions: [...state.transactions, action.payload] 
      };
    case 'UPDATE_HOLDINGS':
      return { ...state, holdings: action.payload };
    default:
      return state;
  }
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(portfolioReducer, initialState);
  const { data: session, status } = useSession();

  // Initialize data when provider mounts and user is authenticated
  React.useEffect(() => {
    const initializeData = async () => {
      // Only initialize if user is authenticated
      if (status === 'authenticated' && session) {
        try {
          await Promise.all([refreshPortfolio(), refreshWatchlist()]);
        } catch (error) {
          console.error('Error initializing portfolio data:', error);
        }
      }
    };
    initializeData();
  }, [status, session]); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshPortfolio = useCallback(async () => {
    // Only fetch if user is authenticated
    if (status !== 'authenticated' || !session) {
      return;
    }
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: '' });
      
      const response = await apiClient.get('/api/portfolio');
      dispatch({ type: 'SET_PORTFOLIO', payload: response.data });
    } catch (error: any) {
      console.error('Error fetching portfolio:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.error || 'Failed to load portfolio' 
      });
    }
  }, [status, session]);

  const refreshWatchlist = useCallback(async () => {
    // Only fetch if user is authenticated
    if (status !== 'authenticated' || !session) {
      return;
    }
    
    try {
      const response = await apiClient.get('/api/watchlist');
      dispatch({ type: 'SET_WATCHLIST', payload: response.data });
    } catch (error: any) {
      console.error('Error fetching watchlist:', error);
    }
  }, [status, session]);

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshPortfolio(), refreshWatchlist()]);
  }, [refreshPortfolio, refreshWatchlist]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, '_id' | 'date'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await apiClient.post('/api/portfolio/transaction', transaction);
      
      // Add transaction to local state
      dispatch({ 
        type: 'ADD_TRANSACTION', 
        payload: { ...transaction, _id: response.data._id, date: new Date() } 
      });
      
      // Refresh all data to get updated calculations and UI
      await refreshAll();
      
      return response.data;
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.error || 'Failed to add transaction' 
      });
      throw error;
    }
  }, [refreshAll]);

  const addToWatchlist = useCallback(async (ticker: string) => {
    try {
      await apiClient.post('/api/watchlist', { ticker });
      await refreshAll(); // Refresh everything to update predictions too
    } catch (error: any) {
      console.error('Error adding to watchlist:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to add to watchlist';
      throw new Error(errorMessage);
    }
  }, [refreshAll]);

  const removeFromWatchlist = useCallback(async (ticker: string) => {
    try {
      await apiClient.delete(`/api/watchlist?ticker=${ticker}`);
      await refreshAll(); // Refresh everything to update predictions too
    } catch (error: any) {
      console.error('Error removing from watchlist:', error);
      throw error;
    }
  }, [refreshAll]);

  const value = {
    state,
    addTransaction,
    removeFromWatchlist,
    addToWatchlist,
    refreshPortfolio,
    refreshWatchlist,
    refreshAll,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}