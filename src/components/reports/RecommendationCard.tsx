// src/components/reports/RecommendationCard.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Recommendation } from '../../types/report.types';

interface RecommendationCardProps {
  recommendation: Recommendation;
  index: number;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, index }) => {
  return (
    <motion.div
      className="p-4 bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500 transition-all"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
          {index + 1}
        </div>
        <div>
          <h4 className="font-semibold text-gray-200 mb-1">{recommendation.action}</h4>
          <p className="text-sm text-gray-400 mb-2">{recommendation.why}</p>
          <div className="flex items-center gap-1 text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded-full inline-block">
            {recommendation.impact}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RecommendationCard;