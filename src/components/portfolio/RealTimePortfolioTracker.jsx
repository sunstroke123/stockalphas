'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { usePortfolio } from '@/contexts/PortfolioContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function RealTimePortfolioTracker() {
  const { 
    state: { totalValue, totalGain, totalGainPercent, loading, lastUpdated, holdings }, 
    refreshPortfolio 
  } = usePortfolio();
  
  const [previousValue, setPreviousValue] = useState(totalValue);
  const [showChange, setShowChange] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (totalValue !== previousValue && previousValue > 0) {
      setShowChange(true);
      const timer = setTimeout(() => setShowChange(false), 3000);
      setPreviousValue(totalValue);
      return () => clearTimeout(timer);
    }
  }, [totalValue, previousValue]);

  // Auto-refresh for live tracking when there are holdings
  useEffect(() => {
    if (holdings.length > 0 && !loading) {
      const interval = setInterval(() => {
        refreshPortfolio();
      }, 15000); // Refresh every 15 seconds for real-time updates

      return () => clearInterval(interval);
    }
  }, [holdings.length, loading, refreshPortfolio]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshPortfolio();
    setIsRefreshing(false);
  };

  const valueChange = totalValue - previousValue;
  const isPositiveChange = valueChange >= 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[rgb(230,230,230)]">
          Portfolio Value (Live)
        </h3>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="ghost"
          size="sm"
          className="p-2"
        >
          <RefreshCw 
            size={16} 
            className={isRefreshing ? 'animate-spin' : ''} 
          />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <div className="text-3xl font-bold text-[rgb(230,230,230)]">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          
          <AnimatePresence>
            {showChange && Math.abs(valueChange) > 0.01 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`absolute -top-8 right-0 flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${
                  isPositiveChange 
                    ? 'bg-[#0AFA92]/20 text-[#0AFA92]' 
                    : 'bg-[#FF453A]/20 text-[#FF453A]'
                }`}
              >
                {isPositiveChange ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {isPositiveChange ? '+' : ''}${valueChange.toFixed(2)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[rgb(140,140,140)]">Total Gain:</span>
            <span className={`font-semibold ${totalGain >= 0 ? 'text-[#0AFA92]' : 'text-[#FF453A]'}`}>
              {totalGain >= 0 ? '+' : ''}${totalGain.toFixed(2)}
            </span>
          </div>
          <div className={`flex items-center gap-1 ${totalGainPercent >= 0 ? 'text-[#0AFA92]' : 'text-[#FF453A]'}`}>
            {totalGainPercent >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span className="font-semibold">
              {totalGainPercent >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%
            </span>
          </div>
        </div>

        {lastUpdated && (
          <div className="text-xs text-[rgb(100,100,100)] text-right">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-[rgb(140,140,140)]">
            <div className="animate-spin w-4 h-4 border-2 border-[rgb(140,140,140)] border-t-transparent rounded-full"></div>
            Updating portfolio...
          </div>
        )}
      </div>
    </Card>
  );
}