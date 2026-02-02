'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import apiClient from '@/lib/apiClient';

export default function PredictionFeed() {
  const router = useRouter();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        // Fetch watchlist first
        const watchlistResponse = await apiClient.get('/api/watchlist');
        const tickers = watchlistResponse.data.items.slice(0, 4); // Limit to 4

        // Fetch predictions for each ticker
        const predictionPromises = tickers.map(async (item) => {
          try {
            const response = await apiClient.get(`/api/stock/${item.ticker}/prediction`);
            return response.data;
          } catch (error) {
            console.error(`Error fetching prediction for ${item.ticker}:`, error);
            return null;
          }
        });

        const results = await Promise.all(predictionPromises);
        setPredictions(results.filter(Boolean));
      } catch (error) {
        console.error('Error fetching predictions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  const getSignalColor = (signal) => {
    switch (signal) {
      case 'BUY':
        return 'text-[#0AFA92] bg-[#0AFA92]/10 border-[#0AFA92]/20';
      case 'SELL':
        return 'text-[#FF453A] bg-[#FF453A]/10 border-[#FF453A]/20';
      default:
        return 'text-[rgb(140,140,140)] bg-[rgb(40,40,40)] border-[rgb(60,60,60)]';
    }
  };

  const getRiskIcon = (risk) => {
    switch (risk) {
      case 'LOW':
        return <CheckCircle size={16} className="text-[#0AFA92]" />;
      case 'HIGH':
        return <AlertTriangle size={16} className="text-[#FF453A]" />;
      default:
        return <AlertTriangle size={16} className="text-yellow-500" />;
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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-[rgb(230,230,230)]">AI Predictions</h2>
        <span className="text-xs sm:text-sm text-[rgb(140,140,140)]">Powered by ML</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonLoader key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : predictions.length > 0 ? (
        <motion.div
          className="space-y-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {predictions.map((prediction) => (
            <motion.div
              key={prediction.ticker}
              variants={item}
              className="p-3 sm:p-4 bg-[rgb(40,40,40)]/50 rounded-lg hover:bg-[rgb(40,40,40)] transition-colors cursor-pointer"
              onClick={() => router.push(`/stock/${prediction.ticker}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-[rgb(230,230,230)] mb-1 text-sm sm:text-base">
                    {prediction.ticker}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-[rgb(140,140,140)]">
                      ${prediction.current_price.toFixed(2)}
                    </span>
                    <span className="text-xs sm:text-sm text-[rgb(140,140,140)]">→</span>
                    <span className="text-xs sm:text-sm font-semibold text-[rgb(230,230,230)]">
                      ${prediction.predicted_price.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className={`px-2 sm:px-3 py-1 rounded-lg border font-semibold text-xs sm:text-sm shrink-0 ml-2 ${getSignalColor(prediction.signal)}`}>
                  {prediction.signal}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {getRiskIcon(prediction.risk)}
                  <span className="text-xs text-[rgb(140,140,140)]">
                    Risk: {prediction.risk}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-12 sm:w-16 h-1.5 bg-[rgb(60,60,60)] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#0AFA92]"
                      initial={{ width: 0 }}
                      animate={{ width: `${prediction.confidence * 100}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    />
                  </div>
                  <span className="text-xs text-[rgb(140,140,140)] ml-1">
                    {(prediction.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm sm:text-base text-[rgb(140,140,140)]">No predictions available</p>
          <p className="text-xs sm:text-sm text-[rgb(140,140,140)] mt-2">
            Add stocks to your watchlist to see AI predictions
          </p>
        </div>
      )}
    </Card>
  );
}
