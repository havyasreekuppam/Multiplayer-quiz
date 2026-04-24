import React from 'react';

/**
 * Skeleton Loading Component
 * Shows animated placeholder while content loads
 */

export const SkeletonLoader = ({ width = 'w-full', height = 'h-12', className = '' }) => (
  <div
    className={`
      ${width} ${height} ${className}
      bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300
      rounded animate-pulse
    `}
  />
);

export const SkeletonCard = () => (
  <div className="bg-white rounded-lg shadow p-6 space-y-4">
    <SkeletonLoader height="h-6" width="w-2/3" />
    <SkeletonLoader height="h-4" width="w-full" />
    <SkeletonLoader height="h-4" width="w-5/6" />
    <div className="flex gap-2">
      <SkeletonLoader height="h-10" width="w-20" className="rounded" />
      <SkeletonLoader height="h-10" width="w-20" className="rounded" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="space-y-3 w-full">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        <SkeletonLoader height="h-12" width="w-full" className="rounded" />
      </div>
    ))}
  </div>
);

export const SkeletonInput = () => (
  <SkeletonLoader height="h-12" width="w-full" className="rounded" />
);

export const SkeletonButton = () => (
  <SkeletonLoader height="h-10" width="w-32" className="rounded" />
);

// Multi-line skeleton for paragraphs
export const SkeletonText = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonLoader
        key={i}
        height="h-4"
        width={i === lines - 1 ? 'w-2/3' : 'w-full'}
      />
    ))}
  </div>
);
