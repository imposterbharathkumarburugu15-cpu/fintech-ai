
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
      // Check Supabase configuration
      if (!isSupabaseConfigured || !supabase) {
        setError('Supabase is not configured. Please check your environment variables.');
        setLoading(false);
        return;
      }

      let userIdToUse = userId;
      
      // If userId is 'demo-user', try to get the actual user
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

      // Fetch report data
      const data = await fetchReportData(userIdToUse);
      setReportData(data);
      
      // Generate structured report
      const structuredReport = generateStructuredReport(data);
      
      // Build full report
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
      const CATEGORY_BENCHMARKS: Record<string, { max: number; suggestion: string; severity: 'low' | 'medium' | 'high' }> = {
        'Food & Dining': {
          max: 8000,
          suggestion: 'Consider meal prepping and cooking at home. This could save you ₹{savings} per month.',
          severity: 'high'
        },
        'Dining': {
          max: 8000,
          suggestion: 'Consider meal prepping and cooking at home. This could save you ₹{savings} per month.',
          severity: 'high'
        },
        'Restaurants': {
          max: 8000,
          suggestion: 'Consider meal prepping and cooking at home. This could save you ₹{savings} per month.',
          severity: 'high'
        },
        'Transportation': {
          max: 5000,
          suggestion: 'Consider carpooling, using public transport, or walking for short distances.',
          severity: 'medium'
        },
        'Shopping': {
          max: 6000,
          suggestion: 'Try the 24-hour rule before making a purchase. Wait a day and ask if you really need it.',
          severity: 'medium'
        },
        'Entertainment': {
          max: 4000,
          suggestion: 'Look for free or low-cost entertainment options like local parks, library events, or streaming bundles.',
          severity: 'medium'
        },
        'Bills & Utilities': {
          max: 8000,
          suggestion: 'Check if you can reduce usage or switch to more efficient appliances. Every little bit helps!',
          severity: 'low'
        },
        'Groceries': {
          max: 10000,
          suggestion: 'Plan your meals weekly, make a shopping list, and avoid buying on impulse.',
          severity: 'medium'
        },
        'Healthcare': {
          max: 5000,
          suggestion: 'Consider a health insurance plan or medical loan for large expenses. Your health is important! 💚',
          severity: 'low'
        },
        'Medical': {
          max: 5000,
          suggestion: 'Consider a health insurance plan or medical loan for large expenses. Your health is important! 💚',
          severity: 'low'
        },
        'Education': {
          max: 15000,
          suggestion: 'Education is an investment in yourself! Consider scholarships, education loans, or EMI options.',
          severity: 'low'
        },
        'Insurance': {
          max: 10000,
          suggestion: 'Insurance is essential protection. Review your coverage to make sure you\'re getting the best value.',
          severity: 'low'
        },
        'Other': {
          max: 3000,
          suggestion: 'Review your miscellaneous expenses. Often, small amounts add up to big savings!',
          severity: 'low'
        }
      };

      // Generate Reality Check
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
            suggestion: isOver 
              ? benchmark.suggestion.replace('{savings}', savings.toLocaleString())
              : null,
            severity: isOver ? benchmark.severity : 'low'
          };
        })
        .sort((a, b) => b.savings - a.savings);

      // Separate overspending and on-track categories
      const overSpending = realityCheck.filter(item => item.isOver);
      const onTrack = realityCheck.filter(item => !item.isOver);

      sections.push({
        heading: '💡 Spending Reality Check',
        content: '',
        type: overSpending.length > 0 ? 'warning' : 'achievement',
        customComponent: (
          <div className="space-y-4 mt-2">
            {/* Summary Cards */}
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

            {/* Overspending Categories */}
            {overSpending.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-red-400 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Categories Needing Attention
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
                            item.severity === 'medium' ? 'Medium Priority' :
                            'Review'}
                          </span>
                        </div>
                        <div className="flex gap-4 mt-1 text-sm">
                          <span className="text-gray-400">Spent: ₹{item.amount.toLocaleString()}</span>
                          <span className="text-gray-400">Budget: ₹{item.benchmark.toLocaleString()}</span>
                          <span className="text-red-400 font-semibold">Over: ₹{item.savings.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="w-full md:w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${item.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`}
                          style={{ width: `${Math.min((item.amount / item.benchmark) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Suggestion with emoji based on category */}
                    <div className="mt-2 p-2 bg-gray-800/50 rounded-lg">
                      <p className="text-sm text-gray-300">
                        💡 {item.suggestion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* On Track Categories */}
            {onTrack.length > 0 && (
              <div className="mt-4">
                <h4 className="text-green-400 font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Categories On Track
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {onTrack.slice(0, 6).map((item, index) => (
                    <div key={index} className="bg-green-900/10 border border-green-800/30 rounded-lg p-2 text-center">
                      <p className="text-gray-300 text-sm">{item.category}</p>
                      <p className="text-green-400 font-semibold">₹{item.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Budget: ₹{item.benchmark.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Health/Education Special Message */}
            {overSpending.some(item => 
              item.category.toLowerCase().includes('health') || 
              item.category.toLowerCase().includes('medical') ||
              item.category.toLowerCase().includes('education')
            ) && (
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h4 className="text-blue-400 font-semibold mb-2">📚 Health & Education Expenses</h4>
                <p className="text-sm text-gray-300">
                  We noticed spending on health or education. These are important investments in yourself!
                  Consider exploring:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>Health insurance plans for medical expenses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>Education loans with low interest rates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>EMI options for large medical or education bills</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Saving Tips */}
            {overSpending.length > 0 && (
              <div className="p-4 rounded-lg bg-yellow-900/20 border border-yellow-800/30">
                <h4 className="text-yellow-400 font-semibold mb-2">💰 Quick Saving Tips</h4>
                <ul className="space-y-1.5 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    <span>Track every expense for 30 days to build awareness</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    <span>Set up automatic savings transfer on payday</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    <span>Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings</span>
                  </li>
                </ul>
              </div>
            )}

            {/* If everything is on track */}
            {overSpending.length === 0 && (
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30 text-center">
                <h4 className="text-green-400 font-semibold mb-2">🌟 Excellent Financial Management!</h4>
                <p className="text-sm text-gray-300">
                  You're staying within budget across all categories. Keep up the great work!
                  Your disciplined approach is building a strong financial foundation.
                </p>
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

        const sectorData = Object.entries(data.investments.sectorAllocation).map(([name, value]) => ({
          sector: name,
          value
        }));

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
                
                let recommendation = '';
                let action = 'Hold';
                let actionColor = 'text-yellow-400';
                
                if (isOutperforming) {
                  recommendation = 'Strong performer. Consider taking profits.';
                  action = 'Hold/Sell Partial';
                  actionColor = 'text-green-400';
                } else if (isHighRisk) {
                  recommendation = 'Underperforming. Consider selling.';
                  action = 'Sell/Reduce';
                  actionColor = 'text-red-400';
                } else if (isPositive) {
                  recommendation = 'Steady growth. Good to hold.';
                  action = 'Hold';
                  actionColor = 'text-blue-400';
                } else {
                  recommendation = 'Monitor closely.';
                  action = 'Monitor';
                  actionColor = 'text-yellow-400';
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
                        <span className={`text-sm font-semibold ${actionColor}`}>
                          {action}
                        </span>
                        <p className="text-sm text-gray-300 mt-1">{recommendation}</p>
                      </div>
                    </div>
                    <div className="mt-3 w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isPositive ? 'bg-green-400' : 'bg-red-400'}`}
                        style={{ width: `${Math.min(Math.abs(holding.change) * 3, 100)}%` }}
                      />
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
        // ===== EXPENSE ANALYSIS =====
        const savingsDifference = previousMonth?.amount 
          ? ((currentMonth?.amount - previousMonth?.amount) / previousMonth?.amount * 100) 
          : 0;
        const isSavingMore = savingsDifference < 0;

        // 1. Monthly Savings Analysis
        sections.push({
          heading: 'Monthly Savings Analysis',
          content: '',
          type: isSavingMore ? 'achievement' : 'warning',
          customComponent: (
            <div className="space-y-4 mt-2">
              <div className={`p-4 rounded-lg border ${isSavingMore ? 'border-green-800/30 bg-green-900/20' : 'border-yellow-800/30 bg-yellow-900/20'}`}>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">This Month</p>
                    <p className="text-white text-2xl font-bold">₹{currentMonth?.amount.toLocaleString() || 0}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-gray-400 text-sm">vs Last Month</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isSavingMore ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                        {isSavingMore ? `↓ ${Math.abs(savingsDifference).toFixed(1)}%` : `↑ ${Math.abs(savingsDifference).toFixed(1)}%`}
                      </span>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-gray-400 text-sm">What This Means</p>
                    <p className="text-gray-300 text-sm mt-1">
                      {isSavingMore 
                        ? `🎉 You spent ₹${(previousMonth?.amount - currentMonth?.amount).toLocaleString()} less than last month! That's ₹${Math.round((previousMonth?.amount - currentMonth?.amount) / 30).toLocaleString()} per day saved.`
                        : `💰 You spent ₹${(currentMonth?.amount - previousMonth?.amount).toLocaleString()} more than last month. That's about ₹${Math.round((currentMonth?.amount - previousMonth?.amount) / 30).toLocaleString()} extra per day.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Savings Rate */}
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
                        ? "🌟 Excellent! You're saving above the recommended 20% target." 
                        : savingsRate >= 15
                        ? "💪 Good progress! You're close to the 20% target."
                        : savingsRate >= 10
                        ? "📈 You're on your way. Try to increase your savings rate."
                        : "🌱 Let's work on building your savings. Every little bit helps!"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        });

        // 2. Top Spending Insights
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

              {/* Smart insight about top category */}
              {data.expenses.byCategory[topCategory] > data.expenses.total * 0.3 && (
                <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4">
                  <p className="text-blue-300 text-sm">
                    💡 <strong>{topCategory}</strong> makes up <strong>{Math.round((data.expenses.byCategory[topCategory] / data.expenses.total) * 100)}%</strong> of your total spending. 
                    {topCategory === 'Food & Dining' && " Consider meal prepping or cooking at home more often to save money."}
                    {topCategory === 'Shopping' && " Try waiting 24 hours before making a purchase to avoid impulse buys."}
                    {topCategory === 'Transportation' && " Consider carpooling or using public transport occasionally."}
                    {topCategory === 'Entertainment' && " Look for free or low-cost entertainment options in your area."}
                  </p>
                </div>
              )}
            </div>
          )
        });

        // 3. Unusual Spending
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
                        💡 This is {Math.round(transaction.amount / (data.expenses.total / Math.max(data.expenses.unusualSpending.length, 1)))}x higher than your typical spending. 
                        {transaction.amount > 10000 && " Consider if this was a planned purchase or an impulse buy."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )
          });
        }

        // 4. Friendly Suggestions
        sections.push({
          heading: 'Friendly Suggestions',
          content: '',
          type: 'insight',
          customComponent: (
            <div className="space-y-3 mt-2">
              {savingsRate < 20 && (
                <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4">
                  <h4 className="text-blue-400 font-semibold mb-2">🌱 Grow Your Savings</h4>
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
                  <h4 className="text-purple-400 font-semibold mb-2">📋 Subscription Check</h4>
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
                  <p className="text-xs text-gray-400 mt-2">
                    💡 Consider reviewing these subscriptions. Even saving ₹500/month adds up to ₹6,000/year!
                  </p>
                </div>
              )}

              <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-4">
                <h4 className="text-green-400 font-semibold mb-2">🌟 Small Habits, Big Results</h4>
                <ul className="space-y-1.5 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Track your daily spending - awareness is the first step to saving</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Try the 30-day rule: wait 30 days before making any purchase above ₹5,000</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Celebrate small wins - every ₹100 saved is a step toward your goals!</span>
                  </li>
                </ul>
              </div>

              {savingsRate >= 20 && data.expenses.unusualSpending.length === 0 && data.expenses.recurringPayments.length === 0 && (
                <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-4 text-center">
                  <h4 className="text-green-400 font-semibold mb-2">🌟 You're Doing Amazing!</h4>
                  <p className="text-sm text-gray-300">
                    You're saving {savingsRate}% of your income, no unusual spending detected, and you're managing your subscriptions well. 
                    Keep up the great work! 🎉
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    💡 Next step: Consider investing your savings to grow your wealth.
                  </p>
                </div>
              )}
            </div>
          )
        });
  break;
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

      {/* Executive Summary - ONLY for Expense Analysis */}
      {reportType === 'expense' && report.summary && (
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
      )}

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

      {/* Key Takeaways - ONLY for Expense Analysis */}
      {reportType === 'expense' && report.keyTakeaways && report.keyTakeaways.length > 0 && (
        <div className="mt-8 p-6 bg-yellow-900/20 border border-yellow-800/30 rounded-xl">
          <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wide mb-3">Key Takeaways</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.keyTakeaways.map((takeaway: string, i: number) => (
              <div 
                key={i}
                className="flex items-start gap-2 bg-gray-800/50 p-3 rounded-lg border border-gray-700"
              >
                <span className="text-yellow-500 mt-0.5">•</span>
                <span className="text-gray-300">{takeaway}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Goal Tracker Modal */}
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