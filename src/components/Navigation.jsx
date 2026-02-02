'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, PieChart, TrendingUp, LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/portfolio', label: 'Portfolio', icon: PieChart },
    { href: '/stock/AAPL', label: 'Stocks', icon: TrendingUp },
  ];

  const isActive = (href) => pathname.startsWith(href);

  if (!session) return null;

  return (
    <motion.nav 
      className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
        scrolled 
          ? 'bg-[rgb(25,25,25)]/95 backdrop-blur-lg shadow-lg shadow-[#0AFA92]/5' 
          : 'bg-[rgb(25,25,25)]'
      } border-b border-[rgb(40,40,40)]`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <motion.div
              className="flex items-center space-x-2 text-2xl font-bold text-[#0AFA92]"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <TrendingUp size={28} />
              StockAlphas
            </motion.div>
          </Link>

          {/* Nav Items */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    className={`
                      relative flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors
                      ${
                        active
                          ? 'text-[#0AFA92]'
                          : 'text-[rgb(140,140,140)] hover:text-[rgb(230,230,230)]'
                      }
                    `}
                    whileHover={{ y: -1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {active && (
                      <motion.div
                        className="absolute inset-0 bg-[#0AFA92]/10 rounded-lg"
                        layoutId="activeNav"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <div className="relative z-10 flex items-center space-x-2">
                      <Icon size={18} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </motion.div>
                </Link>
              );
            })}

            {/* Logout Button */}
            <motion.button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="flex items-center space-x-2 px-4 py-2 text-[rgb(140,140,140)] hover:text-[#FF453A] rounded-lg transition-colors ml-2"
              whileHover={{ y: -1 }}
              transition={{ duration: 0.2 }}
            >
              <LogOut size={18} />
              <span className="font-medium">Logout</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
