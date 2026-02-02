"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

interface ChartData {
  value: number;
  color: string;
}

interface DynamicChartProps {
  variant?: "auth" | "landing";
  className?: string;
}

export default function DynamicChart({ variant = "auth", className = "" }: DynamicChartProps) {
  const [chartData, setChartData] = useState<ChartData[]>([
    { value: 65, color: "#0AFA92" },
    { value: 75, color: "#0AFA92" },
    { value: 70, color: "#0AFA92" },
    { value: 85, color: "#0AFA92" },
    { value: 80, color: "#0AFA92" },
    { value: 90, color: "#0AFA92" },
    { value: 85, color: "#0AFA92" },
    { value: 95, color: "#0AFA92" },
    ...(variant === "landing" ? [
      { value: 88, color: "#0AFA92" },
      { value: 92, color: "#0AFA92" },
    ] : [])
  ]);

  // Animate chart data
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData((prev) => {
        const newData = [...prev];
        newData.shift();
        newData.push({
          value: 60 + Math.random() * 40,
          color: "#0AFA92",
        });
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const currentValue = chartData[chartData.length - 1]?.value || 0;
  const portfolioValue = 125450 + currentValue * 100;
  const gainPercent = 14.05 + (Math.random() * 2 - 1);

  return (
    <motion.div
      className={`${variant === "auth" ? "bg-[rgb(25,25,25)] border-[rgb(40,40,40)]" : "bg-gradient-to-br from-[rgb(25,25,25)] via-[rgb(30,30,30)] to-[rgb(20,20,20)] border-[rgb(45,45,45)]"} rounded-xl p-6 border ${className}`}
      whileHover={{ borderColor: "rgba(10, 250, 146, 0.3)" }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-[rgb(140,140,140)]">
            Portfolio Value
          </p>
          <motion.p
            className={`${variant === "auth" ? "text-3xl" : "text-2xl sm:text-3xl"} font-bold text-[rgb(230,230,230)]`}
            key={currentValue}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ${portfolioValue.toLocaleString()}
          </motion.p>
        </div>
        <div className={`px-3 py-1.5 bg-[#0AFA92]/10 rounded-lg ${variant === "landing" ? "flex items-center gap-2" : ""}`}>
          {variant === "landing" && (
            <TrendingUp size={16} className="text-[#0AFA92] sm:w-[18px] sm:h-[18px]" />
          )}
          <span className={`text-[#0AFA92] font-semibold ${variant === "auth" ? "text-sm" : "text-sm sm:text-base"}`}>
            +{gainPercent.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Dynamic Bar Chart */}
      <div className={`${variant === "auth" ? "h-32" : "h-48"} flex items-end gap-2`}>
        {chartData.map((bar, i) => (
          <motion.div
            key={i}
            className={`flex-1 rounded-t ${
              variant === "auth" 
                ? "bg-gradient-to-t from-[#0AFA92] to-[#0AFA92]/50" 
                : "bg-gradient-to-t from-[#0AFA92] to-[#0AFA92]/50"
            }`}
            initial={{ height: 0 }}
            animate={{ height: `${bar.value}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ 
              background: `linear-gradient(to top, #0AFA92, rgba(10, 250, 146, 0.5))`,
              minHeight: '4px' // Ensure minimum visibility
            }}
          />
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-[rgb(40,40,40)]">
        <div className={variant === "landing" ? "text-center" : ""}>
          <p className="text-xs text-[rgb(140,140,140)] mb-1">
            {variant === "auth" ? "Holdings" : "Total Gain"}
          </p>
          {variant === "auth" ? (
            <p className="text-lg font-semibold text-[rgb(230,230,230)]">
              12
            </p>
          ) : (
            <motion.p 
              className="text-sm sm:text-base text-[#0AFA92] font-semibold"
              key={currentValue}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              +${(15.4 + currentValue / 20).toFixed(1)}K
            </motion.p>
          )}
        </div>
        <div className={variant === "landing" ? "text-center" : ""}>
          <p className="text-xs text-[rgb(140,140,140)] mb-1">
            {variant === "auth" ? "Win Rate" : "Holdings"}
          </p>
          {variant === "auth" ? (
            <p className="text-lg font-semibold text-[#0AFA92]">87%</p>
          ) : (
            <p className="text-sm sm:text-base text-[rgb(230,230,230)] font-semibold">
              {Math.floor(4 + currentValue / 25)}
            </p>
          )}
        </div>
        <div className={variant === "landing" ? "text-center" : ""}>
          <p className="text-xs text-[rgb(140,140,140)] mb-1">
            AI {variant === "auth" ? "Score" : "Signal"}
          </p>
          {variant === "auth" ? (
            <p className="text-lg font-semibold text-[#0AFA92]">
              9.2/10
            </p>
          ) : (
            <motion.p 
              className="text-sm sm:text-base text-[#0AFA92] font-semibold"
              key={Math.floor(Date.now() / 5000)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {currentValue > 75 ? "BUY" : "HOLD"}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
}