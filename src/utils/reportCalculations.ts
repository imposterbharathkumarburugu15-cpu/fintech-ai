// src/utils/reportCalculations.ts

import { ReportData, InvestmentData, GeneratedReport, ReportSection } from '../types/report.types';

// src/utils/reportCalculations.ts

export function generateStructuredReport(data: ReportData): GeneratedReport {
  const topCategory = getTopCategory(data.expenses.byCategory);
  const savingsRate = calculateSavingsRate(data);
  const diversification = calculateDiversification(data.investments);
  const riskScore = calculateRiskScore(data.investments);

  return {
    title: `Financial Health Report - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
    sections: generateSections(data, topCategory, savingsRate, diversification, riskScore),
    nextSteps: generateNextSteps(data, topCategory, savingsRate, diversification),
    generatedAt: new Date().toISOString(),
    dataPeriod: `${data.expenses.monthlyTrend[0]?.month || 'N/A'} - ${data.expenses.monthlyTrend[data.expenses.monthlyTrend.length - 1]?.month || 'N/A'} 2026`,
    summary: '',  // Will be filled later
    keyTakeaways: [],  // Will be filled later
    recommendations: [],  // Will be filled later
  };
}
function getTopCategory(categories: Record<string, number>): string {
  const entries = Object.entries(categories);
  if (entries.length === 0) return 'No categories';
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

export function calculateSavingsRate(data: ReportData): number {
  const monthlyIncome = 60000;
  const lastMonthExpense = data.expenses.monthlyTrend[data.expenses.monthlyTrend.length - 1];
  if (!lastMonthExpense) return 0;
  const monthlyExpense = lastMonthExpense.amount;
  return Math.round(((monthlyIncome - monthlyExpense) / monthlyIncome) * 100);
}

export function calculateDiversification(data: InvestmentData): string {
  const sectors = Object.keys(data.sectorAllocation);
  if (sectors.length >= 5) return 'Well Diversified';
  if (sectors.length >= 3) return 'Moderately Diversified';
  return 'Concentrated Portfolio';
}

function calculateRiskScore(data: InvestmentData): number {
  const values = Object.values(data.sectorAllocation);
  if (values.length === 0) return 50;
  const maxSector = Math.max(...values);
  if (maxSector > 50) return 75;
  if (maxSector > 30) return 50;
  return 25;
}

function generateSections(
  data: ReportData, 
  topCategory: string, 
  savingsRate: number, 
  diversification: string, 
  riskScore: number
): ReportSection[] {
  const topCategoryAmount = data.expenses.byCategory[topCategory] || 0;
  const topCategoryPercent = data.expenses.total > 0 ? Math.round((topCategoryAmount / data.expenses.total) * 100) : 0;
  
  return [
    {
      heading: '📊 Spending Overview',
      content: `Your total spending for this period is ₹${data.expenses.total.toLocaleString()}. The highest spending category is **${topCategory}** at ₹${topCategoryAmount.toLocaleString()}, accounting for ${topCategoryPercent}% of your total expenses.`,
      type: 'insight',
      chartData: data.expenses.byCategory
    },
    {
      heading: '💰 Savings & Financial Health',
      content: `Your financial health score is **${data.healthScore}/100**, indicating ${data.healthScore >= 80 ? 'excellent' : data.healthScore >= 60 ? 'good' : 'needs improvement'} financial management. You're saving **${savingsRate}%** of your monthly income, which is ${savingsRate >= 20 ? 'above' : 'below'} the recommended 20% savings rate.`,
      type: data.healthScore >= 80 ? 'achievement' : 'opportunity',
    },
    {
      heading: '📈 Investment Portfolio',
      content: `Your portfolio is valued at ₹${data.investments.totalValue.toLocaleString()} and is **${diversification}**. The portfolio has returned **${data.investments.performance.month}%** this month and **${data.investments.performance.year}%** over the last year. Your highest holding is ${data.investments.holdings.length > 0 ? data.investments.holdings.sort((a, b) => b.value - a.value)[0].symbol : 'N/A'}.`,
      type: 'insight',
      chartData: data.investments.sectorAllocation
    },
    {
      heading: '⚠️ Alerts & Actions',
      content: `You have **${data.alerts.filter(a => a.severity === 'critical' || a.severity === 'warning').length}** important alerts requiring your attention. ${data.alerts.find(a => a.severity === 'critical') ? `The most critical is: "${data.alerts.find(a => a.severity === 'critical')?.message}"` : 'No critical alerts to address.'}`,
      type: data.alerts.some(a => a.severity === 'critical') ? 'warning' : 'achievement',
    },
    {
      heading: '🎯 Goal Progress',
      content: `You're making progress on your financial goals. Your Emergency Fund is at **${data.goals.find(g => g.name === 'Emergency Fund')?.progress || 0}%** of target. Keep up the momentum!`,
      type: 'achievement',
    }
  ];
}

function generateNextSteps(
  data: ReportData, 
  topCategory: string, 
  savingsRate: number, 
  diversification: string
): string[] {
  const steps: string[] = [
    `Reduce spending in ${topCategory} by 10% to balance your budget`,
    `Review ${data.expenses.recurringPayments.length} recurring subscriptions for potential cancellation`
  ];

  if (savingsRate < 20) {
    steps.push('Increase your savings rate by automating monthly transfers to a savings account');
  }

  if (diversification === 'Concentrated Portfolio') {
    steps.push('Diversify your portfolio by adding exposure to other sectors');
  }

  if (data.expenses.unusualSpending.length > 0) {
    steps.push(`Review the ${data.expenses.unusualSpending.length} unusual expenses identified this month`);
  }

  steps.push('Schedule a monthly financial review to track progress');
  
  return steps.slice(0, 5);
}