'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, X, TrendingUp, TrendingDown } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { usePortfolio } from '@/contexts/PortfolioContext';
import apiClient from '@/lib/apiClient';

export default function Watchlist() {
  const router = useRouter();
  const { state: { watchlist, loading, error }, addToWatchlist, removeFromWatchlist, refreshWatchlist } = usePortfolio();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTicker, setNewTicker] = useState('');
  const [addingTicker, setAddingTicker] = useState(false);

  useEffect(() => {
    refreshWatchlist();
  }, [refreshWatchlist]);

  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  const handleAddTicker = async () => {
    if (!newTicker.trim()) {
      showNotification('Please enter a stock ticker', 'error');
      return;
    }

    setAddingTicker(true);
    try {
      await addToWatchlist(newTicker.toUpperCase());
      setNewTicker('');
      setIsModalOpen(false);
      showNotification(`${newTicker.toUpperCase()} added to watchlist successfully!`, 'success');
    } catch (error) {
      console.error('Error adding ticker:', error);
      const errorMsg = error.message || 'Failed to add stock to watchlist';
      showNotification(errorMsg, 'error');
    } finally {
      setAddingTicker(false);
    }
  };

  const handleRemoveTicker = async (ticker) => {
    try {
      await removeFromWatchlist(ticker);
    } catch (error) {
      console.error('Error removing ticker:', error);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-[rgb(230,230,230)]">Watchlist</h2>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-sm sm:text-base"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Stock</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#FF453A]/10 border border-[#FF453A]/20 rounded-lg text-[#FF453A] text-sm">
            {error}
          </div>
        )}

        {notification.show && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
            notification.type === 'success' 
              ? 'bg-[#0AFA92]/10 border border-[#0AFA92]/20 text-[#0AFA92]' 
              : 'bg-[#FF453A]/10 border border-[#FF453A]/20 text-[#FF453A]'
          }`}>
            {notification.message}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonLoader key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : watchlist?.length > 0 ? (
          <motion.div
            className="space-y-3"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {watchlist.map((stock) => {
              const isPositive = stock.change >= 0;
              return (
                <motion.div
                  key={stock.ticker}
                  variants={item}
                  className="flex items-center justify-between p-3 sm:p-4 bg-[rgb(40,40,40)]/50 rounded-lg hover:bg-[rgb(40,40,40)] transition-colors cursor-pointer group"
                  onClick={() => router.push(`/stock/${stock.ticker}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <h3 className="font-semibold text-[rgb(230,230,230)] text-sm sm:text-base">
                        {stock.ticker}
                      </h3>
                      <span className="text-xs sm:text-sm text-[rgb(140,140,140)] truncate">
                        {stock.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-base sm:text-lg font-semibold text-[rgb(230,230,230)]">
                        ${stock.price.toFixed(2)}
                      </span>
                      <div className={`flex items-center gap-1 text-xs sm:text-sm ${
                        isPositive ? 'text-[#0AFA92]' : 'text-[#FF453A]'
                      }`}>
                        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span>
                          {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTicker(stock.ticker);
                    }}
                    className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity text-[rgb(140,140,140)] hover:text-[#FF453A] ml-2 shrink-0"
                  >
                    <X size={18} />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="text-center py-8">
            <p className="text-[rgb(140,140,140)] mb-4">Your watchlist is empty</p>
            <Button onClick={() => setIsModalOpen(true)} variant="primary" size="sm">
              Add Your First Stock
            </Button>
          </div>
        )}
      </Card>

      {/* Add Stock Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Stock to Watchlist"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[rgb(230,230,230)] mb-2">
              Stock Ticker
            </label>
            <input
              type="text"
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
              placeholder="e.g., AAPL"
              className="w-full px-4 py-2 bg-[rgb(40,40,40)] border border-[rgb(60,60,60)] rounded-lg text-[rgb(230,230,230)] focus:outline-none focus:border-[#0AFA92] transition-colors"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTicker()}
            />
          </div>
          <Button
            onClick={handleAddTicker}
            variant="primary"
            size="lg"
            className="w-full"
            loading={addingTicker}
            disabled={!newTicker.trim()}
          >
            Add to Watchlist
          </Button>
        </div>
      </Modal>
    </>
  );
}
