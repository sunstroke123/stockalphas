'use client';

import { motion } from 'framer-motion';

export default function CircularLoader({ size = 'md', color = '#0AFA92', className = '' }) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const strokeWidths = {
    sm: 3,
    md: 3,
    lg: 4,
    xl: 4,
  };

  return (
    <div className={`inline-block ${className}`}>
      <motion.svg
        className={sizeClasses[size]}
        viewBox="0 0 50 50"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <motion.circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidths[size]}
          strokeLinecap="round"
          strokeDasharray="31.4 31.4"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: 62.8 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.svg>
    </div>
  );
}

// Full screen loader overlay
export function FullScreenLoader({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 bg-[#0A0A0A]/80 backdrop-blur-sm z-100 flex flex-col items-center justify-center">
      <CircularLoader size="xl" />
      {message && (
        <motion.p
          className="mt-4 text-[rgb(140,140,140)] text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}
