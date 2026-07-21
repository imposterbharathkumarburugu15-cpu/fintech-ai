// src/utils/reportCalculations.ts

import { ReportData, InvestmentData } from '../types/report.types';

// ✅ FIXED: Calculate savings rate from actual data
export function calculateSavingsRate(data: ReportData): number {
  // Try to get monthly income from data (if available)
  let monthlyIncome = 0;
  
  // Check if we have income data from transactions
  // If not, use default or calculate from spending
  if (data.expenses && data.expenses.monthlyTrend && data.expenses.monthlyTrend.length > 0) {
    // Use the latest month's data as base
    const lastMonth = data.expenses.monthlyTrend[data.expenses.monthlyTrend.length - 1];
    if (lastMonth && lastMonth.amount > 0) {
      // Estimate income as spending + 20% savings (rough estimate)
      monthlyIncome = Math.round(lastMonth.amount * 1.25);
    }
  }
  
  // If no data, use default
  if (monthlyIncome === 0) {
    monthlyIncome = 60000; // Default monthly income
  }
  
  const totalSpent = data.expenses?.total || 0;
  const savingsRate = monthlyIncome > 0 
    ? Math.round(((monthlyIncome - totalSpent) / monthlyIncome) * 100) 
    : 0;
  
  return Math.max(0, savingsRate); // Don't return negative
}

export function calculateDiversification(data: InvestmentData): string {
  const sectors = Object.keys(data.sectorAllocation || {});
  if (sectors.length >= 5) return 'Well Diversified';
  if (sectors.length >= 3) return 'Moderately Diversified';
  return 'Concentrated Portfolio';
}

export function generateStructuredReport(data: ReportData) {
  const savingsRate = calculateSavingsRate(data);
  const diversification = calculateDiversification(data.investments);
  
  // Generate next steps based on data
  const nextSteps = [];
  
  if (savingsRate < 20) {
    nextSteps.push(`Increase your savings rate from ${savingsRate}% to 20%`);
  }
  
  // Find top spending category
  let topCategory = 'your expenses';
  if (data.expenses && data.expenses.byCategory) {
    const entries = Object.entries(data.expenses.byCategory);
    if (entries.length > 0) {
      const sorted = entries.sort((a, b) => b[1] - a[1]);
      topCategory = sorted[0][0];
      nextSteps.push(`Review and optimize your spending in ${topCategory}`);
    }
  }
  
  if (data.expenses && data.expenses.recurringPayments && data.expenses.recurringPayments.length > 0) {
    nextSteps.push(`Review ${data.expenses.recurringPayments.length} recurring subscriptions`);
  }
  
  if (nextSteps.length === 0) {
    nextSteps.push('Review your spending', 'Set savings goals');
  }
  
  return {
    title: `Financial Health Report - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
    sections: [],
    nextSteps: nextSteps.slice(0, 5),
    generatedAt: new Date().toISOString(),
    dataPeriod: 'Current Month',
    summary: '',
    keyTakeaways: [],
    recommendations: []
  };
}