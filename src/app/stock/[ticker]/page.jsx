"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { usePortfolio } from "@/contexts/PortfolioContext";
import AddTransactionModal from "@/components/portfolio/AddTransactionModal";
import apiClient from "@/lib/apiClient";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  BarChart3,
  Calendar,
  Star,
  Plus,
  ArrowLeft,
  ShoppingCart,
} from "lucide-react";

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const ticker = params.ticker?.toUpperCase();

  const [stockData, setStockData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToWatchlist, setAddingToWatchlist] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  const {
    state: { holdings },
    addToWatchlist: addToWatchlistContext,
  } = usePortfolio();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (ticker && status === "authenticated") {
      fetchStockData();
    }
  }, [ticker, status]);

  const fetchStockData = async () => {
    try {
      setError("");
      setLoading(true);

      // Fetch stock details, prediction, and history in parallel
      const [detailsRes, predictionRes, historyRes] = await Promise.allSettled([
        apiClient.get(`/api/stock/${ticker}/details`),
        apiClient.get(`/api/stock/${ticker}/prediction`),
        apiClient.get(`/api/stock/${ticker}/history?period=1mo`),
      ]);

      if (detailsRes.status === "fulfilled") {
        setStockData(detailsRes.value.data);
      } else {
        console.error("Failed to fetch stock details:", detailsRes.reason);
      }

      if (predictionRes.status === "fulfilled") {
        setPrediction(predictionRes.value.data);
      } else {
        console.error("Failed to fetch prediction:", predictionRes.reason);
      }

      if (historyRes.status === "fulfilled") {
        setHistory(historyRes.value.data.history || []);
      } else {
        console.error("Failed to fetch history:", historyRes.reason);
      }

      if (detailsRes.status === "rejected") {
        setError("Failed to load stock data. Please check the ticker symbol.");
      }
    } catch (err) {
      console.error("Error fetching stock data:", err);
      setError("Failed to load stock data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      4000
    );
  };

  const addToWatchlist = async () => {
    try {
      setAddingToWatchlist(true);
      await addToWatchlistContext(ticker);
      showNotification(`${ticker} added to watchlist successfully!`, "success");
    } catch (err) {
      showNotification(err.message || "Failed to add to watchlist", "error");
    } finally {
      setAddingToWatchlist(false);
    }
  };

  // Check if stock is in portfolio
  const portfolioHolding = holdings.find((h) => h.ticker === ticker);
  const isInPortfolio = !!portfolioHolding;

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !stockData) {
    return (
      <div className="min-h-screen bg-[rgb(20,20,20)]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <Card>
            <div className="text-center py-12">
              <p className="text-[#FF453A] text-lg mb-4">{error}</p>
              <Button onClick={fetchStockData}>Retry</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const isPositive = stockData?.change >= 0;
  const changeColor = isPositive ? "text-[#0AFA92]" : "text-[#FF453A]";
  const predictionColor =
    prediction?.direction === "up" ? "text-[#0AFA92]" : "text-[#FF453A]";

  return (
    <div className="min-h-screen bg-[rgb(20,20,20)]">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-[rgb(230,230,230)]">
                {ticker}
              </h1>
              <p className="text-[rgb(140,140,140)]">{stockData?.name}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowTransactionModal(true)}
              className="flex items-center gap-2 bg-[#0AFA92] text-black hover:bg-[#0AFA92]/90"
            >
              <ShoppingCart size={16} />
              {isInPortfolio ? "Buy More" : "Buy Stock"}
            </Button>
            <Button
              onClick={addToWatchlist}
              disabled={addingToWatchlist}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              {addingToWatchlist ? "Adding..." : "Watchlist"}
            </Button>
          </div>
        </div>

        {/* Notification */}
        {notification.show && (
          <Card
            className={`p-4 mb-6 ${
              notification.type === "success"
                ? "bg-[#0AFA92]/10 border-[#0AFA92]/20"
                : "bg-[#FF453A]/10 border-[#FF453A]/20"
            }`}
          >
            <p
              className={`font-medium ${
                notification.type === "success"
                  ? "text-[#0AFA92]"
                  : "text-[#FF453A]"
              }`}
            >
              {notification.message}
            </p>
          </Card>
        )}

        {/* Portfolio Status */}
        {isInPortfolio && (
          <Card className="p-4 mb-6 bg-[#0AFA92]/10 border-[#0AFA92]/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[#0AFA92] font-semibold">
                  In Your Portfolio
                </h3>
                <p className="text-[rgb(140,140,140)] text-sm">
                  {portfolioHolding?.shares || 0} shares • Avg Cost: $
                  {(portfolioHolding?.avgCost || 0).toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[rgb(230,230,230)] font-semibold">
                  ${(portfolioHolding?.totalValue || 0).toFixed(2)}
                </p>
                <p
                  className={`text-sm ${
                    (portfolioHolding?.gain || 0) >= 0
                      ? "text-[#0AFA92]"
                      : "text-[#FF453A]"
                  }`}
                >
                  {(portfolioHolding?.gain || 0) >= 0 ? "+" : ""}$
                  {(portfolioHolding?.gain || 0).toFixed(2)}(
                  {portfolioHolding.gainPercent.toFixed(2)}%)
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Main Stats - Enhanced Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-[rgb(140,140,140)]">Current Price</p>
              <p className="text-3xl font-bold text-[rgb(230,230,230)]">
                ${stockData?.price?.toFixed(2)}
              </p>
              <div className={`flex items-center gap-2 ${changeColor}`}>
                {isPositive ? (
                  <TrendingUp size={20} />
                ) : (
                  <TrendingDown size={20} />
                )}
                <span className="font-semibold">
                  {isPositive ? "+" : ""}
                  {stockData?.change?.toFixed(2)} ({isPositive ? "+" : ""}
                  {stockData?.changePercent?.toFixed(2)}%)
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-[rgb(140,140,140)]">Market Cap</p>
              <p className="text-2xl font-bold text-[rgb(230,230,230)]">
                {stockData?.marketCap
                  ? stockData.marketCap >= 1e12
                    ? `$${(stockData.marketCap / 1e12).toFixed(2)}T`
                    : stockData.marketCap >= 1e9
                    ? `$${(stockData.marketCap / 1e9).toFixed(2)}B`
                    : stockData.marketCap >= 1e6
                    ? `$${(stockData.marketCap / 1e6).toFixed(2)}M`
                    : `$${stockData.marketCap.toLocaleString()}`
                  : "N/A"}
              </p>
              <p className="text-sm text-[rgb(140,140,140)] mt-2">Volume</p>
              <p className="text-lg text-[rgb(230,230,230)]">
                {stockData?.volume
                  ? stockData.volume >= 1e6
                    ? `${(stockData.volume / 1e6).toFixed(2)}M`
                    : stockData.volume >= 1e3
                    ? `${(stockData.volume / 1e3).toFixed(2)}K`
                    : stockData.volume.toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </Card>

          <Card className="p-6 border border-[rgb(50,50,50)] bg-gradient-to-br from-[rgb(25,25,25)] to-[rgb(20,20,20)]">
            <div className="space-y-3">
              <p className="text-sm text-[rgb(140,140,140)] font-medium flex items-center gap-2">
                <span className="w-1.5 h-3 bg-[#0AFA92] rounded-full"></span>
                Day Range
              </p>
              <div className="flex justify-between items-center">
                <span className="text-lg text-[rgb(230,230,230)]">
                  ${stockData?.dayLow?.toFixed(2) || "N/A"}
                </span>
                <span className="text-lg text-[rgb(230,230,230)]">
                  ${stockData?.dayHigh?.toFixed(2) || "N/A"}
                </span>
              </div>
              {stockData?.dayLow && stockData?.dayHigh && stockData?.price && (
                <div className="w-full bg-[rgb(50,50,50)] rounded-full h-2 mt-2">
                  <div
                    className="bg-[#0AFA92] h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(
                          100,
                          ((stockData.price - stockData.dayLow) /
                            (stockData.dayHigh - stockData.dayLow)) *
                            100
                        )
                      )}%`,
                    }}
                  />
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 border border-[rgb(50,50,50)] bg-gradient-to-br from-[rgb(25,25,25)] to-[rgb(20,20,20)]">
            <div className="space-y-3">
              <p className="text-sm text-[rgb(140,140,140)] font-medium flex items-center gap-2">
                <span className="w-1.5 h-3 bg-[#0AFA92] rounded-full"></span>
                52 Week Range
              </p>
              <div className="flex justify-between items-center">
                <span className="text-lg text-[rgb(230,230,230)]">
                  ${stockData?.fiftyTwoWeekLow?.toFixed(2) || "N/A"}
                </span>
                <span className="text-lg text-[rgb(230,230,230)]">
                  ${stockData?.fiftyTwoWeekHigh?.toFixed(2) || "N/A"}
                </span>
              </div>
              {stockData?.fiftyTwoWeekLow &&
                stockData?.fiftyTwoWeekHigh &&
                stockData?.price && (
                  <div className="w-full bg-[rgb(50,50,50)] rounded-full h-2 mt-2">
                    <div
                      className="bg-[#0AFA92] h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            ((stockData.price - stockData.fiftyTwoWeekLow) /
                              (stockData.fiftyTwoWeekHigh -
                                stockData.fiftyTwoWeekLow)) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                )}
            </div>
          </Card>
        </div>

        {/* Key Financial Metrics Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[rgb(230,230,230)] mb-4 flex items-center gap-2">
            <span className="w-2 h-5 bg-[#0AFA92] rounded-full"></span>
            Key Financial Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Card className="p-5 hover:bg-[rgb(35,35,35)] hover:border-[#0AFA92]/30 border border-[rgb(50,50,50)] transition-all duration-300 hover:shadow-lg hover:shadow-[#0AFA92]/10">
              <p className="text-xs text-[rgb(140,140,140)] uppercase tracking-wide mb-2 font-medium">
                Market Cap
              </p>
              <p className="text-xl font-bold text-[rgb(230,230,230)]">
                {stockData?.marketCapFormatted ||
                  (stockData?.marketCap
                    ? stockData.marketCap >= 1e9
                      ? `$${(stockData.marketCap / 1e9).toFixed(2)}B`
                      : `$${(stockData.marketCap / 1e6).toFixed(2)}M`
                    : "N/A")}
              </p>
            </Card>

            <Card className="p-5 hover:bg-[rgb(35,35,35)] hover:border-[#0AFA92]/30 border border-[rgb(50,50,50)] transition-all duration-300 hover:shadow-lg hover:shadow-[#0AFA92]/10">
              <p className="text-xs text-[rgb(140,140,140)] uppercase tracking-wide mb-2 font-medium">
                P/E Ratio
              </p>
              <p className="text-xl font-bold text-[rgb(230,230,230)]">
                {stockData?.peRatio && typeof stockData.peRatio === "number"
                  ? stockData.peRatio.toFixed(2)
                  : "N/A"}
              </p>
            </Card>

            <Card className="p-5 hover:bg-[rgb(35,35,35)] hover:border-[#0AFA92]/30 border border-[rgb(50,50,50)] transition-all duration-300 hover:shadow-lg hover:shadow-[#0AFA92]/10">
              <p className="text-xs text-[rgb(140,140,140)] uppercase tracking-wide mb-2 font-medium">
                EPS
              </p>
              <p className="text-xl font-bold text-[rgb(230,230,230)]">
                {stockData?.eps && typeof stockData.eps === "number"
                  ? `$${stockData.eps.toFixed(2)}`
                  : "N/A"}
              </p>
            </Card>

            <Card className="p-5 hover:bg-[rgb(35,35,35)] hover:border-[#0AFA92]/30 border border-[rgb(50,50,50)] transition-all duration-300 hover:shadow-lg hover:shadow-[#0AFA92]/10">
              <p className="text-xs text-[rgb(140,140,140)] uppercase tracking-wide mb-2 font-medium">
                Forward P/E
              </p>
              <p className="text-xl font-bold text-[rgb(230,230,230)]">
                {stockData?.forwardPE && typeof stockData.forwardPE === "number"
                  ? stockData.forwardPE.toFixed(2)
                  : "N/A"}
              </p>
            </Card>

            <Card className="p-5 hover:bg-[rgb(35,35,35)] hover:border-[#0AFA92]/30 border border-[rgb(50,50,50)] transition-all duration-300 hover:shadow-lg hover:shadow-[#0AFA92]/10">
              <p className="text-xs text-[rgb(140,140,140)] uppercase tracking-wide mb-2 font-medium">
                Price/Book
              </p>
              <p className="text-xl font-bold text-[rgb(230,230,230)]">
                {stockData?.priceToBook &&
                typeof stockData.priceToBook === "number"
                  ? stockData.priceToBook.toFixed(2)
                  : "N/A"}
              </p>
            </Card>

            {stockData?.dividendYield &&
              typeof stockData.dividendYield === "number" && (
                <Card className="p-5 hover:bg-[rgb(35,35,35)] hover:border-[#0AFA92]/30 border border-[rgb(50,50,50)] transition-all duration-300 hover:shadow-lg hover:shadow-[#0AFA92]/10">
                  <p className="text-xs text-[rgb(140,140,140)] uppercase tracking-wide mb-2 font-medium">
                    Dividend Yield
                  </p>
                  <p className="text-xl font-bold text-[rgb(230,230,230)]">
                    {`${(stockData.dividendYield * 100).toFixed(2)}%`}
                  </p>
                </Card>
              )}

            {stockData?.dividendRate &&
              typeof stockData.dividendRate === "number" && (
                <Card className="p-5 hover:bg-[rgb(35,35,35)] hover:border-[#0AFA92]/30 border border-[rgb(50,50,50)] transition-all duration-300 hover:shadow-lg hover:shadow-[#0AFA92]/10">
                  <p className="text-xs text-[rgb(140,140,140)] uppercase tracking-wide mb-2 font-medium">
                    Dividend Rate
                  </p>
                  <p className="text-xl font-bold text-[rgb(230,230,230)]">
                    {`$${stockData.dividendRate.toFixed(2)}`}
                  </p>
                </Card>
              )}

            <Card className="p-5 hover:bg-[rgb(35,35,35)] hover:border-[#0AFA92]/30 border border-[rgb(50,50,50)] transition-all duration-300 hover:shadow-lg hover:shadow-[#0AFA92]/10">
              <p className="text-xs text-[rgb(140,140,140)] uppercase tracking-wide mb-2 font-medium">
                Volume
              </p>
              <p className="text-xl font-bold text-[rgb(230,230,230)]">
                {stockData?.volume
                  ? stockData.volume >= 1e6
                    ? `${(stockData.volume / 1e6).toFixed(2)}M`
                    : stockData.volume >= 1e3
                    ? `${(stockData.volume / 1e3).toFixed(2)}K`
                    : stockData.volume.toLocaleString()
                  : "N/A"}
              </p>
            </Card>

            <Card className="p-5 hover:bg-[rgb(35,35,35)] hover:border-[#0AFA92]/30 border border-[rgb(50,50,50)] transition-all duration-300 hover:shadow-lg hover:shadow-[#0AFA92]/10">
              <p className="text-xs text-[rgb(140,140,140)] uppercase tracking-wide mb-2 font-medium">
                Avg Volume
              </p>
              <p className="text-xl font-bold text-[rgb(230,230,230)]">
                {stockData?.averageVolume
                  ? stockData.averageVolume >= 1e6
                    ? `${(stockData.averageVolume / 1e6).toFixed(2)}M`
                    : stockData.averageVolume >= 1e3
                    ? `${(stockData.averageVolume / 1e3).toFixed(2)}K`
                    : stockData.averageVolume.toLocaleString()
                  : "N/A"}
              </p>
            </Card>

            <Card className="p-5 hover:bg-[rgb(35,35,35)] hover:border-[#0AFA92]/30 border border-[rgb(50,50,50)] transition-all duration-300 hover:shadow-lg hover:shadow-[#0AFA92]/10">
              <p className="text-xs text-[rgb(140,140,140)] uppercase tracking-wide mb-2 font-medium">
                Shares Outstanding
              </p>
              <p className="text-xl font-bold text-[rgb(230,230,230)]">
                {stockData?.sharesOutstanding
                  ? stockData.sharesOutstanding >= 1e9
                    ? `${(stockData.sharesOutstanding / 1e9).toFixed(2)}B`
                    : stockData.sharesOutstanding >= 1e6
                    ? `${(stockData.sharesOutstanding / 1e6).toFixed(2)}M`
                    : stockData.sharesOutstanding.toLocaleString()
                  : "N/A"}
              </p>
            </Card>
          </div>
        </div>

        {/* Additional Information Section */}
        {(stockData?.sector ||
          stockData?.industry ||
          stockData?.targetPrice) && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[rgb(230,230,230)] mb-4 flex items-center gap-2">
              <span className="w-2 h-5 bg-[#0AFA92] rounded-full"></span>
              Additional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stockData?.sector && (
                <Card className="p-6">
                  <div className="space-y-2">
                    <p className="text-sm text-[rgb(140,140,140)]">Sector</p>
                    <p className="text-lg font-semibold text-[rgb(230,230,230)]">
                      {stockData.sector}
                    </p>
                    {stockData?.industry && (
                      <p className="text-sm text-[rgb(140,140,140)]">
                        {stockData.industry}
                      </p>
                    )}
                  </div>
                </Card>
              )}

              {stockData?.targetPrice && (
                <Card className="p-6">
                  <div className="space-y-2">
                    <p className="text-sm text-[rgb(140,140,140)]">
                      Analyst Target
                    </p>
                    <p className="text-2xl font-bold text-[#0AFA92]">
                      ${stockData.targetPrice.toFixed(2)}
                    </p>
                    {stockData?.recommendationMean && (
                      <p className="text-sm text-[rgb(140,140,140)]">
                        Rating: {stockData.recommendationMean.toFixed(1)}/5.0
                      </p>
                    )}
                  </div>
                </Card>
              )}

              {stockData?.fullTimeEmployees && (
                <Card className="p-6">
                  <div className="space-y-2">
                    <p className="text-sm text-[rgb(140,140,140)]">Employees</p>
                    <p className="text-2xl font-bold text-[rgb(230,230,230)]">
                      {stockData.fullTimeEmployees.toLocaleString()}
                    </p>
                    {stockData?.website && (
                      <a
                        href={stockData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#0AFA92] hover:text-[#0AFA92]/80 transition-colors"
                      >
                        Visit Website →
                      </a>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* AI ML Prediction */}
        {prediction && (() => {
          // Calculate change percentage if not provided
          const calculatedChangePercent = prediction.change_percent !== undefined && prediction.change_percent !== null
            ? prediction.change_percent
            : (prediction.current_price && prediction.predicted_price)
            ? ((prediction.predicted_price - prediction.current_price) / prediction.current_price) * 100
            : null;
          
          // Determine color based on prediction direction or change percentage
          const predictionColor = calculatedChangePercent > 0 
            ? 'text-green-400' 
            : calculatedChangePercent < 0 
            ? 'text-red-400' 
            : 'text-gray-400';
          
          return (
          <Card className={`mb-8 p-8 bg-gradient-to-br ${
            calculatedChangePercent > 0 
              ? 'from-green-900/20 via-transparent to-green-800/20 border-green-500/30 shadow-2xl shadow-green-500/10'
              : calculatedChangePercent < 0
              ? 'from-red-900/20 via-transparent to-red-800/20 border-red-500/30 shadow-2xl shadow-red-500/10'
              : 'from-gray-900/20 via-transparent to-gray-800/20 border-gray-500/30 shadow-2xl shadow-gray-500/10'
          }`}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-8 rounded-full ${
                  calculatedChangePercent > 0 
                    ? 'bg-gradient-to-b from-green-400 to-green-600'
                    : calculatedChangePercent < 0
                    ? 'bg-gradient-to-b from-red-400 to-red-600'
                    : 'bg-gradient-to-b from-gray-400 to-gray-600'
                }`}></div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">
                    AI Price Prediction
                  </h2>
                </div>
                {prediction.ml_available && (
                  <span className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-gray-500/20 text-green-300 text-sm font-semibold rounded-full border border-green-400/30">
                    {prediction.model || "ML Model"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`text-5xl font-bold ${predictionColor} drop-shadow-lg`}
                >
                  {calculatedChangePercent > 0
                    ? "↑"
                    : calculatedChangePercent < 0
                    ? "↓"
                    : "→"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-xl border border-slate-600/30">
                <p className="text-sm text-green-300 mb-3 font-medium uppercase tracking-wide">
                  Current Price
                </p>
                <p className="text-3xl font-bold text-white">
                  ${prediction.current_price?.toFixed(2)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-xl border border-slate-600/30">
                <p className="text-sm text-green-300 mb-3 font-medium uppercase tracking-wide">
                  Predicted Price
                </p>
                <p
                  className={`text-3xl font-bold ${predictionColor} drop-shadow-sm`}
                >
                  ${prediction.predicted_price?.toFixed(2)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-xl border border-slate-600/30">
                <p className="text-sm text-green-300 mb-3 font-medium uppercase tracking-wide">
                  Expected Change
                </p>
                <p
                  className={`text-3xl font-bold ${predictionColor} drop-shadow-sm`}
                >
                  {calculatedChangePercent !== null && calculatedChangePercent !== undefined
                    ? `${calculatedChangePercent >= 0 ? '+' : ''}${calculatedChangePercent.toFixed(2)}%`
                    : 'N/A'
                  }
                </p>
              </div>
              {prediction.confidence && (
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-xl border border-slate-600/30">
                  <p className="text-sm text-green-300 mb-3 font-medium uppercase tracking-wide">
                    Confidence Level
                  </p>
                  <div className="space-y-3">
                    <p className="text-3xl font-bold text-white">
                      {(prediction.confidence * 100).toFixed(1)}%
                    </p>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-400 to-gray-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: `${prediction.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {prediction.timestamp && (
              <div className="mt-6 pt-6 border-t border-green-500/20">
                <p className="text-sm text-green-300/70 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Last updated:{" "}
                  {new Date(prediction.timestamp).toLocaleString()}
                </p>
              </div>
            )}
          </Card>
          );
        })()}

        {/* Company Info - Enhanced */}
        <Card className="mb-8 p-6 border border-[rgb(50,50,50)] bg-gradient-to-br from-[rgb(25,25,25)] to-[rgb(20,20,20)]">
          <h2 className="text-2xl font-semibold text-[rgb(230,230,230)] mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-[#0AFA92] rounded-full"></span>
            Company Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[rgb(140,140,140)] uppercase tracking-wide mb-2 font-medium">
                  Company Name
                </p>
                <p className="text-lg font-semibold text-[rgb(230,230,230)] leading-tight">
                  {stockData?.name || ticker}
                </p>
              </div>
              {stockData?.sector && (
                <div>
                  <p className="text-xs text-[rgb(140,140,140)] uppercase tracking-wide mb-1">
                    Sector
                  </p>
                  <p className="text-lg text-[rgb(230,230,230)]">
                    {stockData.sector}
                  </p>
                </div>
              )}
              {stockData?.industry && (
                <div>
                  <p className="text-xs text-[rgb(140,140,140)] uppercase tracking-wide mb-1">
                    Industry
                  </p>
                  <p className="text-lg text-[rgb(230,230,230)]">
                    {stockData.industry}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-[rgb(140,140,140)] uppercase tracking-wide mb-1">
                  Previous Close
                </p>
                <p className="text-lg text-[rgb(230,230,230)]">
                  ${stockData?.previousClose?.toFixed(2) || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-[rgb(140,140,140)] uppercase tracking-wide mb-1">
                  Open Price
                </p>
                <p className="text-lg text-[rgb(230,230,230)]">
                  ${stockData?.open?.toFixed(2) || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-[rgb(140,140,140)] uppercase tracking-wide mb-1">
                  Bid × Ask
                </p>
                <p className="text-lg text-[rgb(230,230,230)]">
                  ${stockData?.bid?.toFixed(2) || "N/A"} × $
                  {stockData?.ask?.toFixed(2) || "N/A"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {stockData?.targetPrice && (
                <div>
                  <p className="text-xs text-[rgb(140,140,140)] uppercase tracking-wide mb-1">
                    Target Price
                  </p>
                  <p className="text-lg text-[rgb(230,230,230)]">
                    ${stockData.targetPrice.toFixed(2)}
                  </p>
                </div>
              )}
              {stockData?.fullTimeEmployees && (
                <div>
                  <p className="text-xs text-[rgb(140,140,140)] uppercase tracking-wide mb-1">
                    Employees
                  </p>
                  <p className="text-lg text-[rgb(230,230,230)]">
                    {stockData.fullTimeEmployees.toLocaleString()}
                  </p>
                </div>
              )}
              {stockData?.exDividendDate && (
                <div>
                  <p className="text-xs text-[rgb(140,140,140)] uppercase tracking-wide mb-1">
                    Ex-Dividend Date
                  </p>
                  <p className="text-lg text-[rgb(230,230,230)]">
                    {(() => {
                      try {
                        // Handle different date formats from Yahoo Finance
                        let date;
                        if (typeof stockData.exDividendDate === "number") {
                          // Unix timestamp (seconds or milliseconds)
                          date =
                            stockData.exDividendDate > 1e10
                              ? new Date(stockData.exDividendDate)
                              : new Date(stockData.exDividendDate * 1000);
                        } else if (
                          typeof stockData.exDividendDate === "string"
                        ) {
                          // String date
                          date = new Date(stockData.exDividendDate);
                        } else {
                          return "N/A";
                        }

                        return isNaN(date.getTime())
                          ? "N/A"
                          : date.toLocaleDateString();
                      } catch (error) {
                        return "N/A";
                      }
                    })()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Business Summary */}
        {stockData?.description &&
          stockData.description !==
            `${stockData.name || ticker} stock information.` && (
            <Card className="mb-8 p-6 border border-[rgb(50,50,50)] bg-gradient-to-br from-[rgb(25,25,25)] to-[rgb(20,20,20)]">
              <h2 className="text-2xl font-semibold text-[rgb(230,230,230)] mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-[#0AFA92] rounded-full"></span>
                Business Summary
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-[rgb(180,180,180)] leading-relaxed text-base">
                  {stockData.description}
                </p>
              </div>
            </Card>
          )}

        {/* Recent Price History */}
        {history.length > 0 && (
          <Card className="border border-[rgb(50,50,50)] bg-gradient-to-br from-[rgb(25,25,25)] to-[rgb(20,20,20)]">
            <h2 className="text-xl font-semibold text-[rgb(230,230,230)] mb-6 flex items-center gap-2">
              <span className="w-2 h-5 bg-[#0AFA92] rounded-full"></span>
              Recent Price History
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgb(60,60,60)]">
                    <th className="text-left py-3 px-4 text-sm text-[rgb(140,140,140)]">
                      Date
                    </th>
                    <th className="text-right py-3 px-4 text-sm text-[rgb(140,140,140)]">
                      Open
                    </th>
                    <th className="text-right py-3 px-4 text-sm text-[rgb(140,140,140)]">
                      High
                    </th>
                    <th className="text-right py-3 px-4 text-sm text-[rgb(140,140,140)]">
                      Low
                    </th>
                    <th className="text-right py-3 px-4 text-sm text-[rgb(140,140,140)]">
                      Close
                    </th>
                    <th className="text-right py-3 px-4 text-sm text-[rgb(140,140,140)]">
                      Volume
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 10).map((day, index) => (
                    <tr
                      key={index}
                      className="border-b border-[rgb(50,50,50)] hover:bg-[rgb(35,35,35)] transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-[rgb(230,230,230)]">
                        {new Date(day.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-[rgb(230,230,230)]">
                        ${day.open?.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-[rgb(230,230,230)]">
                        ${day.high?.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-[rgb(230,230,230)]">
                        ${day.low?.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-[rgb(230,230,230)]">
                        ${day.close?.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-[rgb(230,230,230)]">
                        {(day.volume / 1e6).toFixed(2)}M
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <AddTransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        onSuccess={() => {
          // Transaction added, portfolio will auto-update via context
          console.log("Transaction added successfully");
        }}
        defaultTicker={ticker}
      />
    </div>
  );
}
