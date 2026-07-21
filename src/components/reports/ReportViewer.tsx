// src/components/reports/ReportViewer.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Legend
} from 'recharts';
import { ReportData, GeneratedReport, Recommendation } from '../../types/report.types';
import { fetchReportData } from '../../services/reportDataService';
import { generateStructuredReport, calculateSavingsRate, calculateDiversification } from '../../utils/reportCalculations';
import RecommendationCard from './RecommendationCard';
import ReportSkeleton from './ReportSkeleton';
import { exportReportToPDF } from '../../services/pdfExportService';
import { supabase, isSupabaseConfigured } from '../../supabaseClient';
import GoalTracker from '../GoalTracker';
import { Target, X, AlertTriangle, ShieldCheck, TrendingUp, TrendingDown, Info, Briefcase, Activity } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1'];
const RISK_DATA = [
  { subject: "Market Risk", A: 85, fullMark: 100 },
  { subject: "Credit Risk", A: 65, fullMark: 100 },
  { subject: "Liquidity", A: 90, fullMark: 100 },
  { subject: "Operational", A: 45, fullMark: 100 },
  { subject: "Compliance", A: 75, fullMark: 100 },
  { subject: "Systemic", A: 55, fullMark: 100 }
];

// ===== CUSTOM TOOLTIP =====
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-2xl">
        <p className="text-gray-400 text-xs">{label}</p>
        <p className="text-white font-bold">₹{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

// ===== INTERFACE =====
interface ReportViewerProps {
  userId?: string;
  reportType?: string;
  onExport?: (format: 'pdf' | 'excel') => void;
}

// ===== MAIN COMPONENT =====
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

  // ===== HELPER FUNCTIONS =====
  const getTopCategory = (categories: Record<string, number>): string => {
    const entries = Object.entries(categories);
    if (entries.length === 0) return 'No categories';
    return entries.sort((a, b) => b[1] - a[1])[0][0];
  };

  // ===== LOAD REPORT =====
  const loadReport = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      if (!isSupabaseConfigured || !supabase) {
        setError('Supabase is not configured. Please check your environment variables.');
        setLoading(false);
        return;
      }

      let userIdToUse = userId;
      
      if (userId === 'demo-user') {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            userIdToUse = user.id;
          } else {
            setError('Please login to view your financial report');
            setLoading(false);
            return;
          }
        } catch (authError) {
          console.error('Auth error:', authError);
          setError('Authentication failed. Please login again.');
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

  const generateSummary = (data: ReportData, type: string): string => {
    const savingsRate = calculateSavingsRate(data);
    const topCategory = getTopCategory(data.expenses.byCategory);
    const currentMonth = data.expenses.monthlyTrend[data.expenses.monthlyTrend.length - 1];
    const previousMonth = data.expenses.monthlyTrend[data.expenses.monthlyTrend.length - 2] || data.expenses.monthlyTrend[0];
    const isSpendingLess = currentMonth?.amount < previousMonth?.amount;
    
    if (type === 'expense') {
      return `Financial Health Score: ${data.healthScore}/100 • You spent ₹${data.expenses.total.toLocaleString()} this month • Savings rate: ${savingsRate}% • ${isSpendingLess ? 'You spent less than last month!' : 'Your spending increased compared to last month'} • Top category: ${topCategory} (${Math.round((data.expenses.byCategory[topCategory] / data.expenses.total) * 100)}%)`;
    }
    
    return '';
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
      case 'monthly':
        // Monthly Report - Reality Check
        const CATEGORY_BENCHMARKS: Record<string, { max: number; suggestion: string; severity: 'low' | 'medium' | 'high' }> = {
          'Food & Dining': { max: 8000, suggestion: 'Consider meal prepping and cooking at home. This could save you ₹{savings} per month.', severity: 'high' },
          'Transportation': { max: 5000, suggestion: 'Consider carpooling, using public transport, or walking for short distances.', severity: 'medium' },
          'Shopping': { max: 6000, suggestion: 'Try the 24-hour rule before making a purchase. Wait a day and ask if you really need it.', severity: 'medium' },
          'Entertainment': { max: 4000, suggestion: 'Look for free or low-cost entertainment options like local parks, library events, or streaming bundles.', severity: 'medium' },
          'Bills & Utilities': { max: 8000, suggestion: 'Check if you can reduce usage or switch to more efficient appliances.', severity: 'low' },
          'Groceries': { max: 10000, suggestion: 'Plan your meals weekly, make a shopping list, and avoid buying on impulse.', severity: 'medium' },
          'Healthcare': { max: 5000, suggestion: 'Consider a health insurance plan or medical loan for large expenses.', severity: 'low' },
          'Education': { max: 15000, suggestion: 'Education is an investment! Consider scholarships, education loans, or EMI options.', severity: 'low' },
          'Insurance': { max: 10000, suggestion: 'Review your coverage to make sure you\'re getting the best value.', severity: 'low' },
          'Other': { max: 3000, suggestion: 'Review your miscellaneous expenses. Small amounts add up to big savings!', severity: 'low' }
        };

        const realityCheck = Object.entries(data.expenses.byCategory)
          .map(([category, amount]) => {
            const benchmark = CATEGORY_BENCHMARKS[category] || CATEGORY_BENCHMARKS['Other'];
            const isOver = amount > benchmark.max;
            const savings = Math.round(amount - benchmark.max);
            return {
              category,
              amount,
              benchmark: benchmark.max,
              isOver,
              savings: savings > 0 ? savings : 0,
              suggestion: isOver ? benchmark.suggestion.replace('{savings}', savings.toLocaleString()) : null,
              severity: isOver ? benchmark.severity : 'low'
            };
          })
          .sort((a, b) => b.savings - a.savings);

        const overSpending = realityCheck.filter(item => item.isOver);
        const onTrack = realityCheck.filter(item => !item.isOver);

        sections.push({
          heading: '💡 Spending Reality Check',
          content: '',
          type: overSpending.length > 0 ? 'warning' : 'achievement',
          customComponent: (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-sm">Total Spent</p>
                  <p className="text-white text-2xl font-bold">₹{data.expenses.total.toLocaleString()}</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-sm">Categories Over Budget</p>
                  <p className={`text-2xl font-bold ${overSpending.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {overSpending.length}
                  </p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-sm">Potential Savings</p>
                  <p className={`text-2xl font-bold ${overSpending.length > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {overSpending.length > 0 ? `₹${overSpending.reduce((sum, item) => sum + item.savings, 0).toLocaleString()}` : '✅ On Track'}
                  </p>
                </div>
              </div>
              {overSpending.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-red-400 font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Categories Needing Attention
                  </h4>
                  {overSpending.map((item, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      item.severity === 'high' ? 'bg-red-900/20 border-red-800/30' :
                      item.severity === 'medium' ? 'bg-yellow-900/20 border-yellow-800/30' :
                      'bg-blue-900/20 border-blue-800/30'
                    }`}>
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">{item.category}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              item.severity === 'high' ? 'bg-red-900/50 text-red-400' :
                              item.severity === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                              'bg-blue-900/50 text-blue-400'
                            }`}>
                              {item.severity === 'high' ? 'High Priority' :
                               item.severity === 'medium' ? 'Medium Priority' : 'Review'}
                            </span>
                          </div>
                          <div className="flex gap-4 mt-1 text-sm">
                            <span className="text-gray-400">Spent: ₹{item.amount.toLocaleString()}</span>
                            <span className="text-gray-400">Budget: ₹{item.benchmark.toLocaleString()}</span>
                            <span className="text-red-400 font-semibold">Over: ₹{item.savings.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="w-full md:w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${item.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`}
                            style={{ width: `${Math.min((item.amount / item.benchmark) * 100, 100)}%` }} />
                        </div>
                      </div>
                      <div className="mt-2 p-2 bg-gray-800/50 rounded-lg">
                        <p className="text-sm text-gray-300">💡 {item.suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {overSpending.length === 0 && (
                <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30 text-center">
                  <h4 className="text-green-400 font-semibold mb-2">🌟 Excellent Financial Management!</h4>
                  <p className="text-sm text-gray-300">You're staying within budget across all categories. Keep up the great work!</p>
                </div>
              )}
            </div>
          )
        });
        break;

      case 'investment':
        // ===== PORTFOLIO REPORT =====
        const holdings = data.investments.holdings;
        const totalValue = data.investments.totalValue;
        const winners = holdings.filter(h => h.change >= 0);
        const losers = holdings.filter(h => h.change < 0);
        const avgReturn = holdings.length > 0 ? holdings.reduce((sum, h) => sum + h.change, 0) / holdings.length : 0;
        const bestPerformer = winners.length > 0 ? winners.reduce((a, b) => a.change > b.change ? a : b) : null;
        const worstPerformer = losers.length > 0 ? losers.reduce((a, b) => a.change < b.change ? a : b) : null;
        const sectorData = Object.entries(data.investments.sectorAllocation).map(([name, value]) => ({ sector: name, value }));

        sections.push({
          heading: '📊 Portfolio Overview',
          content: '',
          type: avgReturn >= 0 ? 'achievement' : 'warning',
          customComponent: (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-sm">Total Value</p>
                  <p className="text-white text-2xl font-bold">₹{totalValue.toLocaleString()}</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-sm">Avg Return</p>
                  <p className={`text-2xl font-bold ${avgReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {avgReturn >= 0 ? '+' : ''}{avgReturn.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-sm">Winners</p>
                  <p className="text-green-400 text-2xl font-bold">{winners.length}</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-sm">Losers</p>
                  <p className="text-red-400 text-2xl font-bold">{losers.length}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bestPerformer && (
                  <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-4">
                    <p className="text-green-400 text-sm font-semibold">🏆 Best Performer</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-white font-bold">{bestPerformer.symbol}</span>
                      <span className="text-green-400 font-bold">+{bestPerformer.change}%</span>
                    </div>
                    <p className="text-gray-400 text-sm">Value: ₹{bestPerformer.value.toLocaleString()}</p>
                  </div>
                )}
                {worstPerformer && (
                  <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4">
                    <p className="text-red-400 text-sm font-semibold">📉 Worst Performer</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-white font-bold">{worstPerformer.symbol}</span>
                      <span className="text-red-400 font-bold">{worstPerformer.change}%</span>
                    </div>
                    <p className="text-gray-400 text-sm">Value: ₹{worstPerformer.value.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          )
        });

        sections.push({
          heading: '📈 Stock Performance',
          content: 'Individual stock performance and recommendations',
          type: 'insight',
          customComponent: (
            <div className="space-y-3 mt-2">
              {holdings.map((holding: any, index: number) => {
                const isPositive = holding.change >= 0;
                const isHighRisk = holding.change < -5;
                const isOutperforming = holding.change > 5;
                let action = 'Hold';
                let actionColor = 'text-yellow-400';
                let recommendation = '';
                
                if (isOutperforming) {
                  action = 'Hold/Sell Partial';
                  actionColor = 'text-green-400';
                  recommendation = 'Strong performer. Consider taking profits.';
                } else if (isHighRisk) {
                  action = 'Sell/Reduce';
                  actionColor = 'text-red-400';
                  recommendation = 'Underperforming. Consider selling.';
                } else if (isPositive) {
                  action = 'Hold';
                  actionColor = 'text-blue-400';
                  recommendation = 'Steady growth. Good to hold.';
                } else {
                  action = 'Monitor';
                  actionColor = 'text-yellow-400';
                  recommendation = 'Monitor closely.';
                }

                return (
                  <div key={index} className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-white font-bold text-lg">{holding.symbol}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isPositive ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                            {isPositive ? '+' : ''}{holding.change}%
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">{holding.shares} shares • ₹{holding.value.toLocaleString()}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <span className={`text-sm font-semibold ${actionColor}`}>{action}</span>
                        <p className="text-sm text-gray-300 mt-1">{recommendation}</p>
                      </div>
                    </div>
                    <div className="mt-3 w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${isPositive ? 'bg-green-400' : 'bg-red-400'}`}
                        style={{ width: `${Math.min(Math.abs(holding.change) * 3, 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )
        });

        sections.push({
          heading: '📊 Sector Allocation & Risk Analysis',
          content: '',
          type: 'insight',
          customComponent: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <p className="text-gray-400 text-sm mb-3">Sector Exposure</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={sectorData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="sector" type="category" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} width={70} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <p className="text-gray-400 text-sm mb-3">Risk Vector</p>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RISK_DATA}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 9 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Risk Score" dataKey="A" stroke="#3B82F6" strokeWidth={2} fill="#3B82F6" fillOpacity={0.25} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )
        });
        break;

      case 'expense':
        // ===== EXPENSE ANALYSIS - DETAILED WRITTEN REPORT =====
        const isSpendingLess = currentMonth?.amount < previousMonth?.amount;
        const savingsDifference = previousMonth?.amount 
          ? ((currentMonth?.amount - previousMonth?.amount) / previousMonth?.amount * 100) 
          : 0;
        const isSavingMore = savingsDifference < 0;
        const goalsOnTrack = data.goals.filter(g => g.progress > 50).length;
        const totalGoals = data.goals.length || 1;
        const goalProgress = Math.round((goalsOnTrack / totalGoals) * 100);
        const nextGoal = data.goals.filter(g => g.progress < 100).sort((a, b) => (b.progress || 0) - (a.progress || 0))[0];
        const monthlySavings = Math.max(0, (60000 - data.expenses.total));
        const monthsToGoal = nextGoal && monthlySavings > 0 
          ? Math.ceil(((nextGoal.target || 0) * (100 - (nextGoal.progress || 0)) / 100) / monthlySavings)
          : 0;
        const holdings2 = data.investments.holdings || [];
        const totalPortfolioValue = data.investments.totalValue || 0;
        const winners2 = holdings2.filter(h => h.change >= 0);
        const losers2 = holdings2.filter(h => h.change < 0);
        const avgReturn2 = holdings2.length > 0 ? holdings2.reduce((sum, h) => sum + (h.change || 0), 0) / holdings2.length : 0;
        const bestPerformer2 = winners2.length > 0 ? winners2.reduce((a, b) => (a.change || 0) > (b.change || 0) ? a : b) : null;
        const worstPerformer2 = losers2.length > 0 ? losers2.reduce((a, b) => (a.change || 0) < (b.change || 0) ? a : b) : null;

        sections.push({
          heading: '📊 Expenses This Month',
          content: '',
          type: 'insight',
          customComponent: (
            <div className="space-y-4 mt-2">
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <p className="text-gray-400 text-sm mb-2">Total Spending</p>
                <p className="text-white text-3xl font-bold">₹{data.expenses.total.toLocaleString()}</p>
                <p className="text-gray-400 text-sm mt-1">Spent across {Object.keys(data.expenses.byCategory).length} categories this month</p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <p className="text-gray-400 text-sm mb-3">Category Breakdown</p>
                <div className="space-y-2">
                  {Object.entries(data.expenses.byCategory).sort((a, b) => b[1] - a[1]).map(([category, amount], index) => {
                    const percentage = data.expenses.total > 0 ? Math.round((amount / data.expenses.total) * 100) : 0;
                    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
                    return (
                      <div key={category} className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm w-8">{index + 1}.</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300">{category}</span>
                            <span className="text-gray-400">₹{amount.toLocaleString()} ({percentage}%)</span>
                          </div>
                          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mt-0.5">
                            <div className="h-full rounded-full transition-all" style={{ width: `${percentage}%`, backgroundColor: colors[index % colors.length] }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  <strong className="text-white">{topCategory}</strong> is your highest expense category at <strong className="text-white">₹{data.expenses.byCategory[topCategory]?.toLocaleString() || 0}</strong>, 
                  representing <strong className="text-white">{Math.round((data.expenses.byCategory[topCategory] / data.expenses.total) * 100)}%</strong> of your total spending.
                </p>
              </div>
              {data.expenses.recurringPayments.length > 0 && (
                <div className="bg-purple-900/20 border border-purple-800/30 rounded-lg p-4">
                  <p className="text-purple-300 text-sm">
                    You have <strong className="text-white">{data.expenses.recurringPayments.length}</strong> recurring payments totaling 
                    <strong className="text-white"> ₹{data.expenses.recurringPayments.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}</strong> per month.
                    {data.expenses.recurringPayments.length > 3 && ' Consider reviewing these subscriptions for potential savings.'}
                  </p>
                </div>
              )}
            </div>
          )
        });

        sections.push({
          heading: '📈 Monthly Comparison & Goals Progress',
          content: '',
          type: isSavingMore ? 'achievement' : 'warning',
          customComponent: (
            <div className="space-y-4 mt-2">
              <div className={`p-4 rounded-lg border ${isSavingMore ? 'border-green-800/30 bg-green-900/20' : 'border-yellow-800/30 bg-yellow-900/20'}`}>
                <p className="text-gray-400 text-sm">Comparison vs Last Month</p>
                <div className="flex items-center gap-4 mt-2">
                  <div>
                    <p className="text-gray-500 text-xs">This Month</p>
                    <p className="text-white text-xl font-bold">₹{currentMonth?.amount.toLocaleString() || 0}</p>
                  </div>
                  <div className="text-gray-500">→</div>
                  <div>
                    <p className="text-gray-500 text-xs">Last Month</p>
                    <p className="text-white text-xl font-bold">₹{previousMonth?.amount.toLocaleString() || 0}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${isSavingMore ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                    {isSavingMore ? `↓ ${Math.abs(savingsDifference).toFixed(1)}%` : `↑ ${Math.abs(savingsDifference).toFixed(1)}%`}
                  </div>
                </div>
                <p className="text-gray-300 text-sm mt-3">
                  {isSavingMore 
                    ? `🎉 Great job! You spent ₹${(previousMonth?.amount - currentMonth?.amount).toLocaleString()} less than last month. This is a ${Math.abs(savingsDifference).toFixed(1)}% reduction in your spending!`
                    : `📊 You spent ₹${(currentMonth?.amount - previousMonth?.amount).toLocaleString()} more than last month (${Math.abs(savingsDifference).toFixed(1)}% increase). Review your expenses to identify areas for optimization.`}
                </p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <p className="text-gray-400 text-sm">Savings Rate</p>
                <p className={`text-2xl font-bold ${savingsRate >= 20 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {savingsRate}%
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {savingsRate >= 20 ? '✅ You\'re saving above the recommended 20% target!' : 
                   savingsRate >= 15 ? '💪 You\'re close to the 20% target. Keep going!' : 
                   '📈 Try to increase your savings rate to 20%.'}
                </p>
              </div>
              <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  You have <strong className="text-white">{goalsOnTrack}</strong> out of <strong className="text-white">{totalGoals}</strong> goals on track ({goalProgress}%).
                </p>
                {nextGoal && (
                  <p className="text-blue-300 text-sm mt-2">
                    Your next goal is <strong className="text-white">{nextGoal.name}</strong> ({nextGoal.progress || 0}% complete). 
                    At your current savings rate, you will reach this goal in approximately <strong className="text-white">{monthsToGoal} months</strong>.
                    {monthsToGoal > 12 && ' Consider increasing your savings to reach it faster.'}
                  </p>
                )}
                {data.goals.length === 0 && (
                  <p className="text-blue-300 text-sm mt-2">
                    You haven't set any goals yet. <button onClick={() => setShowGoalTracker(true)} className="text-blue-400 hover:text-blue-300 underline">Click here to create your first goal!</button>
                  </p>
                )}
              </div>
              {data.expenses.recurringPayments.length > 0 && (
                <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-lg p-4">
                  <p className="text-yellow-300 text-sm">
                    💡 You have <strong className="text-white">{data.expenses.recurringPayments.length}</strong> recurring payments. 
                    Reviewing and optimizing these could save you <strong className="text-white"> ₹{Math.round(data.expenses.recurringPayments.reduce((sum, r) => sum + r.amount, 0) * 0.15).toLocaleString()}</strong> per month.
                  </p>
                </div>
              )}
            </div>
          )
        });

        sections.push({
          heading: '📊 Stocks & Investments',
          content: '',
          type: avgReturn2 >= 0 ? 'achievement' : 'warning',
          customComponent: (
            <div className="space-y-4 mt-2">
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <p className="text-gray-400 text-sm">Portfolio Value</p>
                <p className="text-white text-2xl font-bold">₹{totalPortfolioValue.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <p className="text-gray-400 text-sm mb-2">Performance Overview</p>
                {holdings2.length > 0 ? (
                  <>
                    <p className="text-gray-300 text-sm">
                      You have <strong className="text-white">{holdings2.length}</strong> holdings with an average return of 
                      <span className={avgReturn2 >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {' '}{avgReturn2 >= 0 ? '+' : ''}{avgReturn2.toFixed(1)}%
                      </span>.
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="bg-green-900/10 p-3 rounded-lg border border-green-800/30">
                        <p className="text-green-400 text-xs">Winners</p>
                        <p className="text-white font-bold">{winners2.length}</p>
                      </div>
                      <div className="bg-red-900/10 p-3 rounded-lg border border-red-800/30">
                        <p className="text-red-400 text-xs">Losers</p>
                        <p className="text-white font-bold">{losers2.length}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-400 text-sm">No investment data available. Start investing to grow your wealth!</p>
                )}
              </div>
              {holdings2.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bestPerformer2 && (
                    <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-4">
                      <p className="text-green-400 text-sm font-semibold">🏆 Best Performer</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-white font-bold">{bestPerformer2.symbol}</span>
                        <span className="text-green-400 font-bold">+{bestPerformer2.change}%</span>
                      </div>
                      <p className="text-gray-400 text-sm">Value: ₹{bestPerformer2.value.toLocaleString()}</p>
                      <p className="text-green-300 text-xs mt-1">This stock is outperforming expectations.</p>
                    </div>
                  )}
                  {worstPerformer2 && (
                    <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4">
                      <p className="text-red-400 text-sm font-semibold">📉 Worst Performer</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-white font-bold">{worstPerformer2.symbol}</span>
                        <span className="text-red-400 font-bold">{worstPerformer2.change}%</span>
                      </div>
                      <p className="text-gray-400 text-sm">Value: ₹{worstPerformer2.value.toLocaleString()}</p>
                      <p className="text-yellow-300 text-xs mt-1">⚠️ Consider reviewing this stock's performance.</p>
                    </div>
                  )}
                </div>
              )}
              {Object.keys(data.investments.sectorAllocation).length > 0 && (
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-sm mb-2">Sector Allocation</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(data.investments.sectorAllocation).sort((a, b) => b[1] - a[1]).map(([sector, percentage]) => (
                      <span key={sector} className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ background: `${COLORS[Object.keys(data.investments.sectorAllocation).indexOf(sector) % COLORS.length]}22`,
                          color: COLORS[Object.keys(data.investments.sectorAllocation).indexOf(sector) % COLORS.length],
                          border: `1px solid ${COLORS[Object.keys(data.investments.sectorAllocation).indexOf(sector) % COLORS.length]}44` }}>
                        {sector}: {percentage}%
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        });

        sections.push({
          heading: '📋 Monthly Summary',
          content: '',
          type: 'insight',
          customComponent: (
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl border border-blue-800/30 p-6 mt-2">
              <div className="space-y-3">
                <p className="text-gray-300 text-sm leading-relaxed">
                  <span className="text-blue-400 font-semibold">📌 This Month's Overview:</span>
                  {' '}You spent <strong className="text-white">₹{data.expenses.total.toLocaleString()}</strong> this month, 
                  {isSavingMore ? ` which is ${Math.abs(savingsDifference).toFixed(1)}% less than last month. ` :
                   ` which is ${Math.abs(savingsDifference).toFixed(1)}% more than last month. `}
                  Your savings rate is <strong className="text-white">{savingsRate}%</strong>.
                </p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  <span className="text-green-400 font-semibold">🎯 Goal Progress:</span>
                  {' '}{goalsOnTrack} out of {totalGoals} goals are on track.
                  {nextGoal && ` Your next milestone is ${nextGoal.name} (${nextGoal.progress || 0}% complete).`}
                </p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  <span className="text-purple-400 font-semibold">📈 Investment Status:</span>
                  {' '}{holdings2.length > 0 
                    ? `Your portfolio of ₹{totalPortfolioValue.toLocaleString()} has ${winners2.length} winners and ${losers2.length} losers, with an average return of ${avgReturn2 >= 0 ? '+' : ''}${avgReturn2.toFixed(1)}%.`
                    : 'No investments tracked yet.'
                  }
                </p>
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <p className="text-gray-400 text-sm italic">
                    💡 {isSavingMore 
                      ? 'You\'re on the right track! Continue this positive momentum by maintaining your spending discipline.'
                      : 'Focus on reducing non-essential expenses to improve your savings rate and reach your goals faster.'}
                  </p>
                </div>
              </div>
            </div>
          )
        });
        break;

      case 'health':
        // ===== FINANCIAL WELLNESS =====
        const healthScore = data.healthScore || 0;
        const monthlyExpenses = data.expenses.total || 0;
        const emergencyFund = data.goals.find(g => g.name === 'Emergency Fund')?.progress || 0;
        const emergencyFundMonths = monthlyExpenses > 0 ? Math.round((emergencyFund / 100) * 6) : 0;
        const monthlyIncome = 60000;
        const debtRatio = monthlyIncome > 0 ? Math.round((monthlyExpenses / monthlyIncome) * 100) : 0;
        const goalsOnTrackHealth = data.goals.filter(g => g.progress > 50).length;
        const totalGoalsHealth = data.goals.length || 1;
        const goalProgressHealth = Math.round((goalsOnTrackHealth / totalGoalsHealth) * 100);

        sections.push({
          heading: '❤️ Your Financial Wellness Score',
          content: '',
          type: healthScore >= 70 ? 'achievement' : 'warning',
          customComponent: (
            <div className="space-y-4 mt-2">
              <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative w-32 h-32 flex-shrink-0">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="56" stroke="#374151" strokeWidth="12" fill="none"/>
                      <circle cx="64" cy="64" r="56" 
                        stroke={healthScore >= 70 ? '#10B981' : healthScore >= 50 ? '#F59E0B' : '#EF4444'} 
                        strokeWidth="12" fill="none" 
                        strokeDasharray={`${(healthScore / 100) * 351.86} 351.86`}
                        strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-3xl font-bold text-white">{healthScore}</span>
                      <span className="text-xs text-gray-400">/100</span>
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold text-white">
                      {healthScore >= 80 ? '🌟 Excellent Financial Health' :
                       healthScore >= 60 ? '👍 Good Financial Health' :
                       healthScore >= 40 ? '📊 Fair Financial Health' :
                       '⚠️ Needs Attention'}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {healthScore >= 80 ? 'You\'re doing amazing! Your finances are in great shape.' :
                       healthScore >= 60 ? 'You\'re on the right track! Keep building on this foundation.' :
                       healthScore >= 40 ? 'There\'s room for improvement. Let\'s work on it together.' :
                       'Don\'t worry, we can turn this around. Start with small steps.'}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${savingsRate >= 20 ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                        Savings: {savingsRate}%
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${debtRatio < 30 ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                        Debt Ratio: {debtRatio}%
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${goalProgressHealth > 50 ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                        Goals: {goalsOnTrackHealth}/{totalGoalsHealth} On Track
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 text-center">
                  <p className="text-gray-400 text-xs">Emergency Fund</p>
                  <p className="text-white font-bold text-lg">{emergencyFund}%</p>
                  <p className="text-gray-500 text-xs">{emergencyFundMonths} months saved</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 text-center">
                  <p className="text-gray-400 text-xs">Savings Rate</p>
                  <p className={`font-bold text-lg ${savingsRate >= 20 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {savingsRate}%
                  </p>
                  <p className="text-gray-500 text-xs">{savingsRate >= 20 ? '✅ On Target' : '⬆ Needs Improvement'}</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 text-center">
                  <p className="text-gray-400 text-xs">Monthly Expenses</p>
                  <p className="text-white font-bold text-lg">₹{monthlyExpenses.toLocaleString()}</p>
                  <p className="text-gray-500 text-xs">Top: {topCategory}</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 text-center">
                  <p className="text-gray-400 text-xs">Goals Progress</p>
                  <p className="text-white font-bold text-lg">{goalProgressHealth}%</p>
                  <p className="text-gray-500 text-xs">{goalsOnTrackHealth}/{totalGoalsHealth} goals on track</p>
                </div>
              </div>
            </div>
          )
        });

        sections.push({
          heading: '🎯 Your Personalized Action Plan',
          content: '',
          type: 'insight',
          customComponent: (
            <div className="space-y-3 mt-2">
              {savingsRate < 20 && (
                <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💰</span>
                    <div>
                      <h4 className="text-blue-400 font-semibold">Boost Your Savings</h4>
                      <p className="text-sm text-gray-300 mt-1">Your savings rate is {savingsRate}%. The recommended target is 20%.</p>
                      <ul className="mt-2 space-y-1 text-sm text-gray-300">
                        <li className="flex items-start gap-2"><span className="text-blue-400">•</span>Set up auto-transfer of 5% more to savings each month</li>
                        <li className="flex items-start gap-2"><span className="text-blue-400">•</span>Review {topCategory} spending - find ₹{Math.round(monthlyExpenses * 0.05).toLocaleString()} to save</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              {debtRatio > 40 && (
                <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <h4 className="text-yellow-400 font-semibold">Manage Your Expenses</h4>
                      <p className="text-sm text-gray-300 mt-1">Your debt-to-income ratio is {debtRatio}%. Aim for below 30%.</p>
                      <ul className="mt-2 space-y-1 text-sm text-gray-300">
                        <li className="flex items-start gap-2"><span className="text-yellow-400">•</span>Create a budget using the 50/30/20 rule</li>
                        <li className="flex items-start gap-2"><span className="text-yellow-400">•</span>Track every expense for 30 days to identify leaks</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              {emergencyFund < 50 && (
                <div className="bg-purple-900/20 border border-purple-800/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🛡️</span>
                    <div>
                      <h4 className="text-purple-400 font-semibold">Build Emergency Fund</h4>
                      <p className="text-sm text-gray-300 mt-1">Your emergency fund is {emergencyFund}% of the 6-month target.</p>
                      <ul className="mt-2 space-y-1 text-sm text-gray-300">
                        <li className="flex items-start gap-2"><span className="text-purple-400">•</span>Save ₹{Math.round(monthlyExpenses * 0.1).toLocaleString()} monthly for emergency fund</li>
                        <li className="flex items-start gap-2"><span className="text-purple-400">•</span>Keep in a separate high-yield savings account</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              {goalProgressHealth < 50 && (
                <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <h4 className="text-green-400 font-semibold">Accelerate Your Goals</h4>
                      <p className="text-sm text-gray-300 mt-1">{goalsOnTrackHealth}/{totalGoalsHealth} goals are on track. Let's get them all!</p>
                      <ul className="mt-2 space-y-1 text-sm text-gray-300">
                        <li className="flex items-start gap-2"><span className="text-green-400">•</span>Break big goals into smaller milestones</li>
                        <li className="flex items-start gap-2"><span className="text-green-400">•</span>Set up automatic transfers toward each goal</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        });

        sections.push({
          heading: '✅ Financial Health Checklist',
          content: '',
          type: 'insight',
          customComponent: (
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 mt-2">
              <div className="space-y-3">
                {[
                  { label: 'Emergency Fund (3-6 months of expenses)', status: emergencyFund >= 60 ? '✅' : '⬜', tip: emergencyFund < 60 ? 'Aim to save 3-6 months of expenses' : 'Great job! You\'re well protected.' },
                  { label: 'Savings Rate (20% of income)', status: savingsRate >= 20 ? '✅' : '⬜', tip: savingsRate < 20 ? 'Try saving 20% of your income' : 'Excellent savings habit!' },
                  { label: 'Debt-to-Income Ratio (under 30%)', status: debtRatio < 30 ? '✅' : '⬜', tip: debtRatio >= 30 ? 'Reduce debt or increase income' : 'Healthy debt level!' },
                  { label: 'Investing for Future', status: data.investments.totalValue > 0 ? '✅' : '⬜', tip: data.investments.totalValue === 0 ? 'Start investing even with small amounts' : 'Building wealth for the future!' },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 border-b border-gray-700/50 pb-2 last:border-0 last:pb-0">
                    <span className="text-2xl">{item.status}</span>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{item.label}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{item.tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        });

        sections.push({
          heading: '💪 Your Financial Journey',
          content: '',
          type: 'achievement',
          customComponent: (
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl border border-blue-800/30 p-6 mt-2 text-center">
              <p className="text-blue-300 text-sm">
                {healthScore >= 80 ? '🌟 You\'re a financial rockstar! Keep inspiring others with your discipline.' :
                 healthScore >= 60 ? '🚀 You\'re on the right path! Every small step counts towards your financial freedom.' :
                 healthScore >= 40 ? '💪 You have the power to improve your financial health. Start with one goal at a time.' :
                 '🌱 Everyone starts somewhere. Today is the first day of your financial transformation!'}
              </p>
              <p className="text-gray-400 text-xs mt-3">Remember: Financial wellness is a journey, not a destination. Keep going! 💫</p>
            </div>
          )
        });
        break;

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

  // ===== EFFECTS =====
  useEffect(() => {
    loadReport();
  }, [userId, reportType]);

  useEffect(() => {
    if (!report) return;
    const timeout = setTimeout(() => {
      document.querySelectorAll('.recharts-wrapper').forEach((el: any) => {
        el.style.width = '100%';
        el.style.height = '300px';
        el.style.display = 'block';
        el.style.visibility = 'visible';
      });
    }, 500);
    return () => clearTimeout(timeout);
  }, [report]);

  useEffect(() => {
    const handleResize = () => {
      document.querySelectorAll('.recharts-wrapper').forEach((el: any) => {
        el.style.width = '100%';
        el.style.height = '300px';
        el.style.display = 'block';
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
  if (loading) return <ReportSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
        <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-6 max-w-md">
          <h3 className="text-red-400 text-lg font-semibold mb-2">Unable to Load Report</h3>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <button onClick={loadReport} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Try Again</button>
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
            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">AI Generated</span>
            <span className="px-3 py-1 bg-green-900 text-green-400 text-xs font-medium rounded-full">Live Data</span>
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
          <p className="text-gray-400 text-sm mt-1">Generated on {new Date(report.generatedAt).toLocaleString()}</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto no-print">
          <button onClick={() => setShowGoalTracker(true)} className="flex-1 md:flex-none justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
            <Target className="w-4 h-4" /> Goals
          </button>
          {reportType === 'expense' && (
            <button onClick={() => handleExport('pdf')} disabled={isExporting} className={`flex-1 md:flex-none justify-center px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${isExporting ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>
              {isExporting ? 'Exporting...' : '📄 Export PDF'}
            </button>
          )}
          <button onClick={() => handleExport('excel')} className="flex-1 md:flex-none justify-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2">
            📊 Export Excel
          </button>
        </div>
      </div>

      {/* Executive Summary - ONLY for Expense Analysis */}
      {reportType === 'expense' && report.summary && (
        <div className="mb-8 p-6 bg-gray-800/50 border border-gray-700 rounded-xl print:bg-gray-800 print:border-gray-700">
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
      )}

      {/* Report Sections */}
      <div className="space-y-6">
        {report.sections.map((section: any, index: number) => (
          <motion.div key={index} className={`p-6 rounded-xl border transition-all cursor-pointer ${activeSection === index ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-lg'} ${section.type === 'warning' ? 'border-yellow-800/30 bg-yellow-900/20' : section.type === 'achievement' ? 'border-green-800/30 bg-green-900/20' : 'border-gray-700/50 bg-gray-800/50'} print:border-gray-600 print:bg-gray-800 print:shadow-none`}
            onClick={() => setActiveSection(activeSection === index ? null : index)}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
            <h3 className={`text-xl font-semibold mb-3 ${section.type === 'warning' ? 'text-yellow-400' : section.type === 'achievement' ? 'text-green-400' : 'text-gray-200'} print:text-gray-200`}>{section.heading}</h3>
            {section.customComponent ? (
              <div className="mt-2 print:block">{section.customComponent}</div>
            ) : (
              <p className="text-gray-300 leading-relaxed whitespace-pre-line print:text-gray-300">{section.content}</p>
            )}
            {section.chartData && !section.customComponent && activeSection === index && (
              <motion.div className="mt-6 h-64 print:h-64 print:overflow-visible" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 256 }} transition={{ duration: 0.3 }}>
                <ReportCharts data={section.chartData} chartType={section.chartType || 'pie'} />
              </motion.div>
            )}
            {section.chartData && !section.customComponent && (
              <div className="mt-3 text-sm text-blue-400 print:hidden">{activeSection === index ? 'Hide chart' : 'Click to view chart'}</div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Key Takeaways - ONLY for Expense Analysis */}
      {reportType === 'expense' && report.keyTakeaways && report.keyTakeaways.length > 0 && (
        <div className="mt-8 p-6 bg-yellow-900/20 border border-yellow-800/30 rounded-xl print:bg-gray-800 print:border-gray-600">
          <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wide mb-3 print:text-yellow-400">Key Takeaways</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.keyTakeaways.map((takeaway: string, i: number) => (
              <div key={i} className="flex items-start gap-2 bg-gray-800/50 p-3 rounded-lg border border-gray-700 print:bg-gray-800 print:border-gray-600">
                <span className="text-yellow-500 mt-0.5 print:text-yellow-500">•</span>
                <span className="text-gray-300 print:text-gray-300">{takeaway}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4 print:text-gray-400">Recommended Actions</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {report.recommendations.map((rec: Recommendation, i: number) => (
            <RecommendationCard key={i} recommendation={rec} index={i} />
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="mt-8 p-6 bg-gray-800/50 border border-gray-700 rounded-xl print:bg-gray-800 print:border-gray-600">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 print:text-gray-400">Next Steps</h3>
        <div className="flex flex-wrap gap-3">
          {report.nextSteps.map((step: string, i: number) => (
            <span key={i} className="px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 hover:border-blue-500 transition-colors text-gray-300 text-sm print:bg-gray-700 print:border-gray-600 print:text-gray-300">
              {i+1}. {step}
            </span>
          ))}
        </div>
      </div>

      {/* Goal Tracker Modal */}
      {showGoalTracker && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
          <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Goal Tracker</h2>
              <button onClick={() => setShowGoalTracker(false)} className="text-gray-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <GoalTracker userId={userId} onGoalUpdate={() => { loadReport(); }} />
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
    chartData = Object.entries(data).map(([name, value]) => ({ name, value: typeof value === 'number' ? value : 0 }));
  }

  if (chartType === 'pie') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" labelLine={true}
            label={(entry: any) => {
              const total = chartData.reduce((s: number, i: any) => s + i.value, 0);
              const percentage = total > 0 ? ((entry.value / total) * 100) : 0;
              return `${entry.name} (${percentage.toFixed(0)}%)`;
            }}
            outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name">
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