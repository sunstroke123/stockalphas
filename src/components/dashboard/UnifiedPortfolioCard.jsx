"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  RefreshCw,
  Activity,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { SkeletonLoader } from "@/components/ui/LoadingSpinner";
import { usePortfolio } from "@/contexts/PortfolioContext";

export default function UnifiedPortfolioCard() {
  const {
    state: {
      totalValue,
      totalCost,
      totalGain,
      totalGainPercent,
      holdings,
      loading,
      error,
      lastUpdated,
    },
    refreshPortfolio,
  } = usePortfolio();

  const [previousValue, setPreviousValue] = useState(totalValue);
  const [showChange, setShowChange] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    refreshPortfolio();
  }, [refreshPortfolio]);

  // Track value changes for animations
  useEffect(() => {
    if (totalValue !== previousValue && previousValue > 0) {
      setShowChange(true);
      const timer = setTimeout(() => setShowChange(false), 3000);
      setPreviousValue(totalValue);
      return () => clearTimeout(timer);
    }
  }, [totalValue, previousValue]);

  // Auto-refresh for real-time updates
  useEffect(() => {
    if (holdings.length > 0 && !loading) {
      const interval = setInterval(() => {
        refreshPortfolio();
      }, 15000); // Refresh every 15 seconds

      return () => clearInterval(interval);
    }
  }, [holdings.length, loading, refreshPortfolio]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshPortfolio();
    setIsRefreshing(false);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <SkeletonLoader className="h-48 w-full" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="p-4 bg-[#FF453A]/10 border border-[#FF453A]/20 rounded-lg text-[#FF453A] text-sm">
          {error}
        </div>
      </Card>
    );
  }

  const isPositive = totalGain >= 0;
  const valueChange = totalValue - previousValue;
  const isPositiveChange = valueChange >= 0;

  return (
    <Card className="relative overflow-hidden bg-linear-to-br from-[#0AFA92]/8 via-transparent to-[#0AFA92]/3 p-6">
      {/* Enhanced background gradient */}
      <div className="absolute inset-0 pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#0AFA92]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        {/* Header with live indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Activity size={20} className="text-[#0AFA92]" />
              <h2 className="text-xl font-semibold text-[rgb(230,230,230)]">
                Portfolio Overview
              </h2>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-[#0AFA92]/20 rounded-full">
              <div className="w-2 h-2 bg-[#0AFA92] rounded-full animate-pulse" />
              <span className="text-xs text-[#0AFA92] font-medium">LIVE</span>
            </div>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-[#0AFA92]/10 transition-colors"
          >
            <RefreshCw
              size={16}
              className={`text-[rgb(140,140,140)] ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
          </Button>
        </div>

        {/* Main Portfolio Value */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="relative">
            <p className="text-sm text-[rgb(140,140,140)] mb-2">
              Total Portfolio Value
            </p>
            <motion.h3
              className="text-4xl sm:text-5xl font-bold text-[rgb(230,230,230)] mb-2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              $
              {totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </motion.h3>

            {/* Animated value change indicator */}
            <AnimatePresence>
              {showChange && Math.abs(valueChange) > 0.01 && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.8 }}
                  className={`absolute -top-2 right-0 flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    isPositiveChange
                      ? "bg-[#0AFA92]/20 text-[#0AFA92] border border-[#0AFA92]/30"
                      : "bg-[#FF453A]/20 text-[#FF453A] border border-[#FF453A]/30"
                  }`}
                >
                  {isPositiveChange ? (
                    <TrendingUp size={14} />
                  ) : (
                    <TrendingDown size={14} />
                  )}
                  {isPositiveChange ? "+" : ""}$
                  {Math.abs(valueChange).toFixed(2)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Gain/Loss Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
              isPositive
                ? "bg-[#0AFA92]/15 border border-[#0AFA92]/30"
                : "bg-[#FF453A]/15 border border-[#FF453A]/30"
            }`}
          >
            {isPositive ? (
              <TrendingUp size={18} className="text-[#0AFA92]" />
            ) : (
              <TrendingDown size={18} className="text-[#FF453A]" />
            )}
            <span
              className={`font-bold text-lg ${
                isPositive ? "text-[#0AFA92]" : "text-[#FF453A]"
              }`}
            >
              {isPositive ? "+" : ""}$
              {totalGain.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span
              className={`font-semibold text-sm ${
                isPositive ? "text-[#0AFA92]" : "text-[#FF453A]"
              }`}
            >
              ({isPositive ? "+" : ""}
              {totalGainPercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <motion.div
            className="bg-gradient-to-r from-[rgb(45,45,45)] to-[rgb(40,40,40)] rounded-xl p-4 border border-[rgb(60,60,60)]"
            whileHover={{ y: -2, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#0AFA92]/20 rounded-lg">
                <DollarSign size={18} className="text-[#0AFA92]" />
              </div>
              <p className="text-sm font-medium text-[rgb(140,140,140)]">
                Total Invested
              </p>
            </div>
            <p className="text-2xl font-bold text-[rgb(230,230,230)]">
              ${totalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </motion.div>

          <motion.div
            className="bg-gradient-to-r from-[rgb(45,45,45)] to-[rgb(40,40,40)] rounded-xl p-4 border border-[rgb(60,60,60)]"
            whileHover={{ y: -2, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#0AFA92]/20 rounded-lg">
                <PieChart size={18} className="text-[#0AFA92]" />
              </div>
              <p className="text-sm font-medium text-[rgb(140,140,140)]">
                Holdings
              </p>
            </div>
            <p className="text-2xl font-bold text-[rgb(230,230,230)]">
              {holdings?.length || 0}{" "}
              {holdings?.length === 1 ? "Stock" : "Stocks"}
            </p>
          </motion.div>

          <motion.div
            className="bg-gradient-to-r from-[rgb(45,45,45)] to-[rgb(40,40,40)] rounded-xl p-4 border border-[rgb(60,60,60)] sm:col-span-2 lg:col-span-1"
            whileHover={{ y: -2, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#0AFA92]/20 rounded-lg">
                <TrendingUp size={18} className="text-[#0AFA92]" />
              </div>
              <p className="text-sm font-medium text-[rgb(140,140,140)]">
                Performance
              </p>
            </div>
            <p
              className={`text-2xl font-bold ${
                isPositive ? "text-[#0AFA92]" : "text-[#FF453A]"
              }`}
            >
              {isPositive ? "+" : ""}
              {totalGainPercent.toFixed(2)}%
            </p>
          </motion.div>
        </div>

        {/* Footer with last updated */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-[rgb(100,100,100)]">
            {holdings?.length > 0
              ? `Tracking ${holdings.length} position${
                  holdings.length !== 1 ? "s" : ""
                }`
              : "No positions yet"}
          </div>
          {lastUpdated && (
            <div className="text-xs text-[rgb(100,100,100)]">
              Updated: {new Date(lastUpdated).toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Empty state */}
        {(!holdings || holdings.length === 0) && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[rgb(60,60,60)] rounded-full flex items-center justify-center mx-auto mb-4">
              <PieChart size={24} className="text-[rgb(140,140,140)]" />
            </div>
            <p className="text-[rgb(140,140,140)] mb-2">
              No portfolio holdings yet
            </p>
            <p className="text-sm text-[rgb(100,100,100)]">
              Add your first stock transaction to start tracking your portfolio
            </p>
          </div>
        )}

        {/* Loading indicator when refreshing */}
        {loading && (
          <div className="absolute inset-0 bg-[rgb(20,20,20)]/80 rounded-lg flex items-center justify-center">
            <div className="flex items-center gap-2 text-[#0AFA92]">
              <RefreshCw size={16} className="animate-spin" />
              <span className="text-sm font-medium">Updating portfolio...</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
