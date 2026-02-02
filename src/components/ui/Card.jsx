'use client';

import { motion } from 'framer-motion';

export default function Card({ children, className = '', hover = true }) {
  return (
    <motion.div
      className={`relative bg-[var(--card-background)] border border-[var(--border-color)] rounded-lg p-6 overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { 
        y: -2, 
        borderColor: 'rgba(10, 250, 146, 0.2)',
        transition: { duration: 0.2 } 
      } : {}}
    >
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
