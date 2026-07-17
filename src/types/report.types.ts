// src/types/report.types.ts

export interface ExpenseData {
  total: number;
  byCategory: Record<string, number>;
  monthlyTrend: Array<{ month: string; amount: number }>;
  recurringPayments: Array<{ name: string; amount: number; frequency: string }>;
  unusualSpending: Array<{ description: string; amount: number; date: string }>;
}

export interface InvestmentData {
  totalValue: number;
  holdings: Array<{ symbol: string; shares: number; value: number; change: number }>;
  sectorAllocation: Record<string, number>;
  performance: { day: number; week: number; month: number; year: number };
}

export interface MarketData {
  watchlist: Array<{ symbol: string; price: number; change: number }>;
  news: Array<{ title: string; date: string; sentiment: string }>;
}

export interface AlertData {
  type: 'budget' | 'spending' | 'portfolio' | 'market';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  date: string;
}

export interface ReportData {
  expenses: ExpenseData;
  investments: InvestmentData;
  market: MarketData;
  alerts: AlertData[];
  healthScore: number;
  goals: Array<{ name: string; target: number; progress: number }>;
}
export interface ReportSection {
  heading: string;
  content: string;
  type: 'insight' | 'warning' | 'opportunity' | 'achievement';
  chartData?: any;
  chartType?: 'pie' | 'bar' | 'line';  // Add this
  customComponent?: React.ReactNode;    // Add this
}

export interface Recommendation {
  action: string;
  why: string;
  impact: string;
}

export interface GeneratedReport {
  title: string;
  summary: string;
  sections: ReportSection[];
  keyTakeaways: string[];
  recommendations: Recommendation[];
  nextSteps: string[];
  generatedAt: string;
  dataPeriod: string;
}