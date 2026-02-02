"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { usePortfolio } from "@/contexts/PortfolioContext";
import apiClient from "@/lib/apiClient";
import { RefreshCcw } from "lucide-react";

export default function PredictionFeed() {
  const {
    state: { watchlist },
  } = usePortfolio();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPredictions();
  }, []);

  // Auto-refresh when watchlist changes
  useEffect(() => {
    if (watchlist.length > 0) {
      fetchPredictions();
    }
  }, [watchlist]);

  const fetchPredictions = async () => {
    try {
      setError("");
      // Get watchlist first
      const watchlistRes = await apiClient.get("/api/watchlist");
      const watchlist = watchlistRes.data;

      if (!watchlist || watchlist.length === 0) {
        setPredictions([]);
        setLoading(false);
        return;
      }

      // Fetch predictions for each ticker
      const predictionPromises = watchlist.map(async (item) => {
        try {
          const res = await apiClient.get(
            `/api/stock/${item.ticker}/prediction`
          );
          return res.data;
        } catch (err) {
          console.error(`Failed to fetch prediction for ${item.ticker}:`, err);
          return null;
        }
      });

      const results = await Promise.all(predictionPromises);
      setPredictions(results.filter((p) => p !== null));
    } catch (err) {
      console.error("Error fetching predictions:", err);
      setError(
        err.response?.data?.error ||
          "Failed to load predictions. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const getPredictionColor = (direction) => {
    if (direction === "up") return "text-[#0AFA92]";
    if (direction === "down") return "text-[#FF453A]";
    return "text-[rgb(140,140,140)]";
  };

  const getPredictionIcon = (direction) => {
    if (direction === "up") return "↑";
    if (direction === "down") return "↓";
    return "→";
  };

  if (loading) {
    return (
      <Card className="h-full">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-[rgb(230,230,230)]">
          AI Predictions
        </h2>
        <button
          onClick={fetchPredictions}
          className="text-sm hover:
          bg-gray-400/20 p-1 rounded-md text-[#0AFA92] hover:text-[#0AFA92]/80 transition-colors"
          disabled={loading}
        >
          <RefreshCcw className="w-4 h-4 animate-spin-slow" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[#FF453A]/10 border border-[#FF453A]/20 rounded-lg text-[#FF453A] text-sm">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3">
        {predictions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <p className="text-[rgb(140,140,140)] mb-2">
              No predictions available
            </p>
            <p className="text-sm text-[rgb(100,100,100)]">
              Add stocks to your watchlist to see AI predictions
            </p>
          </div>
        ) : (
          predictions.map((prediction) => (
            <div
              key={prediction.ticker}
              className="p-4 bg-[rgb(40,40,40)] rounded-lg border border-[rgb(60,60,60)] hover:border-[#0AFA92]/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-[rgb(230,230,230)]">
                      {prediction.ticker}
                    </h3>
                    {prediction.ml_available && (
                      <span className="px-2 py-0.5 bg-[#0AFA92]/20 text-[#0AFA92] text-xs font-medium rounded-full">
                        ML
                      </span>
                    )}
                  </div>
                  {prediction.model && (
                    <p className="text-xs text-[rgb(100,100,100)] mt-1">
                      Model: {prediction.model}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span
                    className={`text-2xl font-bold ${getPredictionColor(
                      (prediction.price_change || 0) > 0
                        ? "up"
                        : (prediction.price_change || 0) < 0
                        ? "down"
                        : "neutral"
                    )}`}
                  >
                    {getPredictionIcon(
                      (prediction.price_change || 0) > 0
                        ? "up"
                        : (prediction.price_change || 0) < 0
                        ? "down"
                        : "neutral"
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[rgb(140,140,140)]">
                    Current Price:
                  </span>
                  <span className="text-[rgb(230,230,230)] font-medium">
                    ${prediction.current_price?.toFixed(2) || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[rgb(140,140,140)]">
                    Predicted Price:
                  </span>
                  <span className="text-[rgb(230,230,230)] font-medium">
                    ${prediction.predicted_price?.toFixed(2) || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[rgb(140,140,140)]">
                    Expected Change:
                  </span>
                  <span
                    className={`font-medium ${
                      (prediction.price_change || 0) >= 0
                        ? "text-[#0AFA92]"
                        : "text-[#FF453A]"
                    }`}
                  >
                    {(prediction.price_change || 0) >= 0 ? "+" : ""}
                    {(prediction.price_change || 0)?.toFixed(2)}%
                  </span>
                </div>
                {prediction.confidence && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[rgb(140,140,140)]">Confidence:</span>
                    <span className="text-[rgb(230,230,230)] font-medium">
                      {(prediction.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>

              {prediction.timestamp && (
                <div className="mt-2 text-xs text-[rgb(100,100,100)] text-right">
                  {new Date(prediction.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
