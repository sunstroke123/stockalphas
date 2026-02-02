"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  BarChart3,
  Brain,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import DynamicChart from "@/components/DynamicChart";

export default function Home() {
  const router = useRouter();
  const { status } = useSession();
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, router]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[rgb(230,230,230)] relative overflow-hidden">
      {/* Simplified cursor glow - subtle */}
      <motion.div
        className="pointer-events-none fixed w-64 h-64 rounded-full bg-[#0AFA92]/5 blur-3xl z-50"
        animate={{
          x: mousePosition.x - 128,
          y: mousePosition.y - 128,
        }}
        transition={{ type: "spring", damping: 50, stiffness: 100 }}
      />

      {/* Minimal floating orbs - reduced to 2 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 bg-[#0AFA92]/3 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ top: "20%", right: "10%" }}
        />
        <motion.div
          className="absolute w-80 h-80 bg-[#0AFA92]/2 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ bottom: "20%", left: "20%" }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-[#0AFA92]/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-[#0AFA92]/3 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16 sm:pb-24 lg:pb-32">
          {/* Navigation */}
          <motion.nav
            className="flex items-center justify-between mb-12 sm:mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="flex items-center space-x-2 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <TrendingUp size={28} className="text-[#0AFA92] sm:w-8 sm:h-8" />
              <span className="text-xl sm:text-2xl font-bold text-[#0AFA92]">
                StockAlphas
              </span>
            </motion.div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                onClick={() => router.push("/auth/signin")}
                variant="ghost"
                size="md"
                className="text-sm sm:text-base px-3 sm:px-4"
              >
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Sign In</span>
              </Button>
              <Button
                onClick={() => router.push("/auth/signin")}
                variant="primary"
                size="md"
                className="text-sm sm:text-base px-3 sm:px-4"
              >
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
              </Button>
            </div>
          </motion.nav>

          {/* Hero Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 pt-2 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-4 leading-tight">
                Invest Smarter
                <br />
                <span className="text-[#0AFA92]">With AI</span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-[rgb(140,140,140)] mb-6 sm:mb-10 leading-relaxed">
                Make data-driven investment decisions with real-time market
                analysis, AI predictions, and comprehensive portfolio management
                tools.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  onClick={() => router.push("/auth/signin")}
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
                >
                  Start Trading
                  <ArrowRight size={18} className="ml-2 sm:w-5 sm:h-5" />
                </Button>
                <Button
                  onClick={() =>
                    document
                      .getElementById("features")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
                >
                  Learn More
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-6 sm:gap-8 mt-8 sm:mt-12">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#0AFA92]">
                    10K+
                  </div>
                  <div className="text-xs sm:text-sm text-[rgb(140,140,140)]">
                    Active Users
                  </div>
                </div>
                <div className="h-12 w-px bg-[rgb(40,40,40)]" />
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#0AFA92]">
                    $2M+
                  </div>
                  <div className="text-xs sm:text-sm text-[rgb(140,140,140)]">
                    Trading Volume
                  </div>
                </div>
                <div className="h-12 w-px bg-[rgb(40,40,40)] hidden sm:block" />
                <div className="w-full sm:w-auto">
                  <div className="text-2xl sm:text-3xl font-bold text-[#0AFA92]">
                    99.9%
                  </div>
                  <div className="text-xs sm:text-sm text-[rgb(140,140,140)]">
                    Uptime
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Hero Visual - Dynamic Chart */}
            <motion.div
              className="relative hidden lg:block"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <DynamicChart variant="landing" className="bg-gradient-to-br from-[rgb(25,25,25)] to-[rgb(15,15,15)]" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-16 sm:py-24 bg-linear-to-b from-transparent to-[rgb(15,15,15)] relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              Everything You Need to{" "}
              <span className="text-[#0AFA92]">Succeed</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-[rgb(140,140,140)] max-w-2xl mx-auto">
              Powerful features designed to help you make better investment
              decisions
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Brain,
                title: "AI Predictions",
                description:
                  "Machine learning algorithms analyze market data to provide buy/sell signals with confidence scores.",
              },
              {
                icon: BarChart3,
                title: "Portfolio Tracking",
                description:
                  "Monitor your investments in real-time with detailed performance analytics and insights.",
              },
              {
                icon: Zap,
                title: "Real-Time Data",
                description:
                  "Access live market data, historical charts, and technical indicators instantly.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="group bg-[rgb(25,25,25)] border border-[rgb(40,40,40)] rounded-xl p-6 hover:border-[#0AFA92]/20 transition-all cursor-pointer relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                {/* Subtle hover glow */}
                <div className="absolute inset-0 bg-[#0AFA92]/0 group-hover:bg-[#0AFA92]/5 transition-all duration-300" />

                <div className="relative z-10">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#0AFA92]/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-[#0AFA92]/15 transition-colors">
                    <feature.icon className="text-[#0AFA92]" size={20} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-[rgb(230,230,230)]">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[rgb(140,140,140)]">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="relative bg-linear-to-br from-[#0AFA92]/10 to-transparent border border-[#0AFA92]/20 rounded-2xl p-8 sm:p-12 lg:p-16 text-center overflow-hidden"
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="absolute inset-0 bg-[#0AFA92]/5 blur-3xl" />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                Ready to Start Trading?
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-[rgb(140,140,140)] mb-6 sm:mb-8 max-w-2xl mx-auto">
                Join the race of investors
              </p>
              <Button
                onClick={() => router.push("/auth/signin")}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto text-base sm:text-lg px-8 mx-auto sm:px-10 py-4 sm:py-5"
              >
                Create Free Account
                <ArrowRight size={18} className="ml-2 sm:w-5 sm:h-5" />
              </Button>
              <p className="text-xs sm:text-sm text-[rgb(140,140,140)] mt-4">
                No credit card required • Free forever
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgb(40,40,40)] py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <TrendingUp size={20} className="text-[#0AFA92] sm:w-6 sm:h-6" />
              <span className="text-lg sm:text-xl font-bold text-[#0AFA92]">
                StockAlphas
              </span>
            </div>
            <div className="text-xs sm:text-sm text-[rgb(140,140,140)]">
              © 2025 StockAlphas. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
