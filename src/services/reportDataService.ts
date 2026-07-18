// src/services/reportDataService.ts

import { supabase } from "../supabaseClient";
import { ReportData } from "../types/report.types";

export async function fetchReportData(userId?: string): Promise<ReportData> {
  try {
    // Get current user
    let user = null;
    let userIdToUse = userId;

    if (!userIdToUse) {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      user = currentUser;
      userIdToUse = currentUser?.id;
    }

    if (!userIdToUse) {
      throw new Error('User not authenticated');
    }

    console.log('📊 Fetching data for user:', userIdToUse);

    // ===== FETCH ALL TRANSACTIONS =====
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userIdToUse)
      .order('occurred_at', { ascending: false });

    if (txError) {
      console.error('Error fetching transactions:', txError);
      throw txError;
    }

    console.log(`📊 Found ${transactions?.length || 0} transactions`);

    // ===== FETCH GOALS (if exists) =====
    let goals: any[] = [];
    try {
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userIdToUse);

      if (!goalsError && goalsData) {
        goals = goalsData;
        console.log(`🎯 Found ${goals.length} goals`);
      }
    } catch (e) {
      console.log('Goals table not found, using defaults');
    }

    // ===== FETCH INVESTMENTS (if exists) =====
    let investments: any[] = [];
    try {
      const { data: invData, error: invError } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', userIdToUse);

      if (!invError && invData) {
        investments = invData;
        console.log(`📈 Found ${investments.length} investments`);
      }
    } catch (e) {
      console.log('Investments table not found, using defaults');
    }

    // ===== PROCESS DATA =====
    const reportData = processTransactionsToReport(transactions || [], goals, investments);
    console.log('✅ Report data processed successfully');
    return reportData;

  } catch (error) {
    console.error('❌ Error fetching report data:', error);
    throw error;
  }
}

// ===== PROCESS TRANSACTIONS =====

