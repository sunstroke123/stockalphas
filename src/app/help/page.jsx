"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  PieChart,
  LayoutDashboard,
  BookOpen,
  Search,
  Plus,
  Eye,
  LineChart,
  Bell,
  Settings,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  Check,
} from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  const sections = [
    {
      title: "Getting Started",
      icon: BookOpen,
      color: "#0AFA92",
      items: [
        {
          title: "Create Your Account",
          description:
            "Sign up with your email and password to get started with StockAlphas.",
          steps: [
            'Click on "Sign In" in the navigation',
            'Switch to the "Sign Up" tab',
            "Enter your name, email, and password",
            'Click "Create Account" to register',
          ],
        },
        {
          title: "Navigate the Dashboard",
          description: "Access all features from the sidebar navigation.",
          steps: [
            "Dashboard - View your portfolio summary and predictions",
            "Portfolio - Manage your holdings and transactions",
            "Stocks - Explore stock details and indicators",
            "Use the hamburger menu on mobile devices",
          ],
        },
      ],
    },
    {
      title: "Dashboard Features",
      icon: LayoutDashboard,
      color: "#60A5FA",
      items: [
        {
          title: "Portfolio Summary",
          description: "Get a quick overview of your investment performance.",
          features: [
            "Total Portfolio Value - Current worth of all holdings",
            "Total Gain/Loss - Overall profit or loss amount",
            "Return Percentage - Performance as a percentage",
          ],
        },
        {
          title: "Watchlist",
          description:
            "Monitor stocks you're interested in without buying them.",
          features: [
            "Add stocks to track their performance",
            "View current prices and changes",
            "Quick access to stock details",
            "Remove stocks when no longer needed",
          ],
        },
        {
          title: "Prediction Feed",
          description:
            "AI-powered stock predictions to guide your investments.",
          features: [
            "View predicted price movements",
            "See confidence levels for each prediction",
            "Check timeframes (24h, 7d, 30d)",
            "Make informed trading decisions",
          ],
        },
      ],
    },
    {
      title: "Portfolio Management",
      icon: PieChart,
      color: "#F59E0B",
      items: [
        {
          title: "Add Transactions",
          description: "Record your stock purchases and sales.",
          steps: [
            'Click "Add Transaction" button',
            "Enter stock ticker symbol (e.g., AAPL)",
            "Select transaction type (BUY or SELL)",
            "Enter quantity and price per share",
            "Add transaction date",
            'Click "Add Transaction" to save',
          ],
        },
        {
          title: "View Holdings",
          description: "Monitor your current stock positions.",
          features: [
            "See all stocks you currently own",
            "View quantity and average buy price",
            "Track current value and gains/losses",
            "Check percentage returns",
            "Sort and filter your holdings",
          ],
        },
        {
          title: "Performance Tracking",
          description: "Visualize your portfolio performance over time.",
          features: [
            "Interactive performance graph",
            "Track portfolio value changes",
            "Identify trends and patterns",
            "Make data-driven decisions",
          ],
        },
      ],
    },
    {
      title: "Stock Analysis",
      icon: TrendingUp,
      color: "#8B5CF6",
      items: [
        {
          title: "Stock Details",
          description: "Access comprehensive information about any stock.",
          features: [
            "Current price and market data",
            "Company overview and description",
            "Market capitalization",
            "Trading volume and statistics",
            "Historical performance",
          ],
        },
        {
          title: "Technical Indicators",
          description: "Analyze stocks using advanced technical indicators.",
          features: [
            "Moving Averages (SMA, EMA)",
            "Relative Strength Index (RSI)",
            "MACD (Moving Average Convergence Divergence)",
            "Bollinger Bands",
            "Support and Resistance Levels",
          ],
        },
        {
          title: "Price History",
          description: "View historical price data and charts.",
          features: [
            "Multiple timeframe views",
            "Interactive price charts",
            "Volume analysis",
            "Trend identification",
          ],
        },
        {
          title: "AI Predictions",
          description:
            "Get AI-powered price predictions for informed decisions.",
          features: [
            "Short-term predictions (24h)",
            "Medium-term forecasts (7d)",
            "Long-term projections (30d)",
            "Confidence scores for each prediction",
          ],
        },
      ],
    },
    {
      title: "Tips & Best Practices",
      icon: HelpCircle,
      color: "#EF4444",
      items: [
        {
          title: "Investment Strategy",
          tips: [
            "Diversify your portfolio across different sectors",
            "Don't invest more than you can afford to lose",
            "Use predictions as guidance, not guarantees",
            "Review your portfolio regularly",
            "Keep track of all transactions for tax purposes",
          ],
        },
        {
          title: "Using the Platform",
          tips: [
            "Add stocks to watchlist before buying",
            "Check technical indicators before trading",
            "Use the mobile menu for on-the-go access",
            "Monitor prediction confidence levels",
            "Keep your transaction records up to date",
            "Review performance graphs for insights",
          ],
        },
        {
          title: "Security",
          tips: [
            "Use a strong, unique password",
            "Never share your login credentials",
            "Log out when using shared devices",
            "Keep your email address up to date",
            "Review your account regularly",
          ],
        },
      ],
    },
  ];

  const quickActions = [
    { label: "Go to Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Manage Portfolio", href: "/portfolio", icon: PieChart },
    { label: "Explore Stocks", href: "/stock/AAPL", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[rgb(230,230,230)]">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-[rgb(40,40,40)]">
        <div className="absolute inset-0 bg-linear-to-br from-[#0AFA92]/5 via-transparent to-[#0AFA92]/5" />
        <div className="max-w-6xl mx-auto px-6 py-8 sm:py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-[#0AFA92]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <HelpCircle size={32} className="text-[#0AFA92]" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              How to Use{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-[#0AFA92] to-[#0AFA92]/70">
                StockAlphas
              </span>
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="p-5 bg-[rgb(25,25,25)] border border-[rgb(40,40,40)] rounded-xl hover:border-[#0AFA92]/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon
                        size={24}
                        className="text-[#0AFA92] group-hover:scale-110 transition-transform"
                      />
                      <p className="font-semibold text-sm text-[rgb(230,230,230)] group-hover:text-[#0AFA92] transition-colors">
                        {action.label}
                      </p>
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-[rgb(140,140,140)] group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Help Sections */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="space-y-6">
          {sections.map((section, sectionIndex) => {
            const SectionIcon = section.icon;
            const isEven = sectionIndex % 2 === 0;

            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.05 }}
                className="grid lg:grid-cols-12 gap-6"
              >
                {/* Main Content Card */}
                <motion.div
                  className={`lg:col-span-7 bg-[rgb(25,25,25)] border border-[rgb(40,40,40)] rounded-xl p-5 sm:p-6 ${
                    !isEven ? "lg:col-start-6" : ""
                  }`}
                  whileHover={{ borderColor: `${section.color}40` }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Section Header */}
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[rgb(40,40,40)]">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${section.color}20` }}
                    >
                      <SectionIcon size={20} style={{ color: section.color }} />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[rgb(230,230,230)]">
                      {section.title}
                    </h2>
                  </div>

                  {/* Section Items */}
                  <div className="space-y-5">
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="space-y-2.5">
                        <h3 className="text-base font-semibold text-[rgb(230,230,230)]">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-[rgb(140,140,140)]">
                            {item.description}
                          </p>
                        )}

                        {/* Steps */}
                        {item.steps && (
                          <div className="space-y-2 mt-3">
                            {item.steps.map((step, stepIndex) => (
                              <div
                                key={stepIndex}
                                className="flex items-start gap-2.5"
                              >
                                <div
                                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                                  style={{
                                    backgroundColor: `${section.color}20`,
                                  }}
                                >
                                  <span
                                    className="text-xs font-bold"
                                    style={{ color: section.color }}
                                  >
                                    {stepIndex + 1}
                                  </span>
                                </div>
                                <p className="text-sm text-[rgb(180,180,180)] leading-relaxed">
                                  {step}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Features */}
                        {item.features && (
                          <div className="space-y-1.5 mt-3">
                            {item.features.map((feature, featureIndex) => (
                              <div
                                key={featureIndex}
                                className="flex items-start gap-2.5"
                              >
                                <CheckCircle2
                                  size={16}
                                  className="shrink-0 mt-1"
                                  style={{ color: section.color }}
                                />
                                <p className="text-sm text-[rgb(180,180,180)] leading-relaxed">
                                  {feature}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Tips */}
                        {item.tips && (
                          <div className="space-y-1.5 mt-3">
                            {item.tips.map((tip, tipIndex) => (
                              <div
                                key={tipIndex}
                                className="flex items-start gap-2.5"
                              >
                                <CheckCircle2
                                  size={16}
                                  className="shrink-0 mt-1"
                                  style={{ color: section.color }}
                                />
                                <p className="text-sm text-[rgb(180,180,180)] leading-relaxed">
                                  {tip}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Annotation Panel */}
                <motion.div
                  className={`lg:col-span-5 space-y-4 ${
                    !isEven ? "lg:col-start-1 lg:row-start-1" : ""
                  }`}
                  initial={{ opacity: 0, x: isEven ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: sectionIndex * 0.05 + 0.1 }}
                >
                  {/* Key Highlight */}
                  <div className="bg-[rgb(25,25,25)]/50 border border-[rgb(40,40,40)] rounded-xl p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${section.color}20` }}
                      >
                        <Check size={16} style={{ color: section.color }} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[rgb(230,230,230)] mb-1">
                          Key Benefit
                        </h4>
                        <p className="text-xs text-[rgb(140,140,140)] leading-relaxed">
                          {sectionIndex === 0 &&
                            "Quick setup process gets you trading in minutes with an intuitive interface designed for all skill levels."}
                          {sectionIndex === 1 &&
                            "Real-time data and AI predictions help you make informed decisions with confidence and precision."}
                          {sectionIndex === 2 &&
                            "Complete transaction history and performance tracking ensures you stay organized and tax-ready."}
                          {sectionIndex === 3 &&
                            "Advanced analytics and multiple indicators provide institutional-grade analysis for retail investors."}
                          {sectionIndex === 4 &&
                            "Expert guidance and security best practices protect your investments and personal information."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[rgb(25,25,25)]/50 border border-[rgb(40,40,40)] rounded-lg p-4">
                      <div
                        className="text-2xl font-bold mb-1"
                        style={{ color: section.color }}
                      >
                        {sectionIndex === 0 && "2 min"}
                        {sectionIndex === 1 && "Real-time"}
                        {sectionIndex === 2 && "100%"}
                        {sectionIndex === 3 && "24/7"}
                        {sectionIndex === 4 && "Secure"}
                      </div>
                      <div className="text-xs text-[rgb(140,140,140)]">
                        {sectionIndex === 0 && "Setup Time"}
                        {sectionIndex === 1 && "Data Updates"}
                        {sectionIndex === 2 && "Tracking"}
                        {sectionIndex === 3 && "Access"}
                        {sectionIndex === 4 && "Platform"}
                      </div>
                    </div>
                    <div className="bg-[rgb(25,25,25)]/50 border border-[rgb(40,40,40)] rounded-lg p-4">
                      <div
                        className="text-2xl font-bold mb-1"
                        style={{ color: section.color }}
                      >
                        {sectionIndex === 0 && "Easy"}
                        {sectionIndex === 1 && "Smart"}
                        {sectionIndex === 2 && "Track"}
                        {sectionIndex === 3 && "Analyze"}
                        {sectionIndex === 4 && "Learn"}
                      </div>
                      <div className="text-xs text-[rgb(140,140,140)]">
                        {sectionIndex === 0 && "Navigation"}
                        {sectionIndex === 1 && "AI Insights"}
                        {sectionIndex === 2 && "Everything"}
                        {sectionIndex === 3 && "Deeply"}
                        {sectionIndex === 4 && "Grow"}
                      </div>
                    </div>
                  </div>

                  {/* Pro Tip */}
                  <div className="bg-linear-to-br from-[rgb(25,25,25)] to-[rgb(25,25,25)]/50 border border-[rgb(40,40,40)] rounded-xl p-5">
                    <div className="flex items-start gap-2 mb-2">
                      <div
                        className="px-2 py-1 rounded text-xs font-semibold"
                        style={{
                          backgroundColor: `${section.color}20`,
                          color: section.color,
                        }}
                      >
                        PRO TIP
                      </div>
                    </div>
                    <p className="text-xs text-[rgb(180,180,180)] leading-relaxed">
                      {sectionIndex === 0 &&
                        "Use the sidebar collapse feature to maximize screen space when analyzing detailed charts and data on smaller displays."}
                      {sectionIndex === 1 &&
                        "Add multiple stocks to your watchlist before buying to compare performance metrics and make better investment choices."}
                      {sectionIndex === 2 &&
                        "Record transactions immediately after execution to maintain accurate cost basis calculations for tax reporting."}
                      {sectionIndex === 3 &&
                        "Combine multiple technical indicators together for more reliable trading signals and reduced false positives."}
                      {sectionIndex === 4 &&
                        "Review your portfolio monthly and rebalance quarterly to maintain your desired risk level and investment strategy."}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-br from-[#0AFA92]/10 to-transparent border border-[#0AFA92]/20 rounded-xl p-6 sm:p-8 text-center"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-3 text-[rgb(230,230,230)]">
            Ready to Start Investing?
          </h2>
          <p className="text-sm text-[rgb(140,140,140)] mb-6 max-w-xl mx-auto">
            Head to your dashboard to begin tracking stocks, managing your
            portfolio, and making informed investment decisions.
          </p>
          <Link href="/dashboard">
            <motion.button
              className="px-6 py-3 bg-[#0AFA92] text-[#0A0A0A] text-sm font-semibold rounded-lg hover:bg-[#0AFA92]/90 transition-all inline-flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Go to Dashboard
              <ArrowRight size={18} />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
