"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  PieChart,
  TrendingUp,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  HelpCircle,
  BarChart3,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useSidebar } from "@/contexts/SidebarContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isCollapsed, setIsCollapsed, isMobileMenuOpen, setIsMobileMenuOpen } =
    useSidebar();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, setIsMobileMenuOpen]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/portfolio", label: "Portfolio", icon: PieChart },
    { href: "/stock/", label: "Stocks", icon: TrendingUp },
    { href: "/charts", label: "Charts", icon: BarChart3 },
    { href: "/help", label: "Help", icon: HelpCircle },
  ];

  const isActive = (href) => pathname.startsWith(href);

  if (!session) return null;

  return (
    <>
      {/* Mobile Header */}
      <motion.div
        className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[rgb(25,25,25)]/95 backdrop-blur-xl border-b border-[rgb(40,40,40)] px-4 sm:px-6 h-16 flex items-center justify-between shadow-lg"
        initial={{ y: -64 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="flex items-center space-x-2"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-8 h-8 bg-[#0AFA92]/10 rounded-lg flex items-center justify-center">
            <TrendingUp size={20} className="text-[#0AFA92]" />
          </div>
          <span className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-[#0AFA92] to-[#0AFA92]/70">
            StockAlphas
          </span>
        </motion.div>
        <motion.button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-[rgb(40,40,40)]/80 rounded-lg transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {isMobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={24} className="text-[rgb(230,230,230)]" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu size={24} className="text-[rgb(230,230,230)]" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              className="fixed top-16 left-0 bottom-0 w-72 sm:w-80 bg-[rgb(25,25,25)]/98 backdrop-blur-xl border-r border-[rgb(40,40,40)] z-40 lg:hidden shadow-2xl flex flex-col"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
            >
              <div className="p-6 flex-1 flex flex-col overflow-hidden">
                <MobileMenuContent
                  navItems={navItems}
                  isActive={isActive}
                  onClose={() => setIsMobileMenuOpen(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        className={`hidden lg:flex fixed left-0 top-0 bottom-0 bg-[rgb(25,25,25)]/98 backdrop-blur-xl border-r border-[rgb(40,40,40)] z-30 flex-col transition-all duration-300 shadow-2xl ${
          isCollapsed ? "w-20" : "w-64"
        }`}
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo */}
        <div className="h-16 shrink-0 flex items-center px-4 border-b border-[rgb(40,40,40)] relative overflow-hidden">
          {/* Gradient accent */}
          <div className="absolute inset-0 bg-linear-to-r from-[#0AFA92]/5 to-transparent opacity-50" />

          {!isCollapsed ? (
            <div className="flex items-center justify-between w-full relative z-10">
              <motion.div
                className="flex items-center space-x-2.5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="w-9 h-9 shrink-0 bg-[#0AFA92]/10 rounded-lg flex items-center justify-center">
                  <TrendingUp size={20} className="text-[#0AFA92]" />
                </div>
                <span className="text-lg font-bold bg-clip-text text-transparent bg-linear-to-r from-[#0AFA92] to-[#0AFA92]/70">
                  StockAlphas
                </span>
              </motion.div>
              <motion.button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1.5 shrink-0 hover:bg-[rgb(40,40,40)]/80 rounded-lg transition-all group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ rotate: isCollapsed ? 180 : 0 }}
                  transition={{ duration: 0.3, type: "spring" }}
                >
                  <ChevronLeft
                    size={18}
                    className="text-[rgb(140,140,140)] group-hover:text-[#0AFA92] transition-colors"
                  />
                </motion.div>
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full relative z-10">
              <motion.button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-9 h-9 shrink-0 bg-[#0AFA92]/10 rounded-lg flex items-center justify-center hover:bg-[#0AFA92]/20 transition-all group"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ rotate: isCollapsed ? 360 : 0 }}
                  transition={{ duration: 1, type: "spring" }}
                >
                  <TrendingUp size={20} className="text-[#0AFA92]" />
                </motion.div>
              </motion.button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={`
                    relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer group
                    ${
                      active
                        ? "text-[#0AFA92] bg-[#0AFA92]/10 shadow-lg shadow-[#0AFA92]/10"
                        : "text-[rgb(140,140,140)] hover:text-[rgb(230,230,230)] hover:bg-[rgb(40,40,40)]/80"
                    }
                  `}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: isCollapsed ? 0 : 4, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {active && (
                    <>
                      <motion.div
                        className="absolute inset-0 bg-linear-to-r from-[#0AFA92]/20 to-transparent rounded-xl"
                        layoutId="activeNavDesktop"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                      <motion.div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#0AFA92] rounded-r-full"
                        layoutId="activeIndicator"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    </>
                  )}
                  <div
                    className={`relative z-10 p-1.5 shrink-0 rounded-lg transition-all ${
                      active
                        ? "bg-[#0AFA92]/20"
                        : "group-hover:bg-[rgb(40,40,40)]"
                    }`}
                  >
                    <Icon size={18} className="shrink-0" />
                  </div>
                  {!isCollapsed && (
                    <motion.span
                      className="font-medium relative z-10 text-sm truncate"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                  {isCollapsed && (
                    <motion.div
                      className="fixed left-20 px-3 py-1.5 bg-[rgb(25,25,25)] border border-[rgb(40,40,40)] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity duration-200"
                      style={{ top: `${64 + index * 56}px` }}
                    >
                      <span className="text-sm text-[rgb(230,230,230)]">
                        {item.label}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="shrink-0 p-4 border-t border-[rgb(40,40,40)] space-y-3">
          {!isCollapsed ? (
            <motion.div
              className="px-3 py-3 bg-[rgb(40,40,40)]/30 rounded-xl border border-[rgb(40,40,40)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ borderColor: "rgba(10, 250, 146, 0.2)" }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 shrink-0 bg-[#0AFA92]/20 rounded-lg flex items-center justify-center">
                  <span className="text-[#0AFA92] font-bold text-sm">
                    {session?.user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[rgb(230,230,230)] truncate">
                    {session?.user?.name}
                  </p>
                </div>
              </div>
              <p className="text-xs text-[rgb(140,140,140)] truncate pl-11">
                {session?.user?.email}
              </p>
            </motion.div>
          ) : (
            <motion.div
              className="w-10 h-10 bg-[#0AFA92]/20 rounded-xl flex items-center justify-center mx-auto group relative"
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(10, 250, 146, 0.3)",
              }}
            >
              <span className="text-[#0AFA92] font-bold">
                {session?.user?.name?.charAt(0)?.toUpperCase()}
              </span>
              <motion.div
                className="fixed left-20 px-3 py-2 bg-[rgb(25,25,25)] border border-[rgb(40,40,40)] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity duration-200"
                style={{ bottom: "80px" }}
              >
                <p className="text-sm font-semibold text-[rgb(230,230,230)]">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-[rgb(140,140,140)] mt-0.5">
                  {session?.user?.email}
                </p>
              </motion.div>
            </motion.div>
          )}
          <motion.button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className={`w-full flex items-center gap-3 px-3 py-3 text-[rgb(140,140,140)] hover:text-[#FF453A] hover:bg-[#FF453A]/10 rounded-xl transition-all group ${
              isCollapsed ? "justify-center" : ""
            }`}
            whileHover={{ x: isCollapsed ? 0 : 4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="p-1.5 shrink-0 rounded-lg group-hover:bg-[#FF453A]/20 transition-all">
              <LogOut size={18} className="shrink-0" />
            </div>
            {!isCollapsed && (
              <span className="font-medium text-sm">Logout</span>
            )}
            {isCollapsed && (
              <motion.div
                className="fixed left-20 px-3 py-1.5 bg-[rgb(25,25,25)] border border-[rgb(40,40,40)] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity duration-200"
                style={{ bottom: "32px" }}
              >
                <span className="text-sm text-[rgb(230,230,230)]">Logout</span>
              </motion.div>
            )}
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
}

// Mobile Menu Content Component
function MobileMenuContent({ navItems, isActive, onClose }) {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* User Info */}
      <motion.div
        className="pb-4 border-b border-[rgb(40,40,40)] shrink-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 shrink-0 bg-[#0AFA92]/20 rounded-xl flex items-center justify-center">
            <span className="text-[#0AFA92] font-bold text-lg">
              {session?.user?.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-[rgb(230,230,230)] truncate">
              {session?.user?.name}
            </p>
            <p className="text-xs text-[rgb(140,140,140)] truncate mt-0.5">
              {session?.user?.email}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 py-4 overflow-y-auto overflow-x-hidden">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={`
                  relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all
                  ${
                    active
                      ? "bg-[#0AFA92]/10 text-[#0AFA92] shadow-lg shadow-[#0AFA92]/10"
                      : "text-[rgb(140,140,140)] hover:text-[rgb(230,230,230)] hover:bg-[rgb(40,40,40)]/80"
                  }
                `}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {active && (
                  <>
                    <motion.div
                      className="absolute inset-0 bg-linear-to-r from-[#0AFA92]/20 to-transparent rounded-xl"
                      layoutId="activeNavMobile"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                    <motion.div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-[#0AFA92] rounded-r-full"
                      layoutId="activeIndicatorMobile"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  </>
                )}
                <div
                  className={`relative z-10 p-1.5 shrink-0 rounded-lg transition-all ${
                    active ? "bg-[#0AFA92]/20" : ""
                  }`}
                >
                  <Icon size={20} />
                </div>
                <span className="font-medium relative z-10 truncate">
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="pt-4 border-t border-[rgb(40,40,40)] shrink-0">
        <motion.button
          onClick={() => {
            signOut({ callbackUrl: "/auth/signin" });
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-[rgb(140,140,140)] hover:text-[#FF453A] hover:bg-[#FF453A]/10 rounded-xl transition-all group"
          whileTap={{ scale: 0.98 }}
          whileHover={{ x: 4 }}
        >
          <div className="p-1.5 shrink-0 rounded-lg group-hover:bg-[#FF453A]/20 transition-all">
            <LogOut size={20} />
          </div>
          <span className="font-medium">Logout</span>
        </motion.button>
      </div>
    </div>
  );
}
