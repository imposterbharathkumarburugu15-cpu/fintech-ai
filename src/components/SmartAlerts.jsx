import React, { useState, useEffect } from "react";
import {
  ShieldCheck, TrendingDown, TrendingUp, X,
  ChevronRight, Zap, BarChart2, Target, DollarSign, Globe
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../supabaseClient";

// Mock Fallbacks
const MOCK_TRANSACTIONS = [
  { amount: 120000, type: 'credit', merchant: 'Salary Deposit', category: 'Income', occurred_at: new Date().toISOString() },
  { amount: 840, type: 'debit', merchant: 'Local Diner Restaurant', category: 'Dining', occurred_at: new Date().toISOString() },
  { amount: 15500, type: 'debit', merchant: 'Zerodha Mutual Fund SIP', category: 'Investment', occurred_at: new Date().toISOString() },
  { amount: 1259, type: 'debit', merchant: 'Apple Store Subscription', category: 'Technology', occurred_at: new Date().toISOString() },
  { amount: 3450, type: 'debit', merchant: 'Amazon India Shopping', category: 'Groceries', occurred_at: new Date().toISOString() },
  { amount: 450, type: 'debit', merchant: 'Starbucks Coffee', category: 'Dining', occurred_at: new Date().toISOString() },
  { amount: 15.99, type: 'debit', merchant: 'Netflix Subscription', category: 'Entertainment', occurred_at: new Date().toISOString() },
];

const MOCK_GOALS = [
  { id: 1, name: "House Down Payment", target: 100000, current: 45000, monthlyTarget: 2500, timeline: "Dec 2027", color: "#3b82f6" },
  { id: 2, name: "Emergency Fund", target: 20000, current: 15500, monthlyTarget: 500, timeline: "Mar 2025", color: "#22c55e" }
];

const MOCK_INVESTMENTS = [
  { symbol: "AAPL", name: "Apple Inc.", shares: 150, price: 214.32, value: 32148, sector: "Technology", change: 1.24 },
  { symbol: "NVDA", name: "NVIDIA Corp.", shares: 45, price: 875.40, value: 39393, sector: "Technology", change: 2.34 },
  { symbol: "VOO", name: "Vanguard S&P 500", shares: 80, price: 504.12, value: 40329, sector: "General index", change: 0.52 },
  { symbol: "BND", name: "Vanguard Total Bond", shares: 45, price: 72.40, value: 3258, sector: "Bonds", change: -0.15 },
];

const FILTER_TABS = ["All", "Portfolio", "Budget", "Market", "Risk", "Savings"];

// Rules engine to build dynamic alerts based on user profile and market updates
function generateDynamicAlerts(transactions, goals, investments, quotes, news) {
  const generated = [];

  // --- PORTFOLIO & RISK RULES ---
  const totalValue = investments.reduce((sum, inv) => sum + (inv.value || 0), 0);
  const bySector = {};
  investments.forEach(inv => {
    const sector = inv.sector || 'Other';
    bySector[sector] = (bySector[sector] || 0) + (inv.value || 0);
  });

  // 1. Sector Concentration
  Object.entries(bySector).forEach(([sector, value]) => {
    const pct = totalValue > 0 ? Math.round((value / totalValue) * 100) : 0;
    if (pct > 50) {
      generated.push({
        id: `portfolio-concentration-${sector}`,
        category: "Risk",
        severity: "warning",
        icon: BarChart2,
        title: `High Sector Concentration`,
        subtitle: `${sector} = ${pct}% of your portfolio`,
        what: `Your portfolio has ${pct}% exposure to the ${sector} sector, significantly above the recommended 30–40% limit.`,
        why: `High concentration risk means a sector-specific correction will severely impact your net worth. The historic 2022 tech drawdown resulted in average declines of 35% for tech-heavy portfolios.`,
        action: "View Rebalancing Plan",
        actionColor: "#f59e0b",
        time: "Just now",
        borderClass: "alert-warning",
        badgeClass: "badge-amber",
        badgeLabel: "WARNING",
      });
    }
  });

  // 2. Portfolio Rebalancing Opportunity
  const bondsValue = bySector['Bonds'] || bySector['Fixed Income'] || bySector['Debt Mutual Funds'] || 0;
  const bondsPct = totalValue > 0 ? (bondsValue / totalValue) * 100 : 0;
  if (totalValue > 0 && bondsPct < 10) {
    generated.push({
      id: `portfolio-rebalance`,
      category: "Portfolio",
      severity: "info",
      icon: Target,
      title: "Rebalancing Opportunity",
      subtitle: `Bonds allocation is currently ${bondsPct.toFixed(1)}%`,
      what: `Your portfolio allocation has drifted from target weights. Fixed income and bonds are currently below 10% of total holdings.`,
      why: `Periodic rebalancing back to your target (e.g. 60/40 or 80/20) reduces volatility and preserves capital during equity market corrections.`,
      action: "Start Rebalancing",
      actionColor: "#8b5cf6",
      time: "Just now",
      borderClass: "alert-purple",
      badgeClass: "badge-purple",
      badgeLabel: "INFO",
    });
  }

  // 3. Stock Volatility (Drops > 3%)
  investments.forEach(inv => {
    const quote = quotes.find(q => q && q.symbol === inv.symbol);
    const dailyChange = quote ? Number(quote.dp) : Number(inv.change);
    const currentPrice = quote ? Number(quote.c) : Number(inv.price);
    const stockVal = inv.shares * currentPrice;

    if (dailyChange < -3.0) {
      generated.push({
        id: `stock-drop-${inv.symbol}`,
        category: "Portfolio",
        severity: "warning",
        icon: TrendingDown,
        title: `${inv.symbol} Dropped ${dailyChange.toFixed(2)}%`,
        subtitle: `Holding value: $${Math.round(stockVal).toLocaleString()}`,
        what: `${inv.name} (${inv.symbol}) shares fell by ${dailyChange.toFixed(2)}% today, currently trading at $${currentPrice.toFixed(2)}.`,
        why: `Intraday drops of >3% in core holdings indicate either stock-specific headwinds or market-wide sector rotations. Monitor news for company catalysts.`,
        action: "Review Position",
        symbol: inv.symbol,
        actionColor: "#ef4444",
        time: "Just now",
        borderClass: "alert-warning",
        badgeClass: "badge-amber",
        badgeLabel: "VOLATILITY",
      });
    }
  });

  // 4. Bad News Catalysts for holdings
  if (news && news.length > 0) {
    const negativeKeywords = ["crash", "decline", "investigation", "lawsuit", "down", "drop", "earnings", "miss", "plunge", "bearish", "fail", "deficit", "selloff", "losses"];
    news.forEach((article, index) => {
      const matchingHolding = investments.find(inv => 
        article.headline.toUpperCase().includes(inv.symbol) || 
        article.headline.toLowerCase().includes(inv.name.toLowerCase().split(" ")[0])
      );

      if (matchingHolding) {
        const isNegative = negativeKeywords.some(keyword => article.headline.toLowerCase().includes(keyword));
        if (isNegative) {
          generated.push({
            id: `news-warning-${index}-${matchingHolding.symbol}`,
            category: "Market",
            severity: "urgent",
            icon: Zap,
            title: `Negative Catalyst: ${matchingHolding.symbol}`,
            subtitle: article.headline.length > 50 ? article.headline.slice(0, 50) + "..." : article.headline,
            what: `Live news feed detected a potentially damaging announcement for ${matchingHolding.name}: "${article.headline}"`,
            why: `Negative sentiment or regulatory/earnings alerts can cause substantial market selloffs in the matching security.`,
            action: "Review Position",
            symbol: matchingHolding.symbol,
            actionColor: "#ef4444",
            time: "15 min ago",
            borderClass: "alert-urgent",
            badgeClass: "badge-red",
            badgeLabel: "URGENT",
          });
        }
      }
    });
  }

  // --- BUDGET & SPENDING RULES ---
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyDebits = transactions.filter(t => {
    const d = new Date(t.occurred_at || t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.type === 'debit';
  });

  const totalSpent = monthlyDebits.reduce((sum, t) => sum + Number(t.amount), 0);

  // 5. Dining Overspend
  const diningSpent = monthlyDebits
    .filter(t => t.category === 'Dining')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  if (diningSpent > 10000) {
    generated.push({
      id: "budget-dining-spend",
      category: "Budget",
      severity: "warning",
      icon: TrendingUp,
      title: "Dining Spend Exceeded limit",
      subtitle: `₹${Math.round(diningSpent).toLocaleString()} spent vs ₹8,000 budget`,
      what: `Your restaurant and cafe expenses are higher than your monthly dining allowance this month.`,
      why: `Dining and food delivery are highly customizable categories. Trimming this category could save significant monthly cash flow to speed up emergency savings.`,
      action: "Set Dining Alert",
      actionColor: "#f59e0b",
      time: "4 hours ago",
      borderClass: "alert-warning",
      badgeClass: "badge-amber",
      badgeLabel: "BUDGET",
    });
  }

  // 6. Large Unplanned Expense
  monthlyDebits.forEach(t => {
    if (Number(t.amount) > 15000) {
      generated.push({
        id: `large-expense-${t.id || t.merchant}`,
        category: "Budget",
        severity: "warning",
        icon: DollarSign,
        title: `Large Spending Alert`,
        subtitle: `₹${Number(t.amount).toLocaleString()} spent at ${t.merchant || "Merchant"}`,
        what: `An unusual debit of ₹${Number(t.amount).toLocaleString()} occurred in your transactions.`,
        why: `Unplanned large expenses impact your monthly savings rate goals and general budget limits.`,
        action: "Review Transaction",
        actionColor: "#3b82f6",
        time: "1 day ago",
        borderClass: "alert-warning",
        badgeClass: "badge-amber",
        badgeLabel: "WARNING",
      });
    }
  });

  // 7. Low Savings Rate
  const monthlyCredits = transactions.filter(t => {
    const d = new Date(t.occurred_at || t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.type === 'credit';
  });
  const totalIncome = monthlyCredits.reduce((sum, t) => sum + Number(t.amount), 0) || 120000;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome) * 100 : 0;

  if (savingsRate < 15 && totalSpent > 0) {
    generated.push({
      id: "budget-savings-rate",
      category: "Risk",
      severity: "warning",
      icon: TrendingDown,
      title: "Low Monthly Savings Rate",
      subtitle: `Savings rate at ${savingsRate.toFixed(1)}% (Target: 20%)`,
      what: `Your actual savings rate is ${savingsRate.toFixed(1)}% of net monthly income, drifting below your target.`,
      why: `Consistently low savings rates delay goal target timelines and reduce emergency buffers.`,
      action: "Optimize Spending",
      actionColor: "#f59e0b",
      time: "Just now",
      borderClass: "alert-warning",
      badgeClass: "badge-amber",
      badgeLabel: "SAVINGS RATE",
    });
  }

  // --- SAVINGS & GOALS RULES ---
  goals.forEach(goal => {
    const pct = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
    
    // 8. Milestone Celebration
    if (pct >= 75 && pct < 100) {
      generated.push({
        id: `goal-milestone-${goal.id || goal.name}`,
        category: "Savings",
        severity: "info",
        icon: ShieldCheck,
        title: `${goal.name}: ${Math.round(pct)}% Reached`,
        subtitle: `$${goal.current.toLocaleString()} of $${goal.target.toLocaleString()}`,
        what: `You are ahead of schedule for "${goal.name}", reaching ${Math.round(pct)}% of your target savings limit.`,
        why: `Reaching milestones confirms positive cash-flow redirection. A strong Emergency Fund represents significant wealth resilience.`,
        action: "View Goal Details",
        actionColor: "#22c55e",
        time: "1 day ago",
        borderClass: "alert-success",
        badgeClass: "badge-green",
        badgeLabel: "MILESTONE",
      });
    }
  });

  // 9. Savings yield optimization
  const totalSavings = goals.reduce((sum, g) => sum + (g.current || 0), 0);
  if (totalSavings > 10000) {
    generated.push({
      id: "savings-yield",
      category: "Savings",
      severity: "info",
      icon: ShieldCheck,
      title: "Increase Savings Yield",
      subtitle: `Optimize interest on $${Math.round(totalSavings).toLocaleString()} savings`,
      what: `Your aggregate cash savings of $${Math.round(totalSavings).toLocaleString()} is in a low-yield account. High-Yield Savings Accounts (HYSAs) offer up to 4.8% APY.`,
      why: `A high savings yield is equivalent to risk-free gains. Over $10k in checking loses purchasing power directly to inflation.`,
      action: "Compare HYSA Rates",
      actionColor: "#22c55e",
      time: "3 days ago",
      borderClass: "alert-success",
      badgeClass: "badge-green",
      badgeLabel: "OPPORTUNITY",
    });
  }

  // 10. Fed Policy / General Market Update (always present Macro signal)
  generated.push({
    id: "market-fomc-decision",
    category: "Market",
    severity: "info",
    icon: Globe,
    title: "Fed Interest Rate Decision",
    subtitle: "FOMC policy meeting expected this week",
    what: "The Federal Reserve policy makers will finalize rate adjustments Thursday at 2:00 PM ET.",
    why: "Rate decision directives impact stock valuations and yields. Growth sectors (like tech) are highly rate-sensitive.",
    action: "Read Market Brief",
    actionColor: "#3b82f6",
    time: "2 days ago",
    borderClass: "alert-info",
    badgeClass: "badge-blue",
    badgeLabel: "MARKET",
  });

  return generated;
}

function AlertCard({ alert, onDismiss, onViewChange, onOpenStock }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = alert.icon;

  const handleActionClick = () => {
    if (!alert.action) return;

    // Check if it's a stock-specific action that should open the Stock Research page
    if (alert.symbol && (alert.action.includes("Review") || alert.action.includes("Read") || alert.action.includes("Catalyst") || alert.action.includes("Position"))) {
      if (onOpenStock) {
        onOpenStock(alert.symbol);
        return;
      }
    }

    // Map other actions to view changes
    if (onViewChange) {
      const actionText = alert.action.toLowerCase();
      if (actionText.includes("rebalanc")) {
        onViewChange("portfolio");
      } else if (actionText.includes("budget") || actionText.includes("spend") || actionText.includes("transaction") || actionText.includes("dining") || actionText.includes("alert")) {
        onViewChange("expenses");
      } else if (actionText.includes("goal") || actionText.includes("hysa") || actionText.includes("rates")) {
        onViewChange("goals");
      } else if (actionText.includes("market") || actionText.includes("brief")) {
        onViewChange("markets");
      } else {
        onViewChange("dashboard");
      }
    }
  };

  return (
    <div
      className={`bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden hover:border-[#3f3f46] transition-all duration-200 animate-fade-in-up ${alert.borderClass}`}
    >
      <div
        className="p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: alert.severity === "urgent"
                ? "rgba(239, 68, 68, 0.12)"
                : alert.severity === "warning"
                ? "rgba(245, 158, 11, 0.12)"
                : "rgba(59, 130, 246, 0.12)",
            }}
          >
            <Icon
              className="w-5 h-5"
              style={{
                color: alert.severity === "urgent"
                  ? "#ef4444"
                  : alert.severity === "warning"
                  ? "#f59e0b"
                  : "#3b82f6",
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`badge ${alert.badgeClass}`}>{alert.badgeLabel}</span>
              <h3 className="text-white font-semibold text-[15px] leading-tight">{alert.title}</h3>
            </div>
            <p className="text-[#71717a] text-[13px]">{alert.subtitle}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-[#52525b]">{alert.time}</span>
            <ChevronRight
              className={`w-4 h-4 text-[#52525b] transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
            />
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-[#27272a] pt-4 animate-fade-in">
          <div className="space-y-3 mb-4">
            <div>
              <p className="text-[11px] font-semibold text-[#52525b] uppercase tracking-wider mb-1">What happened</p>
              <p className="text-[13px] text-[#a1a1aa] leading-relaxed">{alert.what}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#52525b] uppercase tracking-wider mb-1">Why it matters</p>
              <p className="text-[13px] text-[#a1a1aa] leading-relaxed">{alert.why}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleActionClick}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-95 cursor-pointer"
              style={{ background: alert.actionColor, boxShadow: `0 4px 12px ${alert.actionColor}40` }}
            >
              {alert.action}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDismiss(alert.id); }}
              className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#71717a] hover:text-white bg-[#27272a] hover:bg-[#3f3f46] transition-all cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SmartAlerts({ onViewChange, onOpenStock }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  const [dismissedIds, setDismissedIds] = useState(() => {
    try {
      const stored = sessionStorage.getItem("finpilot-dismissed-alerts");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    async function loadDataAndGenerateAlerts() {
      setLoading(true);
      let txs = [];
      let gls = [];
      let invs = [];
      let quotes = [];
      let news = [];

      // 1. Fetch transactions
      try {
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase
            .from("transactions")
            .select("*")
            .order("occurred_at", { ascending: false });
          if (!error && data) txs = data;
        }
      } catch (err) {
        console.error("Error fetching transactions:", err);
      }
      if (txs.length === 0) txs = MOCK_TRANSACTIONS;

      // 2. Fetch goals
      try {
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase
            .from("goals")
            .select("*");
          if (!error && data && data.length > 0) {
            gls = data.map(g => ({
              id: g.id,
              name: g.name,
              target: Number(g.target_amount || g.target || 0),
              current: Number(g.current_amount || g.current || 0),
              monthlyTarget: Number(g.monthly_target || g.monthlyTarget || 0),
              timeline: g.timeline,
              color: g.color || "#3b82f6"
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching goals:", err);
      }
      if (gls.length === 0) gls = MOCK_GOALS;

      // 3. Fetch investments
      try {
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase
            .from("investments")
            .select("*");
          if (!error && data && data.length > 0) {
            invs = data.map(i => ({
              symbol: i.symbol,
              name: i.name,
              shares: Number(i.shares || 0),
              price: Number(i.price || 0),
              value: Number(i.value || 0),
              sector: i.sector,
              change: Number(i.change || 0)
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching investments:", err);
      }
      if (invs.length === 0) invs = MOCK_INVESTMENTS;

      // 4. Fetch from Finnhub API if key exists
      const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
      if (FINNHUB_KEY && FINNHUB_KEY !== "YOUR_FINNHUB_API_KEY" && FINNHUB_KEY !== "your-finnhub-key") {
        try {
          const uniqueSymbols = [...new Set(invs.map(i => i.symbol).filter(Boolean))];
          const quotePromises = uniqueSymbols.map(async (sym) => {
            try {
              const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${FINNHUB_KEY}`);
              if (res.ok) {
                const quoteData = await res.json();
                return { symbol: sym, ...quoteData };
              }
            } catch (e) {
              console.error(`Finnhub quote fetch failed for ${sym}:`, e);
            }
            return null;
          });

          const newsPromise = fetch(`https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_KEY}`)
            .then(res => res.ok ? res.json() : [])
            .catch(() => []);

          const [fetchedQuotes, fetchedNews] = await Promise.all([
            Promise.all(quotePromises),
            newsPromise
          ]);

          quotes = fetchedQuotes.filter(Boolean);
          news = fetchedNews;
        } catch (err) {
          console.error("Error fetching live Finnhub updates:", err);
        }
      }

      // 5. Generate dynamic alerts
      const dynamicList = generateDynamicAlerts(txs, gls, invs, quotes, news);
      setAlerts(dynamicList);
      setLoading(false);
    }

    loadDataAndGenerateAlerts();
  }, []);

  const handleDismiss = (id) => {
    setDismissedIds(prev => {
      const next = [...prev, id];
      sessionStorage.setItem("finpilot-dismissed-alerts", JSON.stringify(next));
      return next;
    });
  };

  const handleDismissAll = () => {
    const allIds = visibleAlerts.map(a => a.id);
    setDismissedIds(prev => {
      const next = [...prev, ...allIds];
      sessionStorage.setItem("finpilot-dismissed-alerts", JSON.stringify(next));
      return next;
    });
  };

  const visibleAlerts = alerts.filter((a) => !dismissedIds.includes(a.id));

  const filtered = activeFilter === "All"
    ? visibleAlerts
    : visibleAlerts.filter((a) => a.category === activeFilter);

  const urgentCount = visibleAlerts.filter((a) => a.severity === "urgent").length;
  const warningCount = visibleAlerts.filter((a) => a.severity === "warning").length;

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto flex flex-col h-full items-center justify-center p-12 text-[#a1a1aa] min-h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-4" />
        <p className="text-sm font-medium">Analyzing financial records & market catalysts...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto flex flex-col h-full pb-20">
      {/* Header */}
      <div className="flex justify-between items-end mb-6 animate-fade-in-up">
        <div>
          <p className="text-[#3b82f6] text-[11px] font-bold tracking-[0.12em] mb-2 uppercase">Monitoring</p>
          <h1 className="text-[38px] font-semibold text-white tracking-[-0.025em] mb-2 leading-none">Smart Alerts</h1>
          <p className="text-[#71717a] text-[15px]">AI-powered financial monitoring and recommendations.</p>
        </div>
        {visibleAlerts.length > 0 && (
          <button
            onClick={handleDismissAll}
            className="text-[13px] font-medium text-[#71717a] hover:text-white transition-colors flex items-center gap-2 px-4 py-2 rounded-xl bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] cursor-pointer"
          >
            <X className="w-4 h-4" />
            Dismiss All
          </button>
        )}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3 mb-6 animate-fade-in-up stagger-1">
        {[
          { label: "Total Alerts", value: visibleAlerts.length, color: "#a1a1aa" },
          { label: "Urgent", value: urgentCount, color: "#ef4444" },
          { label: "Warnings", value: warningCount, color: "#f59e0b" },
          { label: "Portfolio", value: visibleAlerts.filter(a => a.category === "Portfolio" || a.category === "Risk").length, color: "#8b5cf6" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3 text-center">
            <div className="text-2xl font-bold font-mono" style={{ color }}>{value}</div>
            <div className="text-[11px] text-[#71717a] font-medium mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap animate-fade-in-up stagger-2">
        {FILTER_TABS.map((tab) => {
          const count = tab === "All" 
            ? visibleAlerts.length 
            : visibleAlerts.filter(a => a.category === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-2 rounded-xl text-[13px] font-medium border transition-all cursor-pointer ${
                activeFilter === tab
                  ? "bg-[#27272a] text-white border-[#3f3f46]"
                  : "bg-transparent text-[#71717a] border-[#27272a] hover:text-[#a1a1aa] hover:border-[#3f3f46]"
              }`}
            >
              {tab}
              <span className="ml-1.5 text-[11px] text-[#52525b]">
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Alert Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#22c55e]/10 flex items-center justify-center mb-4">
              <ShieldCheck className="w-7 h-7 text-[#22c55e]" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">All clear!</h3>
            <p className="text-[#71717a] text-sm">No alerts in this category.</p>
          </div>
        ) : (
          filtered.map((alert, i) => (
            <div key={alert.id} style={{ animationDelay: `${i * 40}ms` }}>
              <AlertCard alert={alert} onDismiss={handleDismiss} onViewChange={onViewChange} onOpenStock={onOpenStock} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export { SmartAlerts };
