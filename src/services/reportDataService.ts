// src/services/reportDataService.ts

import { ReportData } from '../types/report.types';

export const MOCK_REPORT_DATA: ReportData = {
  expenses: {
    total: 45230,
    byCategory: {
      'Food & Dining': 12500,
      'Transportation': 8200,
      'Shopping': 6800,
      'Bills & Utilities': 9200,
      'Entertainment': 4500,
      'Healthcare': 4030,
      'Other': 0
    },
    monthlyTrend: [
      { month: 'Jan', amount: 38000 },
      { month: 'Feb', amount: 41000 },
      { month: 'Mar', amount: 39500 },
      { month: 'Apr', amount: 42000 },
      { month: 'May', amount: 45230 },
    ],
    recurringPayments: [
      { name: 'Netflix', amount: 649, frequency: 'Monthly' },
      { name: 'Spotify', amount: 119, frequency: 'Monthly' },
      { name: 'Gym Membership', amount: 1500, frequency: 'Monthly' },
      { name: 'Internet', amount: 999, frequency: 'Monthly' },
    ],
    unusualSpending: [
      { description: 'Electronics Purchase - Laptop', amount: 15000, date: '2026-07-15' },
      { description: 'Flight Booking - Goa Trip', amount: 8000, date: '2026-07-10' },
    ]
  },
  investments: {
    totalValue: 245000,
    holdings: [
      { symbol: 'AAPL', shares: 10, value: 17000, change: 2.5 },
      { symbol: 'GOOGL', shares: 5, value: 12500, change: 1.2 },
      { symbol: 'RELIANCE', shares: 20, value: 56000, change: 3.8 },
      { symbol: 'TCS', shares: 15, value: 45000, change: 0.8 },
      { symbol: 'HDFC', shares: 8, value: 32000, change: 1.5 },
    ],
    sectorAllocation: {
      'Technology': 45,
      'Finance': 25,
      'Healthcare': 15,
      'Energy': 10,
      'Others': 5,
    },
    performance: { day: 1.2, week: 3.5, month: 8.2, year: 22.5 }
  },
  market: {
    watchlist: [
      { symbol: 'NVDA', price: 890.50, change: 4.2 },
      { symbol: 'TSLA', price: 245.30, change: -1.5 },
      { symbol: 'HDFC', price: 1670.00, change: 2.1 },
      { symbol: 'INFY', price: 1520.00, change: 1.8 },
    ],
    news: [
      { title: 'RBI Maintains Repo Rate at 6.5%', date: '2026-07-16', sentiment: 'neutral' },
      { title: 'Tech Stocks Rally on AI Optimism', date: '2026-07-15', sentiment: 'positive' },
      { title: 'Inflation Drops to 4.2% in June', date: '2026-07-14', sentiment: 'positive' },
    ]
  },
  alerts: [
    { type: 'budget', message: 'Food budget exceeded by ₹2,500 this month', severity: 'warning', date: '2026-07-16' },
    { type: 'spending', message: 'Unusual spending: ₹15,000 at Electronics Store', severity: 'critical', date: '2026-07-15' },
    { type: 'portfolio', message: 'Tech sector exposure at 45% - consider diversifying', severity: 'warning', date: '2026-07-14' },
    { type: 'market', message: 'NVIDIA earnings announced - stock up 4.2%', severity: 'info', date: '2026-07-13' },
  ],
  healthScore: 78,
  goals: [
    { name: 'Emergency Fund', target: 100000, progress: 60 },
    { name: 'Vacation Fund', target: 50000, progress: 30 },
    { name: 'Investment Portfolio', target: 500000, progress: 49 },
  ]
};

export async function fetchReportData(userId: string): Promise<ReportData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return MOCK_REPORT_DATA;
}