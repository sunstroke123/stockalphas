'use client';

import { motion } from 'framer-motion';
import CircularLoader from './CircularLoader';

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
}) {
  const variants = {
    primary: 'bg-[#0AFA92] hover:bg-[#0AFA92]/90 text-black shadow-sm shadow-[#0AFA92]/20',
    secondary: 'bg-[rgb(40,40,40)] hover:bg-[rgb(50,50,50)] text-[rgb(230,230,230)]',
    danger: 'bg-[#FF453A] hover:bg-[#FF453A]/90 text-white shadow-sm shadow-[#FF453A]/20',
    ghost: 'bg-transparent hover:bg-[rgb(40,40,40)] text-[rgb(230,230,230)]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const loaderSizes = {
    sm: 'sm',
    md: 'sm',
    lg: 'md',
  };

  // Define loader colors based on variant
  const loaderColors = {
    primary: '#0A0A0A', // Black for green button
    secondary: '#0AFA92', // Green for dark button
    danger: '#FFFFFF', // White for red button
    ghost: '#0AFA92', // Green for ghost button
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        relative overflow-hidden
        ${variants[variant]}
        ${sizes[size]}
        ${className}
        font-medium rounded-lg transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
      `}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
    >
      {loading ? (
        <>
          <CircularLoader size={loaderSizes[size]} color={loaderColors[variant]} />
          <span className="opacity-70">{children}</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