function processTransactionsToReport(
  transactions: any[],
  goals: any[],
  investments: any[]
): ReportData {
  
  // Separate debit and credit
  const debits = transactions.filter((t: any) => t.type === 'debit');
  const credits = transactions.filter((t: any) => t.type === 'credit');

  // ===== 1. EXPENSE ANALYSIS =====
  const totalSpent = debits.reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  // Spending by category
  const byCategory: Record<string, number> = {};
  debits.forEach((t: any) => {
    const category = t.category || 'Other';
    const amount = Number(t.amount);
    byCategory[category] = (byCategory[category] || 0) + amount;
  });

  // ===== 2. MONTHLY TREND =====
  const monthlyTrend: { month: string; amount: number }[] = [];
  const monthMap: Record<string, number> = {};
  
  debits.forEach((t: any) => {
    const date = new Date(t.occurred_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleString('en-US', { month: 'short' });
    
    if (!monthMap[monthKey]) {
      monthMap[monthKey] = 0;
      monthlyTrend.push({ month: monthName, amount: 0 });
    }
    monthMap[monthKey] += Number(t.amount);
  });

  const monthKeys = Object.keys(monthMap);
  monthKeys.forEach((key, index) => {
    if (monthlyTrend[index]) {
      monthlyTrend[index].amount = monthMap[key];
    }
  });

  const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  monthlyTrend.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));

  // ===== 3. RECURRING PAYMENTS =====
  const recurringPayments: { name: string; amount: number; frequency: string }[] = [];
  const merchantFrequency: Record<string, { count: number; total: number; lastDate: Date }> = {};
  
  debits.forEach((t: any) => {
    const merchant = t.merchant || t.category || 'Unknown';
    if (!merchantFrequency[merchant]) {
      merchantFrequency[merchant] = { count: 0, total: 0, lastDate: new Date(t.occurred_at) };
    }
    merchantFrequency[merchant].count++;
    merchantFrequency[merchant].total += Number(t.amount);
    if (new Date(t.occurred_at) > merchantFrequency[merchant].lastDate) {
      merchantFrequency[merchant].lastDate = new Date(t.occurred_at);
    }
  });

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  Object.entries(merchantFrequency).forEach(([merchant, data]) => {
    if (data.count >= 3 && data.lastDate > threeMonthsAgo) {
      recurringPayments.push({
        name: merchant,
        amount: Math.round(data.total / data.count),
        frequency: 'Monthly'
      });
    }
  });

  // ===== 4. UNUSUAL SPENDING =====
  const avgAmount = debits.length > 0 ? totalSpent / debits.length : 0;
  const threshold = Math.max(avgAmount * 2, 5000);
  
  const unusualSpending = debits
    .filter((t: any) => Number(t.amount) > threshold)
    .map((t: any) => ({
      description: t.merchant || t.category || 'Unknown',
      amount: Number(t.amount),
      date: new Date(t.occurred_at).toLocaleDateString()
    }))
    .sort((a: any, b: any) => b.amount - a.amount)
    .slice(0, 5);

  // ===== 5. INCOME ANALYSIS =====
  const totalIncome = credits.reduce((sum: number, t: any) => sum + Number(t.amount), 0);
  const monthlyIncome = totalIncome || 60000;

  // ===== 6. SAVINGS RATE =====
  const savingsRate = monthlyIncome > 0 
    ? Math.round(((monthlyIncome - totalSpent) / monthlyIncome) * 100) 
    : 0;

  // ===== 7. HEALTH SCORE =====
  const totalPortfolioValue = investments.reduce((sum: number, inv: any) => sum + Number(inv.value || 0), 0);
  
  const healthScore = calculateHealthScore(
    monthlyIncome,
    totalSpent,
    totalPortfolioValue,
    savingsRate,
    goals
  );

  // ===== 8. GOALS =====
  const formattedGoals = goals.map((g: any) => ({
    name: g.name || 'Untitled Goal',
    target: Number(g.target_amount || g.target || 0),
    progress: Number(g.progress || 0)
  }));

  if (formattedGoals.length === 0) {
    const monthlySavings = Math.max(0, monthlyIncome - totalSpent);
    formattedGoals.push({
      name: 'Emergency Fund',
      target: 100000,
      progress: Math.min(100, Math.round((monthlySavings * 6 / 100000) * 100))
    });
    formattedGoals.push({
      name: 'Savings Goal',
      target: 500000,
      progress: Math.min(100, Math.round((monthlySavings * 12 / 500000) * 100))
    });
  }

  // ===== 9. ALERTS =====
  const alerts: any[] = [];

  if (savingsRate < 10) {
    alerts.push({
      type: 'budget',
      message: `Your savings rate is ${savingsRate}%. Consider reviewing your expenses.`,
      severity: 'warning',
      date: new Date().toLocaleDateString()
    });
  }

  unusualSpending.slice(0, 3).forEach((us: any) => {
    alerts.push({
      type: 'spending',
      message: `Unusual spending: ₹${us.amount.toLocaleString()} at ${us.description}`,
      severity: 'critical',
      date: us.date
    });
  });

  if (recurringPayments.length > 3) {
    const totalRecurring = recurringPayments.reduce((sum, r) => sum + r.amount, 0);
    alerts.push({
      type: 'budget',
      message: `You have ${recurringPayments.length} recurring payments totaling ₹${totalRecurring.toLocaleString()}/month`,
      severity: 'info',
      date: new Date().toLocaleDateString()
    });
  }

  // ===== 10. INVESTMENTS =====
  const sectorAllocation: Record<string, number> = {};
  investments.forEach((inv: any) => {
    const sector = inv.sector || 'Other';
    sectorAllocation[sector] = (sectorAllocation[sector] || 0) + Number(inv.value || 0);
  });
  
  if (totalPortfolioValue > 0) {
    Object.keys(sectorAllocation).forEach(key => {
      sectorAllocation[key] = Math.round((sectorAllocation[key] / totalPortfolioValue) * 100);
    });
  }

  const holdings = investments.map((inv: any) => ({
    symbol: inv.symbol || 'N/A',
    shares: Number(inv.shares || 0),
    value: Number(inv.value || 0),
    change: Number(inv.change || 0)
  }));

  // ===== BUILD REPORT =====
  return {
    expenses: {
      total: totalSpent,
      byCategory: byCategory,
      monthlyTrend: monthlyTrend,
      recurringPayments: recurringPayments.slice(0, 5),
      unusualSpending: unusualSpending
    },
    investments: {
      totalValue: totalPortfolioValue,
      holdings: holdings,
      sectorAllocation: Object.keys(sectorAllocation).length > 0 ? sectorAllocation : {
        'Technology': 45,
        'Finance': 25,
        'Healthcare': 15,
        'Energy': 10,
        'Others': 5
      },
      performance: {
        day: 0,
        week: 0,
        month: 0,
        year: 0
      }
    },
    market: {
      watchlist: investments.map((inv: any) => ({
        symbol: inv.symbol || 'N/A',
        price: Number(inv.price || 0),
        change: Number(inv.change || 0)
      })),
      news: [
        { title: 'Track your investments regularly', date: new Date().toLocaleDateString(), sentiment: 'neutral' }
      ]
    },
    alerts: alerts.slice(0, 5),
    healthScore: healthScore,
    goals: formattedGoals
  };
}

// ===== HEALTH SCORE CALCULATION =====

function calculateHealthScore(
  monthlyIncome: number,
  monthlyExpenses: number,
  portfolioValue: number,
  savingsRate: number,
  goals: any[]
): number {
  let score = 0;

  // Savings rate (max 35)
  if (savingsRate >= 30) score += 35;
  else if (savingsRate >= 25) score += 30;
  else if (savingsRate >= 20) score += 25;
  else if (savingsRate >= 15) score += 20;
  else if (savingsRate >= 10) score += 15;
  else if (savingsRate >= 5) score += 10;
  else score += 5;

  // Expense management (max 25)
  const expenseRatio = monthlyIncome > 0 ? monthlyExpenses / monthlyIncome : 1;
  if (expenseRatio < 0.3) score += 25;
  else if (expenseRatio < 0.5) score += 20;
  else if (expenseRatio < 0.7) score += 15;
  else if (expenseRatio < 0.85) score += 10;
  else score += 5;

  // Portfolio (max 25)
  if (portfolioValue > 500000) score += 25;
  else if (portfolioValue > 250000) score += 20;
  else if (portfolioValue > 100000) score += 15;
  else if (portfolioValue > 50000) score += 10;
  else if (portfolioValue > 25000) score += 5;
  else score += 2;

  // Goals (max 15)
  const goalsOnTrack = goals.filter((g: any) => (g.progress || 0) > 50).length;
  const totalGoals = goals.length || 1;
  const goalRatio = goalsOnTrack / totalGoals;
  if (goalRatio > 0.8) score += 15;
  else if (goalRatio > 0.5) score += 10;
  else if (goalRatio > 0.3) score += 5;
  else score += 2;

  return Math.min(Math.max(score, 0), 100);
}