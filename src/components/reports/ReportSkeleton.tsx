// src/components/reports/ReportSkeleton.tsx

import React from 'react';

const ReportSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex gap-2 mb-2">
            <div className="w-24 h-6 bg-gray-700 rounded-full"></div>
            <div className="w-20 h-6 bg-gray-700 rounded-full"></div>
          </div>
          <div className="w-96 h-10 bg-gray-700 rounded"></div>
          <div className="w-48 h-4 bg-gray-700 rounded mt-2"></div>
        </div>
        <div className="flex gap-2">
          <div className="w-24 h-10 bg-gray-700 rounded"></div>
          <div className="w-24 h-10 bg-gray-700 rounded"></div>
        </div>
      </div>

      {/* Summary Skeleton */}
      <div className="mb-8 p-6 bg-gray-800 rounded-xl">
        <div className="w-32 h-6 bg-gray-700 rounded mb-3"></div>
        <div className="space-y-2">
          <div className="w-full h-4 bg-gray-700 rounded"></div>
          <div className="w-3/4 h-4 bg-gray-700 rounded"></div>
        </div>
      </div>

      {/* Sections Skeleton */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="mb-4 p-6 bg-gray-800 rounded-xl border border-gray-700">
          <div className="w-48 h-6 bg-gray-700 rounded mb-3"></div>
          <div className="space-y-2">
            <div className="w-full h-4 bg-gray-700 rounded"></div>
            <div className="w-5/6 h-4 bg-gray-700 rounded"></div>
          </div>
        </div>
      ))}

      {/* Takeaways Skeleton */}
      <div className="mt-8 p-6 bg-gray-800 rounded-xl">
        <div className="w-32 h-6 bg-gray-700 rounded mb-3"></div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-3/4 h-4 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>

      {/* Recommendations Skeleton */}
      <div className="mt-8">
        <div className="w-48 h-6 bg-gray-700 rounded mb-4"></div>
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-gray-800 rounded-xl border border-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                <div>
                  <div className="w-32 h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="w-48 h-3 bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportSkeleton;