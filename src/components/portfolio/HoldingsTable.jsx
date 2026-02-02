'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from '@/components/ui/Card';

export default function HoldingsTable({ holdings }) {
  const router = useRouter();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <Card>
      <h2 className="text-lg sm:text-xl font-bold text-[rgb(230,230,230)] mb-4 sm:mb-6">Holdings</h2>

      {holdings.length > 0 ? (
        <>
          {/* Desktop Table - Hidden on mobile */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[rgb(140,140,140)] text-sm border-b border-[rgb(40,40,40)]">
                  <th className="pb-3 font-medium">Symbol</th>
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium text-right">Quantity</th>
                  <th className="pb-3 font-medium text-right">Avg Price</th>
                  <th className="pb-3 font-medium text-right">Current Price</th>
                  <th className="pb-3 font-medium text-right">Total Value</th>
                  <th className="pb-3 font-medium text-right">Gain/Loss</th>
                </tr>
              </thead>
              <motion.tbody variants={container} initial="hidden" animate="show">
              {holdings.map((holding) => {
                const isPositive = holding.gain >= 0;
                return (
                  <motion.tr
                    key={holding.ticker}
                    variants={item}
                    className="border-b border-[rgb(40,40,40)] cursor-pointer group hover:bg-[#0AFA92]/5 transition-colors"
                    onClick={() => router.push(`/stock/${holding.ticker}`)}
                  >
                    <td className="py-4 font-semibold text-[rgb(230,230,230)] group-hover:text-[#0AFA92] transition-colors">
                      {holding.ticker}
                    </td>
                    <td className="py-4 text-[rgb(140,140,140)]">{holding.name}</td>
                    <td className="py-4 text-right text-[rgb(230,230,230)]">
                      {holding.quantity}
                    </td>
                    <td className="py-4 text-right text-[rgb(230,230,230)]">
                      ${holding.avgPrice.toFixed(2)}
                    </td>
                    <td className="py-4 text-right text-[rgb(230,230,230)]">
                      ${holding.currentPrice.toFixed(2)}
                    </td>
                    <td className="py-4 text-right font-semibold text-[rgb(230,230,230)]">
                      ${holding.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div
                          className={`flex items-center gap-1 ${
                            isPositive ? 'text-[#0AFA92]' : 'text-[#FF453A]'
                          }`}
                        >
                          {isPositive ? (
                            <TrendingUp size={16} />
                          ) : (
                            <TrendingDown size={16} />
                          )}
                          <span className="font-semibold">
                            {isPositive ? '+' : ''}${Math.abs(holding.gain).toFixed(2)}
                          </span>
                        </div>
                        <span
                          className={`text-sm ${
                            isPositive ? 'text-[#0AFA92]' : 'text-[#FF453A]'
                          }`}
                        >
                          ({isPositive ? '+' : ''}{holding.gainPercent.toFixed(2)}%)
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
        </div>

        {/* Mobile Cards - Shown only on mobile */}
        <div className="md:hidden space-y-3">
          {holdings.map((holding, index) => {
            const isPositive = holding.gain >= 0;
            return (
              <motion.div
                key={holding.ticker}
                className="border border-[rgb(40,40,40)] rounded-lg p-4 hover:bg-[#0AFA92]/5 transition-colors cursor-pointer"
                onClick={() => router.push(`/stock/${holding.ticker}`)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-[rgb(230,230,230)]">{holding.ticker}</h3>
                    <p className="text-sm text-[rgb(140,140,140)]">{holding.name}</p>
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-semibold ${
                    isPositive ? 'text-[#0AFA92]' : 'text-[#FF453A]'
                  }`}>
                    {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {isPositive ? '+' : ''}{holding.gainPercent.toFixed(2)}%
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[rgb(140,140,140)]">Quantity</p>
                    <p className="font-medium text-[rgb(230,230,230)]">{holding.quantity}</p>
                  </div>
                  <div>
                    <p className="text-[rgb(140,140,140)]">Avg Price</p>
                    <p className="font-medium text-[rgb(230,230,230)]">${holding.avgPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[rgb(140,140,140)]">Current</p>
                    <p className="font-medium text-[rgb(230,230,230)]">${holding.currentPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[rgb(140,140,140)]">Total Value</p>
                    <p className="font-semibold text-[rgb(230,230,230)]">
                      ${holding.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                
                <div className={`mt-3 pt-3 border-t border-[rgb(40,40,40)] flex items-center justify-between text-sm ${
                  isPositive ? 'text-[#0AFA92]' : 'text-[#FF453A]'
                }`}>
                  <span className="font-medium">Gain/Loss</span>
                  <span className="font-semibold">
                    {isPositive ? '+' : ''}${Math.abs(holding.gain).toFixed(2)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </>
    ) : (
      <div className="text-center py-12">
        <p className="text-[rgb(140,140,140)]">No holdings yet</p>
        <p className="text-sm text-[rgb(140,140,140)] mt-2">
          Add your first transaction to get started
        </p>
      </div>
    )}
  </Card>
);
}
