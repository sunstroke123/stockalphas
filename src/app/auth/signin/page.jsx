"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  TrendingUp,
  AlertCircle,
  Mail,
  Lock,
  User,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import Button from "@/components/ui/Button";
import CircularLoader from "@/components/ui/CircularLoader";
import DynamicChart from "@/components/DynamicChart";
import apiClient from "@/lib/apiClient";

export default function SignInPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          setError(result.error);
        } else {
          router.push("/dashboard");
        }
      } else {
        // Register
        const response = await apiClient.post("/api/auth/register", formData);

        if (response.data) {
          // Auto-login after registration
          const result = await signIn("credentials", {
            email: formData.email,
            password: formData.password,
            redirect: false,
          });

          if (result?.error) {
            setError(result.error);
          } else {
            router.push("/dashboard");
          }
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(20,20,20)] flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 bg-[#0AFA92]/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ top: "10%", left: "10%" }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-[#0AFA92]/5 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ bottom: "10%", right: "10%" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Dynamic Graphs */}
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-6">
              {/* Logo and Title */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <TrendingUp size={40} className="text-[#0AFA92]" />
                  <h1 className="text-4xl font-bold text-[#0AFA92]">
                    StockAlphas
                  </h1>
                </div>
              </div>

              {/* Dynamic Chart Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <DynamicChart variant="auth" />
              </motion.div>

              {/* Features List */}
              <div className="space-y-3">
                {[
                  "Real-time market data & analytics",
                  "AI-powered stock predictions",
                  "Portfolio tracking & management",
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center pl-6 gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <Check className="text-[#0AFA92]" size={16} />
                    <p className="text-[rgb(140,140,140)]">{feature}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Side - Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <TrendingUp size={32} className="text-[#0AFA92]" />
                <h1 className="text-3xl font-bold text-[#0AFA92]">
                  StockAlphas
                </h1>
              </div>
              <p className="text-[rgb(140,140,140)]">
                AI-powered stock analysis platform
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-gradient-to-br from-[rgb(25,25,25)] via-[rgb(30,30,30)] to-[rgb(20,20,20)] border border-[rgb(45,45,45)] rounded-xl p-6 sm:p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-[rgb(230,230,230)] mb-2">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-[rgb(140,140,140)] mb-6">
                {isLogin
                  ? "Sign in to continue to your dashboard"
                  : "Join thousands of smart investors"}
              </p>

              {/* Tab Switcher */}
              <div className="flex gap-2 mb-6 p-1 bg-[rgb(45,45,45)]/50 rounded-lg">
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setError("");
                  }}
                  className={`flex-1 py-2.5 rounded-md font-medium transition-all ${
                    isLogin
                      ? "bg-[#0AFA92] text-black shadow-lg shadow-[#0AFA92]/20"
                      : "text-[rgb(140,140,140)] hover:text-[rgb(230,230,230)]"
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setIsLogin(false);
                    setError("");
                  }}
                  className={`flex-1 py-2.5 rounded-md font-medium transition-all ${
                    !isLogin
                      ? "bg-[#0AFA92] text-black shadow-lg shadow-[#0AFA92]/20"
                      : "text-[rgb(140,140,140)] hover:text-[rgb(230,230,230)]"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {error && (
                <motion.div
                  className="flex items-center gap-2 p-3 mb-4 bg-[#FF453A]/10 border border-[#FF453A]/20 rounded-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle size={18} className="text-[#FF453A] shrink-0" />
                  <p className="text-sm text-[#FF453A]">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-[rgb(230,230,230)] mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(140,140,140)]"
                      />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 bg-[rgb(35,35,35)] border border-[rgb(55,55,55)] rounded-lg text-[rgb(230,230,230)] placeholder-[rgb(120,120,120)] focus:outline-none focus:border-[#0AFA92] focus:ring-2 focus:ring-[#0AFA92]/20 transition-all"
                        placeholder="John Doe"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[rgb(230,230,230)] mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(140,140,140)]"
                    />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 bg-[rgb(35,35,35)] border border-[rgb(55,55,55)] rounded-lg text-[rgb(230,230,230)] placeholder-[rgb(120,120,120)] focus:outline-none focus:border-[#0AFA92] focus:ring-2 focus:ring-[#0AFA92]/20 transition-all"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(230,230,230)] mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(140,140,140)]"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full pl-10 pr-12 py-3 bg-[rgb(35,35,35)] border border-[rgb(55,55,55)] rounded-lg text-[rgb(230,230,230)] placeholder-[rgb(120,120,120)] focus:outline-none focus:border-[#0AFA92] focus:ring-2 focus:ring-[#0AFA92]/20 transition-all"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(140,140,140)] hover:text-[rgb(230,230,230)] transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {!isLogin && (
                    <p className="mt-1.5 text-xs text-[rgb(120,120,120)]">
                      Must be at least 6 characters
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full flex items-center justify-center gap-2 mt-6"
                  loading={loading}
                >
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                  {!loading && <ArrowRight size={20} />}
                </Button>
              </form>

              {isLogin && (
                <div className="mt-4 text-center">
                  <button className="text-sm text-[rgb(140,140,140)] hover:text-[#0AFA92] transition-colors">
                    Forgot password?
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
