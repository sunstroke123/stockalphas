'use client';

import CircularLoader from './CircularLoader';

export default function LoadingSpinner({ size = 'md' }) {
  return (
    <div className="flex items-center justify-center">
      <CircularLoader size={size} />
    </div>
  );
}

export function SkeletonLoader({ className = '' }) {
  return (
    <div className={`skeleton rounded-lg ${className}`} />
  );
}
