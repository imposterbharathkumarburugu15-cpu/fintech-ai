// src/components/reports/ReportViewer.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, LineChart, Line
} from 'recharts';
import { ReportData, GeneratedReport, Recommendation } from '../../types/report.types';
import { fetchReportData } from '../../services/reportDataService';
import { generateStructuredReport, calculateSavingsRate, calculateDiversification } from '../../utils/reportCalculations';
import RecommendationCard from './RecommendationCard';
import ReportSkeleton from './ReportSkeleton';
import { exportReportToPDF } from '../../services/pdfExportService';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1'];

interface ReportViewerProps {
  userId?: string;
  reportType?: string;
  onExport?: (format: 'pdf' | 'excel') => void;
}

// ===== PREMIUM COMPONENTS =====

// 1. Daily Spending Chart with Weekend Analysis
const DailySpendingChart: React.FC<{ data: any[] }> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const isWeekend = payload[0].payload.isWeekend;
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-2xl">
          <p className="text-white font-semibold">{label}</p>
          <p className="text-blue-400 font-bold text-xl">₹{payload[0].value.toLocaleString()}</p>
          {isWeekend && (
            <p className="text-yellow-400 text-xs mt-1">Weekend spending tends to be higher</p>
          )}
        </div>
      );
    }
    return null;
  };

  const weekendTotal = data.filter(d => d.isWeekend).reduce((s, i) => s + i.amount, 0);
  const weekdayTotal = data.filter(d => !d.isWeekend).reduce((s, i) => s + i.amount, 0);
  const weekendAvg = weekendTotal / 2;
  const weekdayAvg = weekdayTotal / 5;
  const weekendSpike = ((weekendAvg - weekdayAvg) / weekdayAvg * 100);

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" tickFormatter={(value) => `₹${value.toLocaleString()}`} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.isWeekend ? '#F59E0B' : '#3B82F6'} 
                fillOpacity={entry.isWeekend ? 1 : 0.7}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
          <p className="text-gray-400 text-xs">Weekday Average</p>
          <p className="text-white font-bold">₹{weekdayAvg.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
          <p className="text-gray-400 text-xs">Weekend Average</p>
          <p className="text-white font-bold">₹{weekendAvg.toLocaleString()}</p>
        </div>
        <div className={`rounded-lg p-3 ${weekendSpike > 20 ? 'bg-yellow-900/20 border border-yellow-800/30' : 'bg-green-900/20 border border-green-800/30'}`}>
          <p className="text-gray-400 text-xs">Weekend Spending Increase</p>
          <p className={`font-bold ${weekendSpike > 20 ? 'text-yellow-400' : 'text-green-400'}`}>
            {weekendSpike > 0 ? '+' : ''}{weekendSpike.toFixed(0)}%
          </p>
          <p className="text-xs text-gray-400">
            {weekendSpike > 30 ? 'Significant weekend spending' : 'Balanced weekend spending'}
          </p>
        </div>
      </div>
    </div>
  );
};

