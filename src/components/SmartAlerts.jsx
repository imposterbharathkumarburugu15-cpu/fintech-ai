import React, { useState } from "react";
import {
  AlertTriangle, ShieldCheck, TrendingDown, TrendingUp, Bell, X,
  ChevronRight, Zap, BarChart2, Target, DollarSign, Globe
} from "lucide-react";

const ALL_ALERTS = [
  {
    id: 1,
    category: "Portfolio",
    severity: "urgent",
    icon: Zap,
    title: "NVIDIA Earnings Tomorrow",
    subtitle: "You hold 45 shares of NVDA",
    what: "NVIDIA Corporation reports Q3 2026 earnings after market close tomorrow.",
    why: "Earnings announcements often cause significant price movement — NVDA has moved an average of ±9% on earnings days over the past year.",
    action: "Review Position",
    actionColor: "#ef4444",
    time: "30 min ago",
    borderClass: "alert-urgent",
    badgeClass: "badge-red",
    badgeLabel: "URGENT",
  },
  {
    id: 2,
    category: "Risk",
    severity: "warning",
    icon: BarChart2,
    title: "High Sector Concentration",
    subtitle: "Technology = 72% of your portfolio",
    what: "Your portfolio has 72% exposure to the Technology sector, significantly above the recommended 30–40% for diversified investors.",
    why: "Concentration risk means a sector-wide correction could disproportionately impact your net worth. The 2022 tech selloff caused a 35% average decline in tech-heavy portfolios.",
    action: "View Rebalancing Plan",
    actionColor: "#f59e0b",
    time: "2 hours ago",
    borderClass: "alert-warning",
    badgeClass: "badge-amber",
    badgeLabel: "WARNING",
  },
  {
    id: 3,
    category: "Budget",
    severity: "warning",
    icon: TrendingUp,
    title: "Dining Spend Up 24%",
    subtitle: "$840 spent vs $680 budget this month",
    what: "Your dining and restaurant expenses are 24% higher than your monthly budget and 18% above your 3-month average.",
    why: "At this pace, you'll overspend your dining budget by ~$200 this month. That's $2,400/year that could instead go toward your Emergency Fund goal.",
    action: "Set Dining Alert",
    actionColor: "#f59e0b",
    time: "4 hours ago",
    borderClass: "alert-warning",
    badgeClass: "badge-amber",
    badgeLabel: "BUDGET",
  },
  {
    id: 4,
    category: "Savings",
    severity: "info",
    icon: ShieldCheck,
    title: "Emergency Fund: 77% Complete",
    subtitle: "$15,500 of $20,000 goal reached",
    what: "You're ahead of your Emergency Fund savings target by 3 weeks based on your current contribution rate.",
    why: "At your current pace, you'll reach your $20,000 Emergency Fund goal by February 2025 — 2 months ahead of your original March target.",
    action: "View Goal Details",
    actionColor: "#22c55e",
    time: "1 day ago",
    borderClass: "alert-success",
    badgeClass: "badge-green",
    badgeLabel: "MILESTONE",
  },
  {
    id: 5,
    category: "Market",
    severity: "info",
    icon: Globe,
    title: "Fed Rate Decision This Week",
    subtitle: "FOMC meeting Thursday — markets watching",
    what: "The Federal Reserve's FOMC is meeting Wednesday–Thursday with a rate decision expected at 2:00 PM ET on Thursday.",
    why: "Rate decisions directly affect bond yields, mortgage rates, and growth stock valuations. Historically, markets see increased volatility ±2 days around FOMC announcements.",
    action: "Read Market Brief",
    actionColor: "#3b82f6",
    time: "1 day ago",
    borderClass: "alert-info",
    badgeClass: "badge-blue",
    badgeLabel: "MARKET",
  },
  {
    id: 6,
    category: "Portfolio",
    severity: "info",
    icon: Target,
    title: "Rebalancing Opportunity",
    subtitle: "Portfolio drifted 8% from target allocation",
    what: "Your portfolio allocation has drifted from your target. Bonds are 8% underweight and International equities are 5% underweight.",
    why: "Regular rebalancing (ideally quarterly or when drift exceeds 5%) maintains your intended risk profile and can improve long-term risk-adjusted returns.",
    action: "Start Rebalancing",
    actionColor: "#8b5cf6",
    time: "3 days ago",
    borderClass: "alert-purple",
    badgeClass: "badge-purple",
    badgeLabel: "INFO",
  },
  {
    id: 7,
    category: "Budget",
    severity: "info",
    icon: DollarSign,
    title: "Netflix Auto-Renews in 3 Days",
    subtitle: "$15.99 on Jun 18 · Standard plan",
    what: "Your Netflix subscription will auto-renew on June 18 for $15.99.",
    why: "You've watched Netflix less than 4 hours this month. At your current usage level, this works out to ~$4/hour, above your average streaming cost per hour.",
    action: "Manage Subscription",
    actionColor: "#3b82f6",
    time: "3 days ago",
    borderClass: "alert-info",
    badgeClass: "badge-blue",
    badgeLabel: "REMINDER",
  },
  {
    id: 8,
    category: "Savings",
    severity: "info",
    icon: TrendingDown,
    title: "You Could Earn More on Savings",
    subtitle: "Savings account APY: 0.5% — market rate: 4.8%",
    what: "Your primary savings account earns 0.5% APY. High-yield savings accounts currently offer up to 4.8% APY.",
    why: "On your $15,500 balance, switching to a HYSA could earn ~$744/year in interest vs ~$78/year currently — a difference of $666 annually.",
    action: "Compare HYSA Rates",
    actionColor: "#22c55e",
    time: "5 days ago",
    borderClass: "alert-success",
    badgeClass: "badge-green",
    badgeLabel: "OPPORTUNITY",
  },
];

