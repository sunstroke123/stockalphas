'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { usePortfolio } from '@/contexts/PortfolioContext';

export default function AddTransactionModal({ isOpen, onClose, onSuccess, defaultTicker = '' }) {
  const { addTransaction, state: { loading: portfolioLoading } } = usePortfolio();
  const [formData, setFormData] = useState({
    ticker: defaultTicker,
    type: 'BUY',
    quantity: '',
    price: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Update ticker when defaultTicker changes
  useEffect(() => {
    if (defaultTicker && isOpen) {
      setFormData(prev => ({ ...prev, ticker: defaultTicker }));
    }
  }, [defaultTicker, isOpen]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await addTransaction({
        ticker: formData.ticker.toUpperCase(),
        type: formData.type,
        quantity: parseFloat(formData.quantity),
        price: parseFloat(formData.price),
      });

      // Reset form
      setFormData({
        ticker: '',
        type: 'BUY',
        quantity: '',
        price: '',
        date: new Date().toISOString().split('T')[0],
      });

      onClose();
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Transaction">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-[#FF453A]/10 border border-[#FF453A]/20 rounded-lg text-[#FF453A] text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[rgb(230,230,230)] mb-2">
            Stock Ticker
          </label>
          <input
            type="text"
            value={formData.ticker}
            onChange={(e) =>
              setFormData({ ...formData, ticker: e.target.value.toUpperCase() })
            }
            placeholder="e.g., AAPL"
            className="w-full px-4 py-2 bg-[rgb(40,40,40)] border border-[rgb(60,60,60)] rounded-lg text-[rgb(230,230,230)] focus:outline-none focus:border-[#0AFA92] transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[rgb(230,230,230)] mb-2">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'BUY' })}
              className={`py-2 rounded-lg font-medium transition-colors ${
                formData.type === 'BUY'
                  ? 'bg-[#0AFA92] text-black'
                  : 'bg-[rgb(40,40,40)] text-[rgb(140,140,140)] hover:text-[rgb(230,230,230)]'
              }`}
            >
              BUY
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'SELL' })}
              className={`py-2 rounded-lg font-medium transition-colors ${
                formData.type === 'SELL'
                  ? 'bg-[#FF453A] text-white'
                  : 'bg-[rgb(40,40,40)] text-[rgb(140,140,140)] hover:text-[rgb(230,230,230)]'
              }`}
            >
              SELL
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[rgb(230,230,230)] mb-2">
              Quantity
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="0"
              className="w-full px-4 py-2 bg-[rgb(40,40,40)] border border-[rgb(60,60,60)] rounded-lg text-[rgb(230,230,230)] focus:outline-none focus:border-[#0AFA92] transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(230,230,230)] mb-2">
              Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.00"
              className="w-full px-4 py-2 bg-[rgb(40,40,40)] border border-[rgb(60,60,60)] rounded-lg text-[rgb(230,230,230)] focus:outline-none focus:border-[#0AFA92] transition-colors"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[rgb(230,230,230)] mb-2">
            Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-2 bg-[rgb(40,40,40)] border border-[rgb(60,60,60)] rounded-lg text-[rgb(230,230,230)] focus:outline-none focus:border-[#0AFA92] transition-colors"
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={loading}
        >
          Add Transaction
        </Button>
      </form>
    </Modal>
  );
}