// 2. Health Score Card
const HealthScoreCard: React.FC<{ score: number }> = ({ score }) => {
  let status = 'Good';
  let color = 'text-green-400';
  let bgColor = 'bg-green-900/20 border-green-800/30';
  let description = 'You have a strong financial foundation.';
  
  if (score >= 80) {
    status = 'Excellent';
    color = 'text-green-400';
    bgColor = 'bg-green-900/20 border-green-800/30';
    description = 'Excellent financial health. Continue your current strategies.';
  } else if (score >= 60) {
    status = 'Good';
    color = 'text-blue-400';
    bgColor = 'bg-blue-900/20 border-blue-800/30';
    description = 'Good financial health with room for improvement.';
  } else if (score >= 40) {
    status = 'Fair';
    color = 'text-yellow-400';
    bgColor = 'bg-yellow-900/20 border-yellow-800/30';
    description = 'Fair financial health. Focus on improving key areas.';
  } else {
    status = 'Needs Attention';
    color = 'text-red-400';
    bgColor = 'bg-red-900/20 border-red-800/30';
    description = 'Financial health needs immediate attention.';
  }

  return (
    <div className={`p-5 rounded-xl border ${bgColor}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">Financial Health Score</p>
          <p className={`text-4xl font-bold ${color}`}>{score}/100</p>
          <p className={`text-sm font-medium ${color} mt-1`}>{status}</p>
        </div>
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="#374151"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke={score >= 70 ? '#10B981' : score >= 50 ? '#3B82F6' : '#F59E0B'}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${(score / 100) * 251.2} 251.2`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-bold ${color}`}>{score}%</span>
          </div>
        </div>
      </div>
      <p className="text-gray-300 text-sm mt-3">{description}</p>
    </div>
  );
};

// 3. Month Comparison Card
const MonthComparisonCard: React.FC<{ current: number; previous: number }> = ({ current, previous }) => {
  const difference = current - previous;
  const percentChange = previous > 0 ? ((difference / previous) * 100) : 0;
  const isMore = difference > 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
        <p className="text-gray-400 text-sm">Current Month</p>
        <p className="text-white text-2xl font-bold mt-1">₹{current.toLocaleString()}</p>
      </div>
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
        <p className="text-gray-400 text-sm">Previous Month</p>
        <p className="text-white text-2xl font-bold mt-1">₹{previous.toLocaleString()}</p>
      </div>
      <div className={`rounded-xl p-5 ${isMore ? 'bg-red-900/20 border border-red-800/30' : 'bg-green-900/20 border border-green-800/30'}`}>
        <p className="text-gray-400 text-sm">Change</p>
        <p className={`text-2xl font-bold mt-1 ${isMore ? 'text-red-400' : 'text-green-400'}`}>
          {isMore ? '+' : ''}{percentChange.toFixed(1)}%
        </p>
        <p className={`text-sm ${isMore ? 'text-red-400' : 'text-green-400'}`}>
          {isMore ? `₹${difference.toLocaleString()} more` : `₹${Math.abs(difference).toLocaleString()} less`}
        </p>
      </div>
    </div>
  );
};

// 4. Investment Performance Card
const InvestmentCard: React.FC<{ holding: any }> = ({ holding }) => {
  const isPositive = holding.change >= 0;
  
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-blue-500 transition-all">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-white font-semibold text-lg">{holding.symbol}</p>
          <p className="text-gray-400 text-sm">{holding.shares} shares</p>
        </div>
        <div className="text-right">
          <p className="text-white font-medium">₹{holding.value.toLocaleString()}</p>
          <p className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{holding.change}%
          </p>
        </div>
      </div>
      <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${isPositive ? 'bg-green-400' : 'bg-red-400'}`}
          style={{ width: `${Math.min(Math.abs(holding.change) * 5, 100)}%` }}
        />
      </div>
      <p className={`text-xs mt-2 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? 'Outperforming expectations' : 'Underperforming - review recommended'}
      </p>
    </div>
  );
};

// 5. Goal Progress Tracker
const GoalTracker: React.FC<{ goal: any; savingsRate: number }> = ({ goal, savingsRate }) => {
  const remainingAmount = goal.target * (100 - goal.progress) / 100;
  const monthlySavings = (goal.target * 0.05);
  const monthsToGoal = remainingAmount > 0 ? Math.ceil(remainingAmount / monthlySavings) : 0;
  
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-white font-semibold">{goal.name}</p>
          <p className="text-gray-400 text-sm">Target: ₹{goal.target.toLocaleString()}</p>
        </div>
        <div className="bg-blue-600/20 px-3 py-1 rounded-full">
          <span className="text-blue-400 text-sm font-medium">{goal.progress}%</span>
        </div>
      </div>
      
      <div className="relative w-full h-3 bg-gray-700 rounded-full overflow-hidden">
        <motion.div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${goal.progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-400">Saved</p>
          <p className="text-white font-medium">₹{(goal.target * goal.progress / 100).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-400">Remaining</p>
          <p className="text-white font-medium">₹{remainingAmount.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-400">Monthly Savings Rate</p>
          <p className="text-green-400 font-medium">{savingsRate}%</p>
        </div>
        <div>
          <p className="text-gray-400">Estimated Completion</p>
          <p className="text-blue-400 font-medium">{monthsToGoal > 0 ? `${monthsToGoal} months` : 'Achieved'}</p>
        </div>
      </div>
      
      {monthsToGoal > 0 && (
        <div className="mt-3 p-3 bg-blue-600/10 border border-blue-800/30 rounded-lg">
          <p className="text-sm text-blue-300">
            At your current savings rate, you will reach this goal in {monthsToGoal} months.
            {savingsRate < 20 && ' Increasing your savings rate to 20% would accelerate this timeline.'}
          </p>
        </div>
      )}
    </div>
  );
};

// 6. Subscription Usage Chart
const SubscriptionChart: React.FC<{ subscriptions: any[] }> = ({ subscriptions }) => {
  const data = subscriptions.map(sub => ({
    name: sub.name,
    usage: Math.round(30 + Math.random() * 60),
    amount: sub.amount
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis type="number" stroke="#9CA3AF" tickFormatter={(value) => `${value}%`} />
          <YAxis type="category" dataKey="name" stroke="#9CA3AF" />
          <Tooltip
            content={({ active, payload }: any) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-2xl">
                    <p className="text-white font-semibold">{payload[0].payload.name}</p>
                    <p className="text-blue-400">Usage: {payload[0].value}%</p>
                    <p className="text-gray-400 text-sm">Cost: ₹{payload[0].payload.amount}/month</p>
                    {payload[0].value < 30 && (
                      <p className="text-yellow-400 text-xs mt-1">Low usage - consider cancellation</p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="usage" fill="#3B82F6" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.usage < 30 ? '#F59E0B' : entry.usage < 60 ? '#3B82F6' : '#10B981'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 flex gap-4 text-xs text-gray-400">
        <span><span className="inline-block w-3 h-3 bg-green-400 rounded mr-1"></span> High usage (&gt;60%)</span>
        <span><span className="inline-block w-3 h-3 bg-blue-400 rounded mr-1"></span> Medium usage (30-60%)</span>
        <span><span className="inline-block w-3 h-3 bg-yellow-400 rounded mr-1"></span> Low usage (&lt;30%)</span>
      </div>
    </div>
  );
};

// 7. Dropdown Recommendation Card
const ExpandableRecommendation: React.FC<{ recommendation: any; index: number }> = ({ recommendation, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
      <div 
        className="p-4 cursor-pointer hover:bg-gray-700/50 transition-colors flex justify-between items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
            {index + 1}
          </div>
          <div>
            <h4 className="font-semibold text-gray-200">{recommendation.action}</h4>
            <p className="text-sm text-gray-400">{recommendation.why}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded-full">
            {recommendation.impact}
          </span>
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {isExpanded && (
        <motion.div 
          className="p-4 border-t border-gray-700 bg-gray-900/30"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Analysis</p>
              <p className="text-gray-300 text-sm mt-1">
                {recommendation.action === 'Reduce Food & Dining spending by 15%' && 
                  'Your food spending has increased by 22% this month. You spent ₹2,800 more on dining out and food delivery services.'}
                {recommendation.action === 'Audit recurring subscriptions' && 
                  'You have 4 active subscriptions totaling ₹3,267 per month. Netflix, Spotify, Gym, and Internet.'}
                {recommendation.action === 'Review unusual transactions' && 
                  '2 unusual transactions detected totaling ₹23,000. These include a laptop purchase and flight booking.'}
                {!recommendation.action.includes('Reduce') && !recommendation.action.includes('Audit') && !recommendation.action.includes('Review') &&
                  'Based on your spending patterns and financial goals, this recommendation will help optimize your finances.'}
              </p>
            </div>
            
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Better Options</p>
              <ul className="text-sm text-gray-300 mt-1 space-y-1">
                {recommendation.action === 'Reduce Food & Dining spending by 15%' && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>
                      <span>Switch to meal prep - save ₹4,000/month</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>
                      <span>Use Zomato Gold (₹199/month) - save 20% on deliveries</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>
                      <span>Cook 2 extra meals at home - save ₹2,500/month</span>
                    </li>
                  </>
                )}
                {recommendation.action === 'Audit recurring subscriptions' && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>
                      <span>Netflix Basic (₹199) vs Premium (₹649) - save ₹450/month</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>
                      <span>Spotify Family plan (₹179) vs Individual (₹119) - better value</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>
                      <span>Internet - Airtel (₹999) vs Jio (₹699) - save ₹300/month</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>
                      <span>Gym membership - check if workplace has free gym</span>
                    </li>
                  </>
                )}
                {recommendation.action === 'Review unusual transactions' && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>
                      <span>Laptop purchase - Consider EMI option (₹5,000/month) instead of full payment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>
                      <span>Flight booking - Use credit card points for discount</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>
                      <span>Set up transaction alerts for amounts above ₹5,000</span>
                    </li>
                  </>
                )}
                {!recommendation.action.includes('Reduce') && !recommendation.action.includes('Audit') && !recommendation.action.includes('Review') && (
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">•</span>
                    <span>Maintain your current strategy for optimal results</span>
                  </li>
                )}
              </ul>
            </div>
            
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Coupons & Offers</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {recommendation.action === 'Reduce Food & Dining spending by 15%' && (
                  <>
                    <span className="px-3 py-1 bg-green-900/30 border border-green-800/30 rounded-full text-xs text-green-300">
                      Zomato: FLAT20 - 20% off
                    </span>
                    <span className="px-3 py-1 bg-green-900/30 border border-green-800/30 rounded-full text-xs text-green-300">
                      Swiggy: SWIGGY15 - 15% off
                    </span>
                    <span className="px-3 py-1 bg-green-900/30 border border-green-800/30 rounded-full text-xs text-green-300">
                      EazyDiner: EAZY10 - 10% off
                    </span>
                  </>
                )}
                {recommendation.action === 'Audit recurring subscriptions' && (
                  <>
                    <span className="px-3 py-1 bg-green-900/30 border border-green-800/30 rounded-full text-xs text-green-300">
                      Netflix: 3 months free with Airtel
                    </span>
                    <span className="px-3 py-1 bg-green-900/30 border border-green-800/30 rounded-full text-xs text-green-300">
                      Spotify: 2 months free trial
                    </span>
                    <span className="px-3 py-1 bg-green-900/30 border border-green-800/30 rounded-full text-xs text-green-300">
                      Cult.fit: 50% off first month
                    </span>
                  </>
                )}
                {!recommendation.action.includes('Reduce') && !recommendation.action.includes('Audit') && !recommendation.action.includes('Review') && (
                  <span className="px-3 py-1 bg-gray-700 rounded-full text-xs text-gray-400">
                    No active coupons found
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// 8. Unusual Transactions Card
const UnusualTransactionsCard: React.FC<{ transactions: any[] }> = ({ transactions }) => {
  return (
    <div className="space-y-3">
      {transactions.map((transaction, index) => (
        <div key={index} className="bg-red-900/10 border border-red-800/30 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white font-medium">{transaction.description}</p>
              <p className="text-gray-400 text-sm">{transaction.date}</p>
            </div>
            <div className="text-right">
              <p className="text-red-400 font-bold">₹{transaction.amount.toLocaleString()}</p>
              <p className="text-xs text-yellow-400">Flagged for review</p>
            </div>
          </div>
          <div className="mt-2 p-2 bg-yellow-900/10 border border-yellow-800/30 rounded-lg">
            <p className="text-xs text-yellow-300">
              This transaction is {Math.round(transaction.amount / 5000)}x higher than your average spending in this category.
              {transaction.amount > 10000 && ' Consider if this was necessary and look for alternative options.'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ===== MAIN REPORT VIEWER =====

const ReportViewer: React.FC<ReportViewerProps> = ({ 
  userId = 'demo-user', 
  reportType = 'monthly',
  onExport 
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // ===== LOAD REPORT =====
  useEffect(() => {
    loadReport();
  }, [userId, reportType]);

  // ===== ENSURE CHARTS RENDER =====
  useEffect(() => {
    if (report) {
      const timeout = setTimeout(() => {
        const charts = document.querySelectorAll('.recharts-wrapper');
        charts.forEach((chart: any) => {
          if (chart.style) {
            chart.style.width = '100%';
            chart.style.height = '300px';
            chart.style.display = 'block';
            chart.style.visibility = 'visible';
          }
        });
        
        const canvases = document.querySelectorAll('.recharts-surface canvas');
        canvases.forEach((canvas: any) => {
          canvas.style.width = '100%';
          canvas.style.height = '100%';
          canvas.style.display = 'block';
        });
      }, 500);
      
      return () => clearTimeout(timeout);
    }
  }, [report]);

  // ===== LOAD REPORT FUNCTION =====
  const loadReport = async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await fetchReportData(userId);
      setReportData(data);
      
      const structuredReport = generateStructuredReport(data);
      
      const fullReport: GeneratedReport = {
        ...structuredReport,
        summary: generateSummary(data, reportType),
        keyTakeaways: generateKeyTakeaways(data, reportType),
        recommendations: generateRecommendations(data, reportType),
        sections: generateSections(data, reportType)
      };
      
      setReport(fullReport);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  // ===== GENERATE FUNCTIONS =====
  const getTopCategory = (categories: Record<string, number>): string => {
    const entries = Object.entries(categories);
    if (entries.length === 0) return 'No categories';
    return entries.sort((a, b) => b[1] - a[1])[0][0];
  };

  const generateSummary = (data: ReportData, type: string): string => {
    const savingsRate = calculateSavingsRate(data);
    const topCategory = getTopCategory(data.expenses.byCategory);
    const currentMonth = data.expenses.monthlyTrend[data.expenses.monthlyTrend.length - 1];
    const previousMonth = data.expenses.monthlyTrend[data.expenses.monthlyTrend.length - 2] || data.expenses.monthlyTrend[0];
    const isSpendingLess = currentMonth.amount < previousMonth.amount;
    const topHolding = data.investments.holdings.sort((a, b) => b.value - a.value)[0];
    
    const summaries: Record<string, string[]> = {
      monthly: [
        `Financial Health Score: ${data.healthScore}/100 - ${data.healthScore >= 70 ? 'Good' : 'Needs improvement'}`,
        `Total monthly spending: ₹${data.expenses.total.toLocaleString()}`,
        `Savings rate: ${savingsRate}% ${savingsRate >= 20 ? '(On target)' : '(Below target)'}`,
        `Portfolio value: ₹${data.investments.totalValue.toLocaleString()} (${data.investments.performance.month}% return)`,
        `Top holding: ${topHolding?.symbol || 'N/A'} (${Math.round((topHolding?.value || 0) / data.investments.totalValue * 100)}% of portfolio)`,
        `Monthly spending ${isSpendingLess ? 'decreased' : 'increased'} compared to last month`
      ],
      
      expense: [
        `Total monthly spending: ₹${data.expenses.total.toLocaleString()}`,
        `Highest spending category: ${topCategory} (${Math.round((data.expenses.byCategory[topCategory] / data.expenses.total) * 100)}% of total)`,
        `Monthly spending ${isSpendingLess ? 'decreased' : 'increased'} by ₹${Math.abs(currentMonth.amount - previousMonth.amount).toLocaleString()}`,
        `${data.expenses.recurringPayments.length} active subscriptions totaling ₹${data.expenses.recurringPayments.reduce((s, i) => s + i.amount, 0).toLocaleString()}/month`,
        `${data.expenses.unusualSpending.length} unusual transactions detected`,
        `Average daily spending: ₹${Math.round(data.expenses.total / 30).toLocaleString()}`
      ],
      
      investment: [
        `Portfolio value: ₹${data.investments.totalValue.toLocaleString()}`,
        `${data.investments.holdings.length} holdings across ${Object.keys(data.investments.sectorAllocation).length} sectors`,
        `Monthly return: ${data.investments.performance.month}% ${data.investments.performance.month > 0 ? '(Positive)' : '(Negative)'}`,
        `Year-to-date return: ${data.investments.performance.year}%`,
        `Diversification: ${calculateDiversification(data.investments)}`,
        `Top performer: ${topHolding?.symbol || 'N/A'} (${topHolding?.change || 0}%)`
      ],
      
      health: [
        `Financial Health Score: ${data.healthScore}/100 - ${data.healthScore >= 70 ? 'Good' : data.healthScore >= 50 ? 'Fair' : 'Needs attention'}`,
        `Savings rate: ${savingsRate}% ${savingsRate >= 20 ? '(On target)' : '(Below target)'}`,
        `${data.goals.filter(g => g.progress > 50).length}/${data.goals.length} goals on track`,
        `Emergency fund: ${data.goals.find(g => g.name === 'Emergency Fund')?.progress || 0}% of target`,
        `Monthly spending ${isSpendingLess ? 'decreased' : 'increased'} compared to last month`,
        `BMW goal: ${data.goals.find(g => g.name === 'BMW Car')?.progress || 0}% complete`
      ]
    };
    
    return summaries[type]?.join(' • ') || summaries.monthly.join(' • ');
  };

  const generateKeyTakeaways = (data: ReportData, type: string): string[] => {
    const savingsRate = calculateSavingsRate(data);
    const topCategory = getTopCategory(data.expenses.byCategory);
    const onTrackGoals = data.goals.filter(g => g.progress > 50).length;
    const criticalAlerts = data.alerts.filter(a => a.severity === 'critical').length;
    const currentMonth = data.expenses.monthlyTrend[data.expenses.monthlyTrend.length - 1];
    const previousMonth = data.expenses.monthlyTrend[data.expenses.monthlyTrend.length - 2] || data.expenses.monthlyTrend[0];
    const isSpendingLess = currentMonth.amount < previousMonth.amount;
    const topHolding = data.investments.holdings.sort((a, b) => b.value - a.value)[0];
    
    const takeaways: Record<string, string[]> = {
      monthly: [
        `Total spending: ₹${data.expenses.total.toLocaleString()} (${isSpendingLess ? '↓ decreased' : '↑ increased'})`,
        `Portfolio return: ${data.investments.performance.month}% this month`,
        `${onTrackGoals}/${data.goals.length} goals on track`,
        `${criticalAlerts} critical alerts require attention`,
        `Top holding: ${topHolding?.symbol || 'N/A'} (${Math.round((topHolding?.value || 0) / data.investments.totalValue * 100)}% of portfolio)`,
        `Savings rate: ${savingsRate}% ${savingsRate >= 20 ? '✓ on target' : '⚠ below target'}`
      ],
      
      expense: [
        `Highest spending category: ${topCategory} (${Math.round((data.expenses.byCategory[topCategory] / data.expenses.total) * 100)}% of total)`,
        `${isSpendingLess ? 'Spending decreased' : 'Spending increased'} by ₹${Math.abs(currentMonth.amount - previousMonth.amount).toLocaleString()}`,
        `${data.expenses.recurringPayments.length} active subscriptions: ₹${data.expenses.recurringPayments.reduce((s, i) => s + i.amount, 0).toLocaleString()}/month`,
        `${data.expenses.unusualSpending.length} unusual transactions detected`,
        `Average daily spending: ₹${Math.round(data.expenses.total / 30).toLocaleString()}`
      ],
      
      investment: [
        `Portfolio value: ₹${data.investments.totalValue.toLocaleString()}`,
        `${data.investments.holdings.length} holdings | ${Object.keys(data.investments.sectorAllocation).length} sectors`,
        `${data.investments.performance.month > 0 ? 'Positive' : 'Negative'} return: ${data.investments.performance.month}%`,
        `Top performer: ${topHolding?.symbol || 'N/A'}`,
        `Diversification: ${calculateDiversification(data.investments)}`
      ],
      
      health: [
        `Health Score: ${data.healthScore}/100 ${data.healthScore >= 70 ? '✓ Good' : '⚠ Needs improvement'}`,
        `Savings rate: ${savingsRate}% ${savingsRate >= 20 ? '✓' : '⚠'}`,
        `${onTrackGoals}/${data.goals.length} goals on track`,
        `Emergency fund: ${data.goals.find(g => g.name === 'Emergency Fund')?.progress || 0}% of target`,
        `${isSpendingLess ? 'Spending decreased this month' : 'Focus on reducing expenses'}`
      ]
    };
    
    return takeaways[type] || takeaways.monthly;
  };

  const generateRecommendations = (data: ReportData, type: string): Recommendation[] => {
    const topCat = getTopCategory(data.expenses.byCategory);
    const savingsRate = calculateSavingsRate(data);
    const recs: Recommendation[] = [];
    const currentMonth = data.expenses.monthlyTrend[data.expenses.monthlyTrend.length - 1];
    const previousMonth = data.expenses.monthlyTrend[data.expenses.monthlyTrend.length - 2] || data.expenses.monthlyTrend[0];
    const isSpendingLess = currentMonth.amount < previousMonth.amount;
    
    switch(type) {
      case 'expense':
        if (isSpendingLess) {
          recs.push({
            action: 'Maintain spending discipline',
            why: 'You spent less than last month - this is positive momentum',
            impact: 'Continue building sustainable spending habits'
          });
        } else {
          recs.push({
            action: `Reduce ${topCat} spending by 15%`,
            why: `${topCat} increased by ₹${(currentMonth.amount - previousMonth.amount).toLocaleString()}`,
            impact: `Save ₹${Math.round(data.expenses.byCategory[topCat] * 0.15).toLocaleString()} per month`
          });
        }
        
        if (data.expenses.recurringPayments.length > 3) {
          const totalRecurring = data.expenses.recurringPayments.reduce((s, i) => s + i.amount, 0);
          recs.push({
            action: 'Audit recurring subscriptions',
            why: `${data.expenses.recurringPayments.length} subscriptions = ₹${totalRecurring.toLocaleString()}/month`,
            impact: 'Cancel unused services and save money'
          });
        }
        
        if (data.expenses.unusualSpending.length > 0) {
          recs.push({
            action: 'Review unusual transactions',
            why: `${data.expenses.unusualSpending.length} unusual expenses detected`,
            impact: 'Prevent future overspending and identify fraud'
          });
        }
        break;
        
      case 'investment':
        const diversification = calculateDiversification(data.investments);
        if (diversification === 'Concentrated Portfolio') {
          recs.push({
            action: 'Diversify your portfolio',
            why: 'High concentration increases portfolio risk',
            impact: 'Reduce risk while maintaining returns'
          });
        }
        
        const topHolding = data.investments.holdings.sort((a, b) => b.value - a.value)[0];
        if (topHolding && topHolding.value / data.investments.totalValue > 0.3) {
          recs.push({
            action: `Reduce exposure to ${topHolding.symbol}`,
            why: `${topHolding.symbol} is ${Math.round(topHolding.value / data.investments.totalValue * 100)}% of portfolio`,
            impact: 'Better risk management and diversification'
          });
        }
        
        if (data.investments.performance.month < 2) {
          recs.push({
            action: 'Review underperforming assets',
            why: `${data.investments.performance.month}% return is below market average`,
            impact: 'Optimize portfolio for better returns'
          });
        }
        break;
        
      case 'health':
        if (savingsRate < 20) {
          recs.push({
            action: 'Increase savings rate to 20%',
            why: `Current rate: ${savingsRate}% - below recommended target`,
            impact: 'Achieve financial goals faster'
          });
        }
        
        const bmwGoal = data.goals.find(g => g.name === 'BMW Car');
        if (bmwGoal && bmwGoal.progress < 50) {
          recs.push({
            action: 'Accelerate BMW savings plan',
            why: `${bmwGoal.progress}% of target achieved`,
            impact: 'Own your BMW sooner'
          });
        }
        
        if (data.healthScore < 70) {
          recs.push({
            action: 'Improve financial health score',
            why: 'Score indicates room for improvement',
            impact: 'Greater financial security and peace of mind'
          });
        }
        break;
        
      default:
        if (savingsRate < 20) {
          recs.push({
            action: 'Boost savings rate to 20%',
            why: `Current rate: ${savingsRate}%`,
            impact: 'Build emergency fund and reach goals faster'
          });
        }
        
        if (data.healthScore < 70) {
          recs.push({
            action: 'Improve financial health',
            why: 'Health score needs attention',
            impact: 'Better financial stability'
          });
        }
        
        if (data.investments.holdings.length < 5) {
          recs.push({
            action: 'Expand investment portfolio',
            why: 'Limited diversification increases risk',
            impact: 'Better risk-adjusted returns'
          });
        }
    }
    
    if (recs.length === 0) {
      recs.push({
        action: 'Continue your current strategy',
        why: 'Your finances are well managed',
        impact: 'Maintain financial health'
      });
    }
    
    return recs.slice(0, 3);
  };

  const generateSections = (data: ReportData, type: string): any[] => {
    const topCategory = getTopCategory(data.expenses.byCategory);
    const savingsRate = calculateSavingsRate(data);
    const diversification = calculateDiversification(data.investments);
    const currentMonth = data.expenses.monthlyTrend[data.expenses.monthlyTrend.length - 1];
    const previousMonth = data.expenses.monthlyTrend[data.expenses.monthlyTrend.length - 2] || data.expenses.monthlyTrend[0];
    const isSpendingLess = currentMonth.amount < previousMonth.amount;
    const topHolding = data.investments.holdings.sort((a, b) => b.value - a.value)[0];
    const sections: any[] = [];

    switch(type) {
      case 'monthly':
        sections.push({
          heading: 'Daily Spending Pattern',
          content: `Analysis of spending across the week shows higher spending on weekends.`,
          type: 'insight',
          customComponent: React.createElement(DailySpendingChart, {
            data: [
              { name: 'Mon', amount: 2100, isWeekend: false },
              { name: 'Tue', amount: 1850, isWeekend: false },
              { name: 'Wed', amount: 2300, isWeekend: false },
              { name: 'Thu', amount: 1950, isWeekend: false },
              { name: 'Fri', amount: 2800, isWeekend: false },
              { name: 'Sat', amount: 4500, isWeekend: true },
              { name: 'Sun', amount: 3800, isWeekend: true }
            ]
          })
        });
        
        sections.push({
          heading: 'Spending Distribution',
          content: `Total monthly spending: ₹${data.expenses.total.toLocaleString()} across ${Object.keys(data.expenses.byCategory).filter(k => data.expenses.byCategory[k] > 0).length} categories.`,
          type: 'insight',
          chartData: data.expenses.byCategory,
          chartType: 'pie'
        });
        break;
        
      case 'expense':
        sections.push({
          heading: 'Month-over-Month Analysis',
          content: `Comparing this month (₹${currentMonth.amount.toLocaleString()}) with last month (₹${previousMonth.amount.toLocaleString()}).`,
          type: isSpendingLess ? 'achievement' : 'warning',
          customComponent: React.createElement(MonthComparisonCard, {
            current: currentMonth.amount,
            previous: previousMonth.amount
          })
        });
        
        sections.push({
          heading: 'Spending by Category',
          content: `${topCategory} is your top spending category at ₹${data.expenses.byCategory[topCategory].toLocaleString()}. ${data.expenses.recurringPayments.length > 0 ? `You have ${data.expenses.recurringPayments.length} recurring subscriptions.` : ''}`,
          type: 'insight',
          chartData: data.expenses.byCategory,
          chartType: 'pie'
        });
        
        sections.push({
          heading: 'Monthly Spending Trend',
          content: `Your spending has ${data.expenses.monthlyTrend[data.expenses.monthlyTrend.length - 1].amount > data.expenses.monthlyTrend[0].amount ? 'increased' : 'decreased'} over the past ${data.expenses.monthlyTrend.length} months.`,
          type: 'insight',
          chartData: data.expenses.monthlyTrend.map(m => ({ name: m.month, value: m.amount })),
          chartType: 'line'
        });
        
        if (data.expenses.unusualSpending.length > 0) {
          sections.push({
            heading: 'Unusual Transactions',
            content: `${data.expenses.unusualSpending.length} transactions flagged for review:`,
            type: 'warning',
            customComponent: React.createElement(UnusualTransactionsCard, {
              transactions: data.expenses.unusualSpending
            })
          });
        }
        
        if (data.expenses.recurringPayments.length > 0) {
          sections.push({
            heading: 'Subscription Analysis',
            content: `${data.expenses.recurringPayments.length} active subscriptions. Review usage patterns below.`,
            type: 'insight',
            customComponent: React.createElement(SubscriptionChart, {
              subscriptions: data.expenses.recurringPayments
            })
          });
        }
        break;
        
      case 'investment':
        sections.push({
          heading: 'Portfolio Summary',
          content: `Total value: ₹${data.investments.totalValue.toLocaleString()} | ${data.investments.holdings.length} holdings | ${diversification}`,
          type: 'insight',
          chartData: data.investments.sectorAllocation,
          chartType: 'pie'
        });
        
        sections.push({
          heading: 'Stock Performance',
          content: `Top performer: ${topHolding?.symbol || 'N/A'} (${topHolding?.change || 0}%). ${data.investments.holdings.filter(h => h.change > 0).length}/${data.investments.holdings.length} stocks positive this month.`,
          type: 'insight',
          customComponent: React.createElement(
            'div',
            { className: 'grid grid-cols-2 md:grid-cols-3 gap-3 mt-3' },
            data.investments.holdings.map((holding, i) => 
              React.createElement(InvestmentCard, { key: i, holding })
            )
          )
        });
        break;
        
      case 'health':
        sections.push({
          heading: 'Financial Wellness',
          content: `Your financial health score is ${data.healthScore}/100.`,
          type: data.healthScore >= 70 ? 'achievement' : 'warning',
          customComponent: React.createElement(HealthScoreCard, {
            score: data.healthScore
          })
        });
        
        sections.push({
          heading: 'Goal Progress',
          content: `${data.goals.filter(g => g.progress > 50).length}/${data.goals.length} goals are on track.`,
          type: 'achievement',
          customComponent: React.createElement(
            'div',
            { className: 'grid md:grid-cols-2 gap-4 mt-3' },
            data.goals.map((goal, i) => 
              React.createElement(GoalTracker, { key: i, goal, savingsRate })
            )
          )
        });
        break;
    }
    
    return sections;
  };

  // ===== EXPORT HANDLER =====
  const handleExport = async (format: 'pdf' | 'excel') => {
    if (format === 'pdf') {
      setIsExporting(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const exportData = {
          title: report?.title || 'Financial Report',
          summary: report?.summary || '',
          sections: report?.sections || [],
          keyTakeaways: report?.keyTakeaways || [],
          recommendations: report?.recommendations || [],
          nextSteps: report?.nextSteps || [],
          generatedAt: report?.generatedAt || new Date().toISOString(),
          reportType: reportType
        };
        
        await exportReportToPDF('report-content', exportData);
      } catch (error) {
        console.error('Export failed:', error);
      } finally {
        setIsExporting(false);
      }
    } else {
      alert('Excel export coming soon!');
    }
  };

  // ===== RENDER =====
  if (loading) {
    return <ReportSkeleton />;
  }

  if (!report || !reportData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-400">No report data available</h2>
        <button 
          onClick={loadReport}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div id="report-content" className="max-w-7xl mx-auto p-4 md:p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
              AI Generated
            </span>
            <span className="px-3 py-1 bg-green-900 text-green-400 text-xs font-medium rounded-full">
              Live Data
            </span>
            <span className="px-3 py-1 bg-gray-700 text-gray-300 text-xs font-medium rounded-full">
              {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {reportType === 'expense' ? 'Expense Analysis' :
             reportType === 'investment' ? 'Portfolio Intelligence' :
             reportType === 'health' ? 'Financial Wellness' :
             'Monthly Financial Review'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Generated on {new Date(report.generatedAt).toLocaleString()}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              isExporting 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              <>Export PDF</>
            )}
          </button>
          <button 
            onClick={() => handleExport('excel')}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="mb-8 p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Executive Summary</h2>
        <div className="space-y-1.5">
          {report.summary.split(' • ').map((point, index) => (
            <div key={index} className="flex items-start gap-2 text-gray-300">
              <span className="text-blue-400 mt-1">•</span>
              <span>{point}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Report Sections */}
      <div className="space-y-6">
        {report.sections.map((section, index) => (
          <motion.div
            key={index}
            className={`p-6 rounded-xl border transition-all cursor-pointer ${
              activeSection === index ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-lg'
            } ${
              section.type === 'warning' ? 'border-yellow-800/30 bg-yellow-900/20' :
              section.type === 'achievement' ? 'border-green-800/30 bg-green-900/20' :
              'border-gray-700/50 bg-gray-800/50'
            }`}
            onClick={() => setActiveSection(activeSection === index ? null : index)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <h3 className={`text-xl font-semibold mb-3 ${
              section.type === 'warning' ? 'text-yellow-400' :
              section.type === 'achievement' ? 'text-green-400' :
              'text-gray-200'
            }`}>{section.heading}</h3>
            
            {section.customComponent ? (
              <div className="mt-2">
                {section.customComponent}
              </div>
            ) : (
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{section.content}</p>
            )}
            
            {section.chartData && !section.customComponent && activeSection === index && (
              <motion.div 
                className="mt-6 h-64"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 256 }}
                transition={{ duration: 0.3 }}
              >
                <ReportCharts 
                  data={section.chartData} 
                  chartType={section.chartType || getChartType(section.heading)} 
                />
              </motion.div>
            )}
            
            {section.chartData && !section.customComponent && (
              <div className="mt-3 text-sm text-blue-400">
                {activeSection === index ? 'Hide chart' : 'Click to view chart'}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Key Takeaways */}
      <div className="mt-8 p-6 bg-yellow-900/20 border border-yellow-800/30 rounded-xl">
        <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wide mb-3">Key Takeaways</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {report.keyTakeaways && report.keyTakeaways.length > 0 ? (
            report.keyTakeaways.map((takeaway, i) => (
              <div 
                key={i}
                className="flex items-start gap-2 bg-gray-800/50 p-3 rounded-lg border border-gray-700"
              >
                <span className="text-yellow-500 mt-0.5">•</span>
                <span className="text-gray-300">{takeaway}</span>
              </div>
            ))
          ) : (
            <div className="text-gray-400">No takeaways available</div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Recommended Actions</h3>
        <div className="space-y-3">
          {report.recommendations.map((rec, i) => (
            <ExpandableRecommendation key={i} recommendation={rec} index={i} />
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="mt-8 p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Next Steps</h3>
        <div className="flex flex-wrap gap-3">
          {report.nextSteps.map((step, i) => (
            <span 
              key={i}
              className="px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 hover:border-blue-500 transition-colors text-gray-300 text-sm"
            >
              {i+1}. {step}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ===== CHART COMPONENT =====
const ReportCharts: React.FC<{ data: any; chartType: 'pie' | 'bar' | 'line' }> = ({ data, chartType }) => {
  let chartData = [];
  
  if (Array.isArray(data)) {
    chartData = data.map(item => ({ ...item }));
  } else {
    chartData = Object.entries(data).map(([name, value]) => ({ 
      name, 
      value: typeof value === 'number' ? value : 0 
    }));
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = chartData.reduce((s, i) => s + i.value, 0);
      const percentage = total > 0 ? ((payload[0].value / total) * 100) : 0;
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-2xl">
          <p className="text-gray-400 text-xs uppercase tracking-wide">{label}</p>
          <p className="text-blue-400 font-bold text-xl">₹{payload[0].value.toLocaleString()}</p>
          {total > 0 && <p className="text-gray-400 text-xs mt-1">{percentage.toFixed(1)}% of total</p>}
        </div>
      );
    }
    return null;
  };

  if (chartType === 'pie') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={(entry: any) => {
              const total = chartData.reduce((s, i) => s + i.value, 0);
              const percentage = total > 0 ? ((entry.value / total) * 100) : 0;
              return `${entry.name} (${percentage.toFixed(0)}%)`;
            }}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {chartData.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" tickFormatter={(value) => `₹${value.toLocaleString()}`} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="name" stroke="#9CA3AF" />
        <YAxis stroke="#9CA3AF" tickFormatter={(value) => `₹${value.toLocaleString()}`} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]}>
          {chartData.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

const getChartType = (heading: string): 'pie' | 'bar' | 'line' => {
  if (heading.includes('Distribution') || heading.includes('Category') || heading.includes('Breakdown')) return 'pie';
  if (heading.includes('Trend') || heading.includes('Tracker') || heading.includes('Monthly')) return 'line';
  if (heading.includes('Portfolio') || heading.includes('Sector')) return 'pie';
  return 'bar';
};

export default ReportViewer;

