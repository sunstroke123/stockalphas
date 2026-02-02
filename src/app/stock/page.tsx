"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { usePortfolio } from "../../contexts/PortfolioContext";
import AddTransactionModal from "../../components/portfolio/AddTransactionModal";
import apiClient from "../../lib/apiClient";
import {
  TrendingUp,
  TrendingDown,
  Search,
  Plus,
  ShoppingCart,
  Star,
} from "lucide-react";

// Popular stocks to display
const POPULAR_TICKERS = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "NVDA",
  "META",
  "TSLA",
  "BRK.B",
  "V",
  "JNJ",
  "WMT",
  "JPM",
  "MA",
  "PG",
  "UNH",
  "HD",
  "DIS",
  "BAC",
  "NFLX",
  "ADBE",
  "CRM",
  "CSCO",
  "PEP",
  "KO",
];

export default function StockListPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

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

  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTicker, setSearchTicker] = useState("");
  const [error, setError] = useState("");
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  const {
    state: { holdings },
    refreshPortfolio,
    addToWatchlist: addToWatchlistContext,
  } = usePortfolio();

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      4000
    );
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchStocks();
    }
  }, [status]);

  const fetchStocks = async () => {
    try {
      setError("");
      setLoading(true);

      // Fetch details for popular stocks
      const stockPromises = POPULAR_TICKERS.map(async (ticker) => {
        try {
          const response = await apiClient.get(`/api/stock/${ticker}/details`);
          return response.data;
        } catch (err) {
          console.error(`Failed to fetch ${ticker}:`, err);
          return null;
        }
      });

      const results = await Promise.all(stockPromises);
      setStocks(results.filter((stock) => stock !== null));
    } catch (err) {
      console.error("Error fetching stocks:", err);
      setError("Failed to load stock data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTicker.trim()) {
      router.push(`/stock/${searchTicker.toUpperCase()}`);
    }
  };

  const handleStockClick = (ticker: string) => {
    router.push(`/stock/${ticker}`);
  };

  const addToWatchlist = async (
    ticker: string,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    try {
      await addToWatchlistContext(ticker);
      showNotification(`${ticker} added to watchlist successfully!`, "success");
    } catch (err: any) {
      showNotification(err.message || "Failed to add to watchlist", "error");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 bg-[#0AFA92]/3 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ top: "20%", right: "15%" }}
        />
        <motion.div
          className="absolute w-72 h-72 bg-blue-500/2 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ bottom: "20%", left: "10%" }}
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="max-w-7xl mx-auto">
            {/* Professional Header */}
            <motion.div
              className="mb-8 lg:mb-12"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[rgb(230,230,230)] via-[rgb(200,200,200)] to-[rgb(170,170,170)] bg-clip-text text-transparent">
                  Stock Market
                </h1>
                <p className="text-[rgb(140,140,140)] mt-2 text-lg">
                  Browse popular stocks and their real-time market data
                </p>
              </div>
            </motion.div>

            {/* Notification */}
            {notification.show && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Card
                  className={`p-4 ${
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
              </motion.div>
            )}

            {/* Professional Search Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8"
            >
              <Card className="h-full p-6 bg-transparent border-none">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                  }}
                  className="flex items-center justify-center"
                >
                  <input
                    type="text"
                    value={searchTicker}
                    onChange={(e) =>
                      setSearchTicker(e.target.value.toUpperCase())
                    }
                    placeholder="Enter stock ticker (AAPL, MSFT, GOOGL, AMZN)..."
                    className="w-3/5 px-4 py-4 bg-[rgb(35,35,35)] border border-[rgb(55,55,55)] rounded-l-full text-[rgb(230,230,230)] placeholder-[rgb(120,120,120)] focus:border-[#0AFA92] focus:outline-none focus:ring-2 focus:ring-[#0AFA92]/20 transition-all duration-200 text-lg"
                  />
                  <Button
                    type="submit"
                    onClick={() => {}}
                    className="py-5 pr-6 bg-gradient-to-r from-[#0AFA92] to-[#0AFA92]/80 hover:from-[#0AFA92]/90 hover:to-[#0AFA92]/70 text-black font-semibold rounded-r-full transition-all duration-200"
                  >
                    <Search size={20} />
                  </Button>
                </form>
              </Card>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Card className="p-6">
                  <div className="text-center">
                    <p className="text-[#FF453A] mb-4">{error}</p>
                    <Button onClick={fetchStocks}>Retry</Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Stock Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {stocks.map((stock) => {
                const isPositive = (stock.change ?? 0) >= 0;
                const changeColor = isPositive
                  ? "text-[#0AFA92]"
                  : "text-[#FF453A]";

                const portfolioHolding = holdings.find(
                  (h) => h.ticker === stock.ticker
                );
                const isInPortfolio = !!portfolioHolding;

                return (
                  <Card
                    key={stock.ticker}
                    className={`p-0 ${
                      isInPortfolio ? "border-[#0AFA92]/30" : ""
                    }`}
                  >
                    {isInPortfolio && (
                      <div className="bg-[#0AFA92]/10 px-3 py-1 text-xs text-[#0AFA92] font-medium">
                        <Star size={12} className="inline mr-1" />
                        {portfolioHolding.shares} shares owned
                      </div>
                    )}
                    <div
                      className="p-5 cursor-pointer hover:border-[#0AFA92]/30 transition-all group"
                      onClick={() => handleStockClick(stock.ticker)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-[rgb(230,230,230)] mb-1">
                            {stock.ticker}
                          </h3>
                          <p className="text-sm text-[rgb(140,140,140)] truncate">
                            {stock.name}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTicker(stock.ticker);
                              setShowTransactionModal(true);
                            }}
                            className="p-2 hover:bg-[rgb(50,50,50)] rounded-lg transition-colors"
                            title="Buy stock"
                          >
                            <ShoppingCart
                              size={16}
                              className="text-[rgb(140,140,140)] hover:text-[#0AFA92]"
                            />
                          </button>
                          <button
                            onClick={(e) => addToWatchlist(stock.ticker, e)}
                            className="p-2 hover:bg-[rgb(50,50,50)] rounded-lg transition-colors"
                            title="Add to watchlist"
                          >
                            <Plus
                              size={16}
                              className="text-[rgb(140,140,140)] hover:text-[#0AFA92]"
                            />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-[rgb(230,230,230)]">
                            ${stock.price?.toFixed(2)}
                          </span>
                        </div>

                        <div
                          className={`flex items-center gap-1 ${changeColor}`}
                        >
                          {isPositive ? (
                            <TrendingUp size={16} />
                          ) : (
                            <TrendingDown size={16} />
                          )}
                          <span className="font-semibold text-sm">
                            {isPositive ? "+" : ""}
                            {stock.change?.toFixed(2)} ({isPositive ? "+" : ""}
                            {stock.changePercent?.toFixed(2)}%)
                          </span>
                        </div>

                        <div className="pt-3 mt-3 border-t border-[rgb(60,60,60)] space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-[rgb(140,140,140)]">
                              Market Cap
                            </span>
                            <span className="text-[rgb(230,230,230)] font-medium">
                              {stock.marketCap != null
                                ? `${(stock.marketCap / 1e9).toFixed(2)}B`
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-[rgb(140,140,140)]">
                              Volume
                            </span>
                            <span className="text-[rgb(230,230,230)] font-medium">
                              {stock.volume != null
                                ? `${(stock.volume / 1e6).toFixed(2)}M`
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-[rgb(140,140,140)]">
                              P/E Ratio
                            </span>
                            <span className="text-[rgb(230,230,230)] font-medium">
                              {stock.peRatio?.toFixed(2) || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </motion.div>

            {stocks.length === 0 && !loading && !error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="p-12">
                  <div className="text-center">
                    <p className="text-[rgb(140,140,140)] text-lg">
                      No stocks available
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <AddTransactionModal
        isOpen={showTransactionModal}
        onClose={() => {
          setShowTransactionModal(false);
          setSelectedTicker("");
        }}
        onSuccess={() => {
          // Transaction added, portfolio will auto-update
          refreshPortfolio();
        }}
        defaultTicker={selectedTicker}
      />
    </div>
  );
}