const FILTER_TABS = ["All", "Portfolio", "Budget", "Market", "Risk", "Savings"];

function AlertCard({ alert, onDismiss }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = alert.icon;

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

      {/* Expanded detail */}
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
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: alert.actionColor, boxShadow: `0 4px 12px ${alert.actionColor}40` }}
            >
              {alert.action}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDismiss(alert.id); }}
              className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#71717a] hover:text-white bg-[#27272a] hover:bg-[#3f3f46] transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SmartAlerts() {
  const [alerts, setAlerts] = useState(ALL_ALERTS);
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = activeFilter === "All"
    ? alerts
    : alerts.filter((a) => a.category === activeFilter);

  const urgentCount = alerts.filter((a) => a.severity === "urgent").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;

  const handleDismiss = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="max-w-[1000px] mx-auto flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-end mb-6 animate-fade-in-up">
        <div>
          <p className="text-[#3b82f6] text-[11px] font-bold tracking-[0.12em] mb-2 uppercase">Monitoring</p>
          <h1 className="text-[38px] font-semibold text-white tracking-[-0.025em] mb-2 leading-none">Smart Alerts</h1>
          <p className="text-[#71717a] text-[15px]">AI-powered financial monitoring and recommendations.</p>
        </div>
        {alerts.length > 0 && (
          <button
            onClick={() => setAlerts([])}
            className="text-[13px] font-medium text-[#71717a] hover:text-white transition-colors flex items-center gap-2 px-4 py-2 rounded-xl bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46]"
          >
            <X className="w-4 h-4" />
            Dismiss All
          </button>
        )}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3 mb-6 animate-fade-in-up stagger-1">
        {[
          { label: "Total Alerts", value: alerts.length, color: "#a1a1aa" },
          { label: "Urgent", value: urgentCount, color: "#ef4444" },
          { label: "Warnings", value: warningCount, color: "#f59e0b" },
          { label: "Portfolio", value: alerts.filter(a => a.category === "Portfolio").length, color: "#8b5cf6" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3 text-center">
            <div className="text-2xl font-bold" style={{ color }}>{value}</div>
            <div className="text-[11px] text-[#71717a] font-medium mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap animate-fade-in-up stagger-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-2 rounded-xl text-[13px] font-medium border transition-all ${
              activeFilter === tab
                ? "bg-[#27272a] text-white border-[#3f3f46]"
                : "bg-transparent text-[#71717a] border-[#27272a] hover:text-[#a1a1aa] hover:border-[#3f3f46]"
            }`}
          >
            {tab}
            {tab !== "All" && (
              <span className="ml-1.5 text-[11px] text-[#52525b]">
                ({alerts.filter(a => a.category === tab).length})
              </span>
            )}
          </button>
        ))}
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
              <AlertCard alert={alert} onDismiss={handleDismiss} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export { SmartAlerts };
