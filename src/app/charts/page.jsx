"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { usePortfolio } from "@/contexts/PortfolioContext";
import {
  Search,
  Download,
  Eye,
  TrendingUp,
  Zap,
  ChartLine,
} from "lucide-react";

export default function ChartsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const {
    state: { watchlist },
  } = usePortfolio();

  const [searchTicker, setSearchTicker] = useState("");
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedChartType, setSelectedChartType] = useState("prediction");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingChart, setDownloadingChart] = useState(null);
  const [chartPreview, setChartPreview] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const handleLoadChart = async (ticker) => {
    if (!ticker) return;

    setIsLoadingPreview(true);
    try {
      console.log(`Loading chart for ${ticker}...`);

      // Fetch the chart as a blob with preview parameter
      const response = await fetch(
        `/api/download_chart/${ticker}/prediction?preview=true`
      );

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error(
          `Failed to load chart: ${response.status} ${response.statusText}`
        );
      }

      const blob = await response.blob();
      console.log("Blob received:", {
        size: blob.size,
        type: blob.type,
      });

      // If blob type is not image, let's see what we actually received
      if (!blob.type.startsWith("image/")) {
        console.warn("Unexpected blob type:", blob.type);
        // Read first part of blob as text to see what we got
        const textSample = await blob.slice(0, 500).text();
        console.log("Blob content sample:", textSample);

        // If it looks like JSON or HTML error, throw error
        if (textSample.includes("error") || textSample.includes("<html>")) {
          throw new Error(
            `Received error response instead of image: ${textSample.substring(
              0,
              100
            )}...`
          );
        }
      }

      // Check if blob is empty or invalid
      if (blob.size === 0) {
        throw new Error("Received empty image data");
      }

      const url = window.URL.createObjectURL(blob);
      console.log("Created blob URL:", url);

      // Test the blob URL by creating a temporary image
      const testImage = new Image();
      testImage.onload = () => {
        console.log(
          "Blob URL is valid, image dimensions:",
          testImage.width,
          "x",
          testImage.height
        );
        setChartPreview({ url, ticker, type: "prediction" });
        setIsLoadingPreview(false);
      };
      testImage.onerror = (e) => {
        console.error("Invalid blob URL or corrupted image data:", e);
        window.URL.revokeObjectURL(url);
        setIsLoadingPreview(false);
        throw new Error("Invalid image data received");
      };
      testImage.src = url;
    } catch (error) {
      console.error("Chart loading failed:", error);
      alert(`Failed to load chart: ${error.message}`);
      setIsLoadingPreview(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Auto-load chart when stock is selected
  useEffect(() => {
    if (selectedStock) {
      handleLoadChart(selectedStock);
    }
  }, [selectedStock]);

  const chartTypes = [
    {
      id: "prediction",
      label: "AI Prediction",
      icon: Zap,
      description: "ML-powered price predictions and forecasts",
      color: "text-purple-400",
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTicker.trim()) {
      setSelectedStock(searchTicker.toUpperCase().trim());
    }
  };

  const handleDownloadChart = async (ticker, type) => {
    if (!ticker) return;

    setIsDownloading(true);
    setDownloadingChart(type);
    try {
      // Fetch the chart as a blob
      const response = await fetch(`/api/download_chart/${ticker}/${type}`);
      if (!response.ok) {
        throw new Error("Failed to download chart");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link to trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `${ticker}_${type}_chart.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download chart. Please try again.");
    } finally {
      setIsDownloading(false);
      setDownloadingChart(null);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
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
              className=""
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[rgb(230,230,230)] via-[rgb(200,200,200)] to-[rgb(170,170,170)] bg-clip-text text-transparent">
                  Predicted Stock Charts
                </h1>
              </div>
            </motion.div>

            {/* Professional Control Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className=""
            >
              {/* Search Panel */}
              <Card className="h-full p-6 bg-transparent border-none">
                <form
                  onSubmit={handleSearch}
                  className="flex items-center justify-center"
                >
                  <input
                    type="text"
                    value={searchTicker}
                    onChange={(e) => setSearchTicker(e.target.value)}
                    placeholder="Enter stock name (AAPL, MSFT, GOOGL, TCS.NS)..."
                    className="w-3/5 px-4 py-4 bg-[rgb(35,35,35)] border border-[rgb(55,55,55)] rounded-l-full text-[rgb(230,230,230)] placeholder-[rgb(120,120,120)] focus:border-[#0AFA92] focus:outline-none focus:ring-2 focus:ring-[#0AFA92]/20 transition-all duration-200 text-lg"
                  />
                  <Button
                    type="submit"
                    className="py-5 pr-6 bg-gradient-to-r from-[#0AFA92] to-[#0AFA92]/80 hover:from-[#0AFA92]/90 hover:to-[#0AFA92]/70 text-black font-semibold rounded-r-full transition-all duration-200"
                  >
                    <Search size={20} />
                  </Button>
                </form>
              </Card>
            </motion.div>

            {/* Compact Side by Side Panels */}
            <div className="flex gap-6 mb-8">
              {/* Watchlist Quick Access */}
              {watchlist && watchlist.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="w-full"
                >
                  <Card className="p-4 bg-gradient-to-br from-[rgb(25,25,25)] via-[rgb(30,30,30)] to-[rgb(20,20,20)] border-[rgb(45,45,45)] shadow-xl h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-lg flex items-center justify-center">
                          <TrendingUp className="text-purple-400" size={16} />
                        </div>
                        <h2 className="text-lg font-semibold text-[rgb(230,230,230)]">
                          Your Watchlist
                        </h2>
                      </div>
                      <span className="text-xs text-[rgb(120,120,120)]">
                        {watchlist.length} stocks
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {watchlist.slice(0, 6).map((item, index) => (
                        <motion.div
                          key={item.ticker}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.05 * index }}
                        >
                          <button
                            onClick={() => setSelectedStock(item.ticker)}
                            className={`w-full px-3 py-2 border rounded-lg transition-all duration-200 transform hover:scale-105 font-medium text-sm ${
                              selectedStock === item.ticker
                                ? "bg-[#0AFA92]/20 border-[#0AFA92]/50 text-[#0AFA92] shadow-lg shadow-[#0AFA92]/10"
                                : "bg-[rgb(40,40,40)] hover:bg-[rgb(50,50,50)] border-[rgb(60,60,60)] text-[rgb(220,220,220)] hover:border-[rgb(80,80,80)]"
                            }`}
                          >
                            {item.ticker}
                          </button>
                        </motion.div>
                      ))}
                    </div>
                    {watchlist.length > 6 && (
                      <p className="text-xs text-[rgb(140,140,140)] mt-2 text-center">
                        +{watchlist.length - 6} more stocks
                      </p>
                    )}
                  </Card>
                </motion.div>
              )}

              {/* Compact Instructions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: watchlist && watchlist.length > 0 ? 0.3 : 0.2,
                }}
                // className="w-2/3"
                className={`${
                  watchlist && watchlist.length > 0
                    ? "w-full lg:w-2/3"
                    : "w-full"
                }`}
              >
                <Card className="p-4 bg-gradient-to-br from-[rgb(25,25,25)] via-[rgb(30,30,30)] to-[rgb(20,20,20)] border-[rgb(45,45,45)] h-full">
                  <h2 className="text-lg font-semibold text-[rgb(230,230,230)] mb-4">
                    How to Use Charts
                  </h2>
                  <div className="space-y-3">
                    <motion.div
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                    >
                      <div className="w-6 h-6 bg-gradient-to-r from-[#0AFA92] to-[#0AFA92]/70 rounded-full flex items-center justify-center text-black text-xs font-bold shadow-lg mt-0.5">
                        1
                      </div>
                      <div>
                        <p className="text-[rgb(230,230,230)] font-medium text-sm">
                          Search Stock
                        </p>
                        <p className="text-xs text-[rgb(140,140,140)]">
                          Enter ticker or select from watchlist
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                    >
                      <div className="w-6 h-6 bg-gradient-to-r from-[#0AFA92] to-[#0AFA92]/70 rounded-full flex items-center justify-center text-black text-xs font-bold shadow-lg mt-0.5">
                        2
                      </div>
                      <div>
                        <p className="text-[rgb(230,230,230)] font-medium text-sm">
                          View AI Predictions
                        </p>
                        <p className="text-xs text-[rgb(140,140,140)]">
                          Charts appear instantly below
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.6 }}
                    >
                      <div className="w-6 h-6 bg-gradient-to-r from-[#0AFA92] to-[#0AFA92]/70 rounded-full flex items-center justify-center text-black text-xs font-bold shadow-lg mt-0.5">
                        3
                      </div>
                      <div>
                        <p className="text-[rgb(230,230,230)] font-medium text-sm">
                          Download Charts
                        </p>
                        <p className="text-xs text-[rgb(140,140,140)]">
                          Save high-quality PNG files
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Chart Display */}
            {selectedStock && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="mb-6 p-6 bg-gradient-to-br from-[rgb(25,25,25)] via-[rgb(30,30,30)] to-[rgb(20,20,20)] border-[rgb(45,45,45)]">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-[rgb(230,230,230)]">
                      AI Prediction Chart for {selectedStock}
                    </h2>
                    {chartPreview && (
                      <button
                        onClick={() =>
                          handleDownloadChart(selectedStock, "prediction")
                        }
                        disabled={isDownloading}
                        className="py-2 px-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 transform hover:scale-105"
                      >
                        {isDownloading ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <Download size={16} />
                            Download PNG
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Inline Chart Display */}
                  <div className="bg-gradient-to-br from-[rgb(30,30,30)] to-[rgb(20,20,20)] rounded-xl border border-[rgb(45,45,45)] overflow-hidden">
                    {chartPreview && chartPreview.url ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="p-3"
                      >
                        <img
                          src={chartPreview.url}
                          alt={`${selectedStock} AI prediction chart`}
                          className="w-full h-auto rounded-lg shadow-lg"
                          style={{ imageRendering: "crisp-edges" }}
                          onLoad={() => {
                            console.log("Chart image loaded successfully");
                          }}
                          onError={(e) => {
                            console.error("Failed to load chart image:", {
                              error: e,
                              target: e.target,
                              src: e.target?.src,
                            });
                          }}
                        />
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 px-8">
                        {isLoadingPreview ? (
                          <>
                            <div className="w-16 h-16 bg-gradient-to-br from-[#0AFA92]/20 to-[#0AFA92]/10 rounded-xl flex items-center justify-center mb-4">
                              <LoadingSpinner size="lg" />
                            </div>
                            <h3 className="text-lg font-semibold text-[rgb(230,230,230)] mb-2">
                              Generating AI Chart
                            </h3>
                            <p className="text-sm text-[rgb(140,140,140)] text-center max-w-md">
                              Creating AI-powered prediction chart for {selectedStock} with 60-day forecasts and technical indicators...
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="w-16 h-16 bg-gradient-to-br from-[#0AFA92]/20 to-[#0AFA92]/10 rounded-xl flex items-center justify-center mb-4">
                              <ChartLine className="text-[#0AFA92]" size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-[rgb(230,230,230)] mb-2">
                              Chart Loading...
                            </h3>
                            <p className="text-sm text-[rgb(140,140,140)] text-center max-w-md">
                              Preparing AI prediction chart for {selectedStock}. This may take a moment...
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
