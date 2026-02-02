'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import HoldingsTable from '@/components/portfolio/HoldingsTable';
import PerformanceGraph from '@/components/portfolio/PerformanceGraph';
import AddTransactionModal from '@/components/portfolio/AddTransactionModal';
import apiClient from '@/lib/apiClient';

export default function PortfolioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchPortfolio();
    }
  }, [status, router]);

  const fetchPortfolio = async () => {
    try {
      const response = await apiClient.get('/api/portfolio');
      setPortfolio(response.data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionAdded = () => {
    setIsModalOpen(false);
    fetchPortfolio();
  };

  if (loading || status === 'loading') {
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
            x: [0, -60, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ top: '15%', right: '10%' }}
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="max-w-7xl mx-auto">
            {/* Header - Responsive */}
            <motion.div
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[rgb(230,230,230)] mb-2">
                  Portfolio
                </h1>
                <p className="text-sm sm:text-base text-[rgb(140,140,140)]">
                  Manage your investments and track performance
                </p>
              </div>
              <Button
                onClick={() => setIsModalOpen(true)}
                variant="primary"
                className="flex items-center gap-2 w-full sm:w-auto justify-center"
                size="md"
              >
                <Plus size={20} />
                <span className="sm:inline">Add Transaction</span>
              </Button>
            </motion.div>

            {/* Performance Graph */}
            <div className="mb-6 sm:mb-8">
              <PerformanceGraph data={portfolio?.performance || []} />
            </div>

            {/* Holdings Table */}
            <HoldingsTable holdings={portfolio?.holdings || []} />
          </div>
        </div>
      </main>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleTransactionAdded}
      />
    </div>
  );
}
