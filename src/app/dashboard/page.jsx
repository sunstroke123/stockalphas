"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import UnifiedPortfolioCard from "@/components/dashboard/UnifiedPortfolioCard";
import Watchlist from "@/components/dashboard/Watchlist";
import PredictionFeed from "@/components/dashboard/PredictionFeed";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      setLoading(false);
    }
  }, [status, router]);

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Minimal animated background */}
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
      </div>

      {/* Main Content */}
      <main className="relative z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              className="mb-6 sm:mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-[rgb(230,230,230)]">
                Welcome back,{" "}
                <span className="text-green-200">
                  {session?.user?.name?.split(" ")[0]}
                </span>
              </h1>
            </motion.div>

            {/* Portfolio Overview */}
            <div className="mb-6 sm:mb-8">
              <UnifiedPortfolioCard />
            </div>

            {/* Two Column Layout - Responsive */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              <Watchlist />
              <PredictionFeed />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
