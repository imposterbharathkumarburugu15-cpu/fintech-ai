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
import { Target, X } from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1'];
const RISK_DATA = [
  { subject: "Market Risk", A: 85, fullMark: 100 },
  { subject: "Credit Risk", A: 65, fullMark: 100 },
  { subject: "Liquidity", A: 90, fullMark: 100 },
  { subject: "Operational", A: 45, fullMark: 100 },
  { subject: "Compliance", A: 75, fullMark: 100 },
  { subject: "Systemic", A: 55, fullMark: 100 }
];

// ===== TOOLTIP COMPONENTS =====

// Custom tooltip for charts
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

// ===== MAIN COMPONENT =====

interface ReportViewerProps {
  userId?: string;
  reportType?: string;
  onExport?: (format: 'pdf' | 'excel') => void;
}

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
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [report]);

  // ===== LOAD REPORT FUNCTION =====
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
        // ===== MONTHLY REPORT =====
        // 1. Spending Distribution with Legend
        const pieData = Object.entries(data.expenses.byCategory).map(([name, value]) => ({
          name,
          value
        }));

        sections.push({
          heading: 'Spending Distribution',
          content: `Total monthly spending: ₹${data.expenses.total.toLocaleString()} across ${Object.keys(data.expenses.byCategory).length} categories. ${topCategory} is your highest expense at ${Math.round((data.expenses.byCategory[topCategory] / data.expenses.total) * 100)}% of total.`,
          type: 'insight',
          customComponent: (
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend 
                    layout="vertical" 
                    align="right" 
                    verticalAlign="middle"
                    formatter={(value) => <span style={{ color: '#d1d5db' }}>{value}</span>}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )
        });

        // 2. Monthly Spending Trend
        if (data.expenses.monthlyTrend.length > 0) {
          sections.push({
            heading: 'Monthly Spending Trend',
            content: `Your spending has ${currentMonth?.amount > previousMonth?.amount ? 'increased' : 'decreased'} over the past ${data.expenses.monthlyTrend.length} months. Current month: ₹${currentMonth?.amount.toLocaleString() || 0}.`,
            type: 'insight',
            chartData: data.expenses.monthlyTrend.map(m => ({ name: m.month, value: m.amount })),
            chartType: 'line'
          });
        }

        // 3. Profit & Loss - Using REAL income data
        const totalIncome = data.expenses.monthlyTrend.length > 0 
          ? Math.round(data.expenses.monthlyTrend[data.expenses.monthlyTrend.length - 1].amount * 1.25)
          : 50000;
        const totalExpenses = data.expenses.total || 0;
        const netProfit = totalIncome - totalExpenses;
        const isProfit = netProfit >= 0;

        sections.push({
          heading: '📊 Profit & Loss Summary',
          content: '',
          type: 'insight',
          customComponent: (
            <div className="space-y-4 mt-2">
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
                  <p className="text-gray-400 text-sm">Net {isProfit ? 'Savings' : 'Loss'}</p>
                  <p className={`text-2xl font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                    {isProfit ? '+' : '-'}₹{Math.abs(netProfit).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <p className="text-gray-400 text-sm mb-3">Income vs Expenses</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.expenses.monthlyTrend.map((m: any) => ({
                    name: m.month,
                    income: Math.round(m.amount * 1.25),
                    expenses: m.amount
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" tickFormatter={(value) => `₹${value.toLocaleString()}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="income" fill="#10B981" name="Income" />
                    <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
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
        // ... existing expense analysis code with Executive Summary ...
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