import React from 'react';

export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white rounded-2xl p-6 animate-pulse ${className}`}>
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white rounded-2xl overflow-hidden animate-pulse">
    <div className="p-4 border-b border-gray-100">
      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
    </div>
    <div className="p-4">
      <div className="flex gap-4 mb-4">
        {Array(columns).fill(0).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded flex-1"></div>
        ))}
      </div>
      {Array(rows).fill(0).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-gray-50">
          {Array(columns).fill(0).map((_, j) => (
            <div key={j} className="h-4 bg-gray-100 rounded flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 animate-pulse ${className}`}>
    {Array(lines).fill(0).map((_, i) => (
      <div
        key={i}
        className={`h-4 bg-gray-200 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
      ></div>
    ))}
  </div>
);

export const SkeletonAvatar = ({ size = 'md' }) => {
  const sizes = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16' };
  return (
    <div className={`${sizes[size]} bg-gray-200 rounded-full animate-pulse`}></div>
  );
};

const Skeleton = {
  Card: SkeletonCard,
  Table: SkeletonTable,
  Text: SkeletonText,
  Avatar: SkeletonAvatar,
};

export default Skeleton;
