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
import { supabase, isSupabaseConfigured } from '../../supabaseClient';  // ✅ FIXED
import GoalTracker from '../GoalTracker';
import { Target, X } from 'lucide-react';

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

// 5. Subscription Usage Chart
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

// 6. Unusual Transactions Card
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
  const [error, setError] = useState<string | null>(null);
  const [showGoalTracker, setShowGoalTracker] = useState<boolean>(false);

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
  // src/components/reports/ReportViewer.tsx

// In the loadReport function, update the code:

const loadReport = async (): Promise<void> => {
  setLoading(true);
  setError(null);
  
  try {
    // ✅ Check if Supabase is configured and available
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured. Please check your environment variables.');
      setLoading(false);
      return;
    }

    let userIdToUse = userId;
    
    if (userId === 'demo-user') {
      // ✅ Safe check before calling supabase.auth
      if (supabase && supabase.auth) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          userIdToUse = user.id;
        } else {
          setError('Please login to view your financial report');
          setLoading(false);
          return;
        }
      } else {
        setError('Authentication service unavailable');
        setLoading(false);
        return;
      }
    }

    const data = await fetchReportData(userIdToUse);
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
  } catch (error: any) {
    console.error('Error loading report:', error);
    setError(error.message || 'Failed to load report data. Please try again.');
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
    const isSpendingLess = currentMonth?.amount < previousMonth?.amount;
    const topHolding = data.investments.holdings.sort((a, b) => b.value - a.value)[0];
    
    const summaries: Record<string, string> = {
      expense: `Financial Health Score: ${data.healthScore}/100 • You spent ₹${data.expenses.total.toLocaleString()} this month • Savings rate: ${savingsRate}% • ${isSpendingLess ? 'You spent less than last month!' : 'Your spending increased compared to last month'} • Top category: ${topCategory} (${Math.round((data.expenses.byCategory[topCategory] / data.expenses.total) * 100)}%)`
    };
    
    return summaries[type] || `Financial Health Score: ${data.healthScore}/100 • Total monthly spending: ₹${data.expenses.total.toLocaleString()} • Savings rate: ${savingsRate}% • Portfolio value: ₹${data.investments.totalValue.toLocaleString()} (${data.investments.performance.month}% return) • Top holding: ${topHolding?.symbol || 'N/A'} • Monthly spending ${isSpendingLess ? 'decreased' : 'increased'} compared to last month`;
  };

  const generateKeyTakeaways = (data: ReportData, type: string): string[] => {
    const savingsRate = calculateSavingsRate(data);
    const topCategory = getTopCategory(data.expenses.byCategory);
    const onTrackGoals = data.goals.filter(g => g.progress > 50).length;
    const criticalAlerts = data.alerts.filter(a => a.severity === 'critical').length;
    const currentMonth = data.expenses.monthlyTrend[data.expenses.monthlyTrend.length - 1];
    const previousMonth = data.expenses.monthlyTrend[data.expenses.monthlyTrend.length - 2] || data.expenses.monthlyTrend[0];
    const isSpendingLess = currentMonth?.amount < previousMonth?.amount;
    const topHolding = data.investments.holdings.sort((a, b) => b.value - a.value)[0];
    
    return [
      `Total spending: ₹${data.expenses.total.toLocaleString()} (${isSpendingLess ? '↓ decreased' : '↑ increased'})`,
      `Portfolio return: ${data.investments.performance.month}% this month`,
      `${onTrackGoals}/${data.goals.length} goals on track`,
      `${criticalAlerts} critical alerts require attention`,
      `Top holding: ${topHolding?.symbol || 'N/A'}`,
      `Savings rate: ${savingsRate}%`
    ];
  };

  const generateRecommendations = (data: ReportData, type: string): Recommendation[] => {
    const topCat = getTopCategory(data.expenses.byCategory);
    const savingsRate = calculateSavingsRate(data);
    const recs: Recommendation[] = [];
    
    if (savingsRate < 20) {
      recs.push({
        action: 'Increase your savings rate',
        why: `You're saving ${savingsRate}% of your income, below the recommended 20%`,
        impact: 'Build a stronger emergency fund'
      });
    }
    
    if (data.expenses.byCategory[topCat] > data.expenses.total * 0.3) {
      recs.push({
        action: `Reduce ${topCat} spending`,
        why: `${topCat} is your highest expense category`,
        impact: 'Better budget allocation'
      });
    }
    
    if (recs.length === 0) {
      recs.push({
        action: 'Keep up the good work!',
        why: 'Your finances are well managed',
        impact: 'Continue your current strategy'
      });
    }
    
    return recs.slice(0, 3);
  };

  // ===== GENERATE SECTIONS =====
  const generateSections = (data: ReportData, type: string): any[] => {
    const sections: any[] = [];
    const topCategory = getTopCategory(data.expenses.byCategory);
    const savingsRate = calculateSavingsRate(data);
    const currentMonth = data.expenses.monthlyTrend[data.expenses.monthlyTrend.length - 1];
    const previousMonth = data.expenses.monthlyTrend[data.expenses.monthlyTrend.length - 2] || data.expenses.monthlyTrend[0];

    switch(type) {
      case 'expense':
        // ===== EXPENSE ANALYSIS - FRIENDLY & HELPFUL =====
        const savingsDifference = previousMonth?.amount 
          ? ((currentMonth?.amount - previousMonth?.amount) / previousMonth?.amount * 100) 
          : 0;
        const isSavingMore = savingsDifference < 0;

        sections.push({
          heading: 'Your Spending Pattern',
          content: '',
          type: 'insight',
          customComponent: (
            <div className="space-y-4">
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <p className="text-gray-300 text-sm">
                  Here's a quick look at your spending this month compared to last month.
                  {isSavingMore ? " You're doing great!" : " Let's see where we can make some improvements."}
                </p>
              </div>

              <div className={`p-4 rounded-lg border ${isSavingMore ? 'border-green-800/30 bg-green-900/20' : 'border-yellow-800/30 bg-yellow-900/20'}`}>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-gray-400 text-sm">This Month</p>
                    <p className="text-white text-2xl font-bold">₹{currentMonth?.amount.toLocaleString() || 0}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-gray-400 text-sm">vs Last Month</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isSavingMore ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                        {isSavingMore ? `↓ ${Math.abs(savingsDifference).toFixed(1)}%` : `↑ ${Math.abs(savingsDifference).toFixed(1)}%`}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 text-left md:text-right">
                    <p className="text-gray-400 text-sm">What This Means</p>
                    <p className="text-gray-300 text-sm mt-1">
                      {isSavingMore 
                        ? `You spent ₹${(previousMonth?.amount - currentMonth?.amount).toLocaleString()} less than last month! That's ₹${Math.round((previousMonth?.amount - currentMonth?.amount) / 30).toLocaleString()} per day saved.`
                        : `You spent ₹${(currentMonth?.amount - previousMonth?.amount).toLocaleString()} more than last month. That's about ₹${Math.round((currentMonth?.amount - previousMonth?.amount) / 30).toLocaleString()} extra per day.`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Your Savings Rate</p>
                    <p className={`text-2xl font-bold ${savingsRate >= 20 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {savingsRate}%
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${savingsRate >= 20 ? 'bg-green-400' : 'bg-yellow-400'}`}
                        style={{ width: `${Math.min(savingsRate, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {savingsRate >= 20 
                        ? "Excellent! You're saving above the recommended 20% target." 
                        : savingsRate >= 15
                        ? "Good progress! You're close to the 20% target."
                        : savingsRate >= 10
                        ? "You're on your way. Try to increase your savings rate."
                        : "Let's work on building your savings. Every little bit helps!"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        });

        sections.push({
          heading: 'Where Your Money Goes',
          content: '',
          type: 'insight',
          customComponent: (
            <div className="space-y-3 mt-2">
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <p className="text-gray-400 text-sm mb-3">Your Top 5 Spending Categories</p>
                <div className="space-y-2">
                  {Object.entries(data.expenses.byCategory)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([category, amount], index) => {
                      const percentage = data.expenses.total > 0 ? Math.round((amount / data.expenses.total) * 100) : 0;
                      const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
                      return (
                        <div key={category} className="flex items-center gap-3">
                          <span className="text-gray-400 text-sm w-8">{index + 1}.</span>
                          <div className="flex-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-300">{category}</span>
                              <span className="text-gray-400">₹{amount.toLocaleString()} ({percentage}%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden mt-0.5">
                              <div 
                                className={`h-full rounded-full ${colors[index % colors.length]}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )
        });

        if (data.expenses.unusualSpending.length > 0) {
          sections.push({
            heading: "Let's Review These Expenses",
            content: 'We noticed some unusual transactions. Let\'s review them together:',
            type: 'warning',
            customComponent: (
              <div className="space-y-3 mt-2">
                {data.expenses.unusualSpending.map((transaction: any, index: number) => (
                  <div key={index} className="bg-red-900/10 border border-red-800/30 rounded-lg p-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                      <div>
                        <p className="text-white font-medium">{transaction.description}</p>
                        <p className="text-gray-400 text-sm">{transaction.date}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-red-400 font-bold">₹{transaction.amount.toLocaleString()}</p>
                        <p className="text-xs text-yellow-400">This seems unusual</p>
                      </div>
                    </div>
                    <div className="mt-2 p-2 bg-yellow-900/10 border border-yellow-800/30 rounded-lg">
                      <p className="text-xs text-yellow-300">
                        This is {Math.round(transaction.amount / (data.expenses.total / Math.max(data.expenses.unusualSpending.length, 1)))}x higher than your typical spending. 
                        {transaction.amount > 10000 && " Consider if this was a planned purchase or an impulse buy."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )
          });
        }

        sections.push({
          heading: 'Friendly Suggestions',
          content: '',
          type: 'insight',
          customComponent: (
            <div className="space-y-3 mt-2">
              {savingsRate < 20 && (
                <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4">
                  <h4 className="text-blue-400 font-semibold mb-2">Grow Your Savings</h4>
                  <p className="text-sm text-gray-300 mb-2">
                    You're saving {savingsRate}% of your income. Here's how we can reach the 20% target together:
                  </p>
                  <ul className="space-y-1.5 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>Set up an automatic transfer of ₹{Math.round(data.expenses.total * 0.02)} (2% of your spending) to savings each month</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>Try reducing <strong className="text-white">{topCategory}</strong> spending by just 5% - that would save ₹{Math.round(data.expenses.byCategory[topCategory] * 0.05).toLocaleString()} per month!</span>
                    </li>
                  </ul>
                </div>
              )}

              {data.expenses.recurringPayments.length > 0 && (
                <div className="bg-purple-900/20 border border-purple-800/30 rounded-lg p-4">
                  <h4 className="text-purple-400 font-semibold mb-2">Subscription Check</h4>
                  <p className="text-sm text-gray-300 mb-2">
                    You have {data.expenses.recurringPayments.length} recurring payments. Let's make sure you're getting value:
                  </p>
                  <ul className="space-y-1 text-sm text-gray-300">
                    {data.expenses.recurringPayments.slice(0, 4).map((payment: any, i: number) => (
                      <li key={i} className="flex justify-between items-center border-b border-gray-700/50 pb-1 last:border-0">
                        <span>{payment.name}</span>
                        <span className="text-gray-400">₹{payment.amount.toLocaleString()}/month</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-4">
                <h4 className="text-green-400 font-semibold mb-2">Small Habits, Big Results</h4>
                <ul className="space-y-1.5 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">•</span>
                    <span>Track your daily spending - awareness is the first step to saving</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">•</span>
                    <span>Try the 30-day rule: wait 30 days before making any purchase above ₹5,000</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">•</span>
                    <span>Celebrate small wins - every ₹100 saved is a step toward your goals!</span>
                  </li>
                </ul>
              </div>

              {savingsRate >= 20 && data.expenses.unusualSpending.length === 0 && data.expenses.recurringPayments.length === 0 && (
                <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-4 text-center">
                  <h4 className="text-green-400 font-semibold mb-2">You're Doing Amazing!</h4>
                  <p className="text-sm text-gray-300">
                    You're saving {savingsRate}% of your income, no unusual spending detected, and you're managing your subscriptions well. 
                    Keep up the great work!
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Next step: Consider investing your savings to grow your wealth.
                  </p>
                </div>
              )}
            </div>
          )
        });
        break;

      case 'monthly':
        const totalIncome = data.expenses.monthlyTrend.length > 0 
          ? Math.round(data.expenses.monthlyTrend[data.expenses.monthlyTrend.length - 1].amount * 1.25)
          : 50000;

        const totalExpenses = data.expenses.total || 0;
        const netProfit = totalIncome - totalExpenses;
        const isProfit = netProfit >= 0;

        const stockProfitLoss = data.investments.holdings.reduce((sum: number, inv: any) => {
          return sum + (Number(inv.value || 0) * (Number(inv.change || 0) / 100));
        }, 0);

        // ===== GENERATE SMART SUMMARY =====
        const generateSmartSummary = () => {
          const summaries: string[] = [];
          const categories = data.expenses.byCategory;
          const total = data.expenses.total;
          
          // Exclude essential categories
          const essentialCategories = ['Education', 'Healthcare', 'Medical', 'Insurance', 'Health'];
          
          // Find top non-essential spending categories
          const nonEssentialSpending = Object.entries(categories)
            .filter(([category]) => !essentialCategories.some(ec => 
              category.toLowerCase().includes(ec.toLowerCase())
            ))
            .sort((a, b) => b[1] - a[1]);

          // Find top essential spending (for context)
          const essentialSpending = Object.entries(categories)
            .filter(([category]) => essentialCategories.some(ec => 
              category.toLowerCase().includes(ec.toLowerCase())
            ))
            .sort((a, b) => b[1] - a[1]);

          // 1. Overall financial health
          if (isProfit) {
            summaries.push(`✅ You're in profit this month! You saved ₹${netProfit.toLocaleString()}.`);
          } else {
            summaries.push(`📊 You overspent by ₹${Math.abs(netProfit).toLocaleString()} this month.`);
          }

          // 2. Non-essential spending insights
          if (nonEssentialSpending.length > 0) {
            const topNonEssential = nonEssentialSpending[0];
            const topPercentage = Math.round((topNonEssential[1] / total) * 100);
            
            summaries.push(`🛍️ Your biggest non-essential expense is **${topNonEssential[0]}** at ₹${topNonEssential[1].toLocaleString()} (${topPercentage}% of total).`);
            
            // Suggest reduction
            const suggestedSave = Math.round(topNonEssential[1] * 0.15);
            summaries.push(`💡 Reducing ${topNonEssential[0]} by just 15% could save you ₹${suggestedSave.toLocaleString()} per month.`);
          }

          // 3. Essential spending (for awareness)
          if (essentialSpending.length > 0) {
            const totalEssential = essentialSpending.reduce((sum, [_, amount]) => sum + amount, 0);
            summaries.push(`📚 Essential expenses (Education, Healthcare) total ₹${totalEssential.toLocaleString()}. These are necessary expenses.`);
          }

          // 4. Recurring payments insight
          if (data.expenses.recurringPayments.length > 0) {
            const totalRecurring = data.expenses.recurringPayments.reduce((sum, r) => sum + r.amount, 0);
            summaries.push(`🔄 You have ${data.expenses.recurringPayments.length} subscriptions totaling ₹${totalRecurring.toLocaleString()}/month.`);
            
            if (data.expenses.recurringPayments.length > 3) {
              summaries.push(`💡 Consider reviewing your subscriptions - cancelling just one could save you ₹${Math.round(totalRecurring * 0.15).toLocaleString()}/month.`);
            }
          }

          // 5. Stock performance insight
          if (stockProfitLoss !== 0) {
            summaries.push(`📈 Your portfolio ${stockProfitLoss > 0 ? 'gained' : 'lost'} ${Math.abs(stockProfitLoss).toFixed(2)}% this month.`);
          }

          // 6. Savings rate insight
          if (savingsRate < 20) {
            summaries.push(`💰 Your savings rate is ${savingsRate}%. Aim for 20% by reducing non-essential spending.`);
          } else {
            summaries.push(`🌟 Great job! Your savings rate is ${savingsRate}% - above the recommended 20%.`);
          }

          return summaries;
        };

        const smartSummary = generateSmartSummary();

        sections.push({
          heading: '📊 Profit & Loss Summary',
          content: '',
          type: isProfit ? 'achievement' : 'warning',
          customComponent: (
            <div className="space-y-4 mt-2">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-sm">Total Income</p>
                  <p className="text-green-400 text-2xl font-bold">₹{totalIncome.toLocaleString()}</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-sm">Total Expenses</p>
                  <p className="text-red-400 text-2xl font-bold">₹{totalExpenses.toLocaleString()}</p>
                </div>
                <div className={`p-4 rounded-lg border ${isProfit ? 'border-green-800/30 bg-green-900/20' : 'border-red-800/30 bg-red-900/20'}`}>
                  <p className="text-gray-400 text-sm">Net {isProfit ? 'Profit' : 'Loss'}</p>
                  <p className={`text-2xl font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                    {isProfit ? '+' : '-'}₹{Math.abs(netProfit).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Stock Performance */}
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <p className="text-gray-400 text-sm mb-2">📈 Stock Portfolio Performance</p>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Change</span>
                  <span className={`text-xl font-bold ${stockProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stockProfitLoss >= 0 ? '+' : ''}{stockProfitLoss.toFixed(2)}%
                  </span>
                </div>
                {data.investments.holdings.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {data.investments.holdings.slice(0, 3).map((holding: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm text-gray-400">
                        <span>{holding.symbol}</span>
                        <span className={holding.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {holding.change >= 0 ? '+' : ''}{holding.change}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Monthly Income vs Expenses Chart */}
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <p className="text-gray-400 text-sm mb-3">Monthly Income vs Expenses</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.expenses.monthlyTrend.map((m: any) => ({
                    name: m.month,
                    income: Math.round(m.amount * 1.25),
                    expenses: m.amount
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" tickFormatter={(value) => `₹${value.toLocaleString()}`} />
                    <Tooltip 
                      formatter={(value: number) => `₹${value.toLocaleString()}`}
                      contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #374151' }}
                    />
                    <Bar dataKey="income" fill="#10B981" name="Income" />
                    <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* ✅ SMART SUMMARY BOX */}
              <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4">
                <h4 className="text-blue-400 font-semibold mb-3">🧠 Smart Summary</h4>
                <ul className="space-y-2">
                  {smartSummary.map((point, index) => (
                    <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Insight Message */}
              <div className={`p-4 rounded-lg ${isProfit ? 'bg-green-900/20 border border-green-800/30' : 'bg-yellow-900/20 border border-yellow-800/30'}`}>
                <p className="text-sm text-gray-300">
                  {isProfit 
                    ? `🎉 You're in profit this month! You earned ₹${netProfit.toLocaleString()} more than you spent. `
                    : `📊 You spent ₹${Math.abs(netProfit).toLocaleString()} more than you earned this month. `}
                  {stockProfitLoss > 0 && ` Your stocks gained ${stockProfitLoss.toFixed(2)}% this month.`}
                  {stockProfitLoss < 0 && ` Your stocks declined by ${Math.abs(stockProfitLoss).toFixed(2)}% this month.`}
                  {isProfit ? ' Consider investing the surplus or adding to your emergency fund.' : ' Review your expenses and look for areas to cut back.'}
                </p>
              </div>
            </div>
          )
        });
            
      default:
            sections.push({
              heading: 'Spending Distribution',
              content: `Total monthly spending: ₹${data.expenses.total.toLocaleString()} across ${Object.keys(data.expenses.byCategory).length} categories.`,
              type: 'insight',
              chartData: data.expenses.byCategory,
              chartType: 'pie'
            });

            if (data.expenses.monthlyTrend.length > 0) {
              sections.push({
                heading: 'Monthly Spending Trend',
                content: `Your spending over the past ${data.expenses.monthlyTrend.length} months.`,
                type: 'insight',
                chartData: data.expenses.monthlyTrend.map(m => ({ name: m.month, value: m.amount })),
                chartType: 'line'
              });
            }
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
        setError('Failed to export PDF. Please try again.');
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
        <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-6 max-w-md">
          <h3 className="text-red-400 text-lg font-semibold mb-2">Unable to Load Report</h3>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <button 
            onClick={loadReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!report || !reportData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 max-w-md">
          <h3 className="text-gray-300 text-lg font-semibold mb-2">No Data Available</h3>
          <p className="text-gray-400 text-sm mb-4">Start adding transactions to see your financial report.</p>
        </div>
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
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* ✅ GOAL TRACKER BUTTON */}
          <button 
            onClick={() => setShowGoalTracker(true)}
            className="flex-1 md:flex-none justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Goals
          </button>
          
          <button 
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            className={`flex-1 md:flex-none justify-center px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              isExporting 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
          <button 
            onClick={() => handleExport('excel')}
            className="flex-1 md:flex-none justify-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="mb-8 p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Executive Summary</h2>
        <div className="space-y-1.5">
          {report.summary.split(' • ').map((point: string, index: number) => (
            <div key={index} className="flex items-start gap-2 text-gray-300">
              <span className="text-blue-400 mt-1">•</span>
              <span>{point}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Report Sections */}
      <div className="space-y-6">
        {report.sections.map((section: any, index: number) => (
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
                  chartType={section.chartType || 'pie'} 
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
            report.keyTakeaways.map((takeaway: string, i: number) => (
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
        <div className="grid md:grid-cols-3 gap-4">
          {report.recommendations.map((rec: Recommendation, i: number) => (
            <RecommendationCard key={i} recommendation={rec} index={i} />
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="mt-8 p-6 bg-gray-800/50 border border-gray-700 rounded-xl">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Next Steps</h3>
        <div className="flex flex-wrap gap-3">
          {report.nextSteps.map((step: string, i: number) => (
            <span 
              key={i}
              className="px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 hover:border-blue-500 transition-colors text-gray-300 text-sm"
            >
              {i+1}. {step}
            </span>
          ))}
        </div>
      </div>

      {/* ✅ GOAL TRACKER MODAL */}
      {showGoalTracker && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Goal Tracker</h2>
              <button
                onClick={() => setShowGoalTracker(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <GoalTracker 
                userId={userId}
                onGoalUpdate={() => {
                  loadReport();
                }}
              />
            </div>
          </div>
        </div>
      )}
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
      const total = chartData.reduce((s: number, i: any) => s + i.value, 0);
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
              const total = chartData.reduce((s: number, i: any) => s + i.value, 0);
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

export default ReportViewer;