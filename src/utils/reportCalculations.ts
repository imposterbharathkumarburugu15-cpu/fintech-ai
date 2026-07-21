// src/utils/reportCalculations.ts

import { ReportData, InvestmentData } from '../types/report.types';

export function calculateSavingsRate(data: ReportData): number {
  const monthlyIncome = 60000; // This will be calculated from actual income data
  const lastMonth = data.expenses.monthlyTrend[data.expenses.monthlyTrend.length - 1];
  if (!lastMonth) return 0;
  return Math.round(((monthlyIncome - lastMonth.amount) / monthlyIncome) * 100);
}

export function calculateDiversification(data: InvestmentData): string {
  const sectors = Object.keys(data.sectorAllocation);
  if (sectors.length >= 5) return 'Well Diversified';
  if (sectors.length >= 3) return 'Moderately Diversified';
  return 'Concentrated Portfolio';
}

export function generateStructuredReport(data: ReportData) {
  const savingsRate = calculateSavingsRate(data);
  const diversification = calculateDiversification(data.investments);
  
  return {
    title: `Financial Health Report - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
    sections: [],
    nextSteps: ['Review your spending', 'Set savings goals'],
    generatedAt: new Date().toISOString(),
    dataPeriod: 'Current Month',
    summary: '',
    keyTakeaways: [],
    recommendations: []
  };
}