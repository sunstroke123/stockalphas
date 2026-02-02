'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import Card from '@/components/ui/Card';
import LoadingSpinner, { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { usePortfolio } from '@/contexts/PortfolioContext';

export default function PortfolioSummaryCard() {
  const { 
    state: { 
      totalValue, 
      totalCost, 
      totalGain, 
      totalGainPercent, 
      holdings, 
      loading, 
      error 
    }, 
    refreshPortfolio 
  } = usePortfolio();

  useEffect(() => {
    refreshPortfolio();
  }, [refreshPortfolio]);

  // Auto-refresh when holdings change
  useEffect(() => {
    if (holdings.length > 0 && !loading) {
      const interval = setInterval(() => {
        refreshPortfolio();
      }, 30000); // Refresh every 30 seconds for live prices

      return () => clearInterval(interval);
    }
  }, [holdings.length, loading, refreshPortfolio]);

  const portfolio = {
    totalValue,
    totalCost,
    totalGain,
    totalGainPercent,
    holdings
  };

  if (loading) {
    return (
      <Card>
        <SkeletonLoader className="h-32 w-full" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="p-3 bg-[#FF453A]/10 border border-[#FF453A]/20 rounded-lg text-[#FF453A] text-sm">
          {error}
        </div>
      </Card>
    );
  }

  if (!portfolio) {
    return (
      <Card>
        <p className="text-[rgb(140,140,140)]">No portfolio data available</p>
      </Card>
    );
  }

  const isPositive = portfolio.totalGain >= 0;

  return (
    <Card className="relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-[#0AFA92]/5 to-transparent pointer-events-none" />

      <div className="relative">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-0 mb-6">
          <div>
            <p className="text-[rgb(140,140,140)] text-xs sm:text-sm mb-1">Total Portfolio Value</p>
            <motion.h2
              className="text-3xl sm:text-4xl font-bold text-[rgb(230,230,230)]"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              ${portfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </motion.h2>
          </div>
          <div 
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg self-start ${
              isPositive ? 'bg-[#0AFA92]/10' : 'bg-[#FF453A]/10'
            }`}
          >
            {isPositive ? (
              <TrendingUp size={18} className="text-[#0AFA92]" />
            ) : (
              <TrendingDown size={18} className="text-[#FF453A]" />
            )}
            <span className={`font-semibold text-sm sm:text-base ${
              isPositive ? 'text-[#0AFA92]' : 'text-[#FF453A]'
            }`}>
              {isPositive ? '+' : ''}{portfolio.totalGainPercent.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <motion.div
            className="bg-[rgb(40,40,40)]/50 rounded-lg p-3 sm:p-4"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className="text-[rgb(140,140,140)]" />
              <p className="text-xs text-[rgb(140,140,140)]">Total Gain/Loss</p>
            </div>
            <p className={`text-lg sm:text-xl font-bold ${
              isPositive ? 'text-[#0AFA92]' : 'text-[#FF453A]'
            }`}>
              {isPositive ? '+' : ''}${portfolio.totalGain.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </motion.div>

          <motion.div
            className="bg-[rgb(40,40,40)]/50 rounded-lg p-3 sm:p-4"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <PieChart size={16} className="text-[rgb(140,140,140)]" />
              <p className="text-xs text-[rgb(140,140,140)]">Total Cost</p>
            </div>
            <p className="text-lg sm:text-xl font-bold text-[rgb(230,230,230)]">
              ${portfolio.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </motion.div>

          <motion.div
            className="bg-[rgb(40,40,40)]/50 rounded-lg p-3 sm:p-4"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-[rgb(140,140,140)]" />
              <p className="text-xs text-[rgb(140,140,140)]">Holdings</p>
            </div>
            <p className="text-lg sm:text-xl font-bold text-[rgb(230,230,230)]">
              {portfolio.holdings?.length || 0}
            </p>
          </motion.div>
        </div>
      </div>
    </Card>
  );
}
