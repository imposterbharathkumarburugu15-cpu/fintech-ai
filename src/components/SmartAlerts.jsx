import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart2, Bell, Check, ChevronRight, Clock3, DollarSign, Globe, Plus,
  RotateCcw, Search, ShieldCheck, Target, Trash2, TrendingDown, TrendingUp, X, Zap
} from "lucide-react";

const ICONS = { zap: Zap, chart: BarChart2, globe: Globe, target: Target, dollar: DollarSign, shield: ShieldCheck, trendDown: TrendingDown, trendUp: TrendingUp };
const FILTER_TABS = ["All", "Portfolio", "Budget", "Market", "Risk", "Savings"];
const HOLDINGS_STORAGE_KEY = "finpilot-manual-holdings-v1";
const severityStyles = {
  urgent: { color: "#ef4444", background: "rgba(239, 68, 68, .12)", badge: "badge-red", border: "alert-urgent" },
  warning: { color: "#f59e0b", background: "rgba(245, 158, 11, .12)", badge: "badge-amber", border: "alert-warning" },
  info: { color: "#3b82f6", background: "rgba(59, 130, 246, .12)", badge: "badge-blue", border: "alert-info" },
  success: { color: "#22c55e", background: "rgba(34, 197, 94, .12)", badge: "badge-green", border: "alert-success" },
};

function readHoldings() {
  try {
    const saved = JSON.parse(localStorage.getItem(HOLDINGS_STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function AlertCard({ alert, onDismiss, onSnooze, onAction }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = typeof alert.icon === "string" ? (ICONS[alert.icon] || Bell) : alert.icon;
  const style = severityStyles[alert.severity] || severityStyles.info;

  return (
    <article className={`bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden hover:border-[#3f3f46] transition-all ${style.border}`}>
      <button type="button" className="w-full p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-inset" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: style.background }}><Icon className="w-5 h-5" style={{ color: style.color }} /></div>
          <div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1 flex-wrap"><span className={`badge ${style.badge}`}>{alert.badgeLabel}</span><h3 className="text-white font-semibold text-[15px] leading-tight">{alert.title}</h3></div><p className="text-[#71717a] text-[13px]">{alert.subtitle}</p></div>
          <div className="flex items-center gap-2 shrink-0"><span className="hidden sm:inline text-[11px] text-[#52525b]">{alert.time}</span><ChevronRight className={`w-4 h-4 text-[#52525b] transition-transform ${expanded ? "rotate-90" : ""}`} /></div>
        </div>
      </button>
      {expanded && <div className="px-5 pb-5 border-t border-[#27272a] pt-4 animate-fade-in">
        <div className="space-y-3 mb-4">
          <div><p className="text-[11px] font-semibold text-[#52525b] uppercase tracking-wider mb-1">What happened</p><p className="text-[13px] text-[#a1a1aa] leading-relaxed">{alert.what}</p></div>
          <div><p className="text-[11px] font-semibold text-[#52525b] uppercase tracking-wider mb-1">Why it matters</p><p className="text-[13px] text-[#a1a1aa] leading-relaxed">{alert.why}</p></div>
          {(alert.sourceName || alert.whyYouSeeThis || alert.confidence) && <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#71717a] border-t border-[#27272a] pt-3"><span>{alert.sourceName ? `Source: ${alert.sourceName}` : "FinPilot signal"}</span>{alert.confidence && <span>Confidence: {Math.round(alert.confidence * 100)}%</span>}{alert.whyYouSeeThis && <span>{alert.whyYouSeeThis}</span>}</div>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button type="button" onClick={() => onAction(alert)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-95" style={{ background: alert.actionColor, boxShadow: `0 4px 12px ${alert.actionColor}40` }}><Check className="w-4 h-4" />{alert.action}</button>
          <button type="button" onClick={() => onSnooze(alert.id)} className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-medium text-[#a1a1aa] hover:text-white bg-[#27272a] hover:bg-[#3f3f46] transition-all"><Clock3 className="w-4 h-4" />Snooze</button>
          <button type="button" onClick={() => onDismiss(alert.id)} className="px-3.5 py-2 rounded-xl text-[13px] font-medium text-[#71717a] hover:text-white transition-all">Dismiss</button>
        </div>
      </div>}
    </article>
  );
}

export function SmartAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [feedSource, setFeedSource] = useState("demo");
  const [toast, setToast] = useState(null);
  const [undoSnapshot, setUndoSnapshot] = useState(null);
  const [holdings, setHoldings] = useState(readHoldings);
  const [holdingSymbol, setHoldingSymbol] = useState("");
  const [holdingName, setHoldingName] = useState("");
  const [holdingQuantity, setHoldingQuantity] = useState("");

  const loadAlerts = async (portfolio = holdings) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (portfolio.length) params.set("holdings", JSON.stringify(portfolio));
      const response = await fetch(`/api/alerts?${params}`);
      if (!response.ok) throw new Error("Could not load alerts");
      const data = await response.json();
      setAlerts(Array.isArray(data.alerts) ? data.alerts : []);
      setFeedSource(data.source === "live" ? "live" : "manual");
    } catch {
      setToast({ message: "The market service is unavailable. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadAlerts(); }, []);
  useEffect(() => { localStorage.setItem(HOLDINGS_STORAGE_KEY, JSON.stringify(holdings)); }, [holdings]);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filtered = useMemo(() => alerts.filter((alert) => {
    const term = query.trim().toLowerCase();
    return (activeFilter === "All" || alert.category === activeFilter) && (!term || [alert.title, alert.subtitle, alert.ticker, alert.category].join(" ").toLowerCase().includes(term));
  }), [alerts, activeFilter, query]);
  const saveUndo = (nextAlerts, message) => { setUndoSnapshot(alerts); setAlerts(nextAlerts); setToast({ message, undo: true }); };
  const dismiss = (id) => saveUndo(alerts.filter((alert) => alert.id !== id), "Alert dismissed");
  const snooze = (id) => saveUndo(alerts.filter((alert) => alert.id !== id), "Alert snoozed for 24 hours");
  const dismissAll = () => saveUndo([], "All alerts dismissed");
  const restore = () => { if (undoSnapshot) { setAlerts(undoSnapshot); setUndoSnapshot(null); setToast({ message: "Alerts restored" }); } };
  const handleAction = (alert) => { if (alert.sourceUrl) window.open(alert.sourceUrl, "_blank", "noopener,noreferrer"); saveUndo(alerts.filter((item) => item.id !== alert.id), `${alert.action} opened — alert marked complete`); };
  const addHolding = (event) => {
    event.preventDefault();
    const symbol = holdingSymbol.trim().toUpperCase();
    const quantity = Number(holdingQuantity);
    if (!/^[A-Z0-9._-]{1,20}$/.test(symbol) || !Number.isFinite(quantity) || quantity <= 0) {
      setToast({ message: "Enter a valid ticker and share quantity." });
      return;
    }
    const nextHoldings = [...holdings.filter((holding) => holding.symbol !== symbol), { symbol, name: holdingName.trim() || symbol, quantity }];
    setHoldings(nextHoldings);
    setHoldingSymbol(""); setHoldingName(""); setHoldingQuantity("");
    loadAlerts(nextHoldings);
    setToast({ message: `${symbol} is now monitored` });
  };
  const removeHolding = (symbol) => {
    const nextHoldings = holdings.filter((holding) => holding.symbol !== symbol);
    setHoldings(nextHoldings);
    loadAlerts(nextHoldings);
    setToast({ message: `${symbol} removed from monitoring` });
  };
  const stats = [{ label: "Total alerts", value: alerts.length, color: "#a1a1aa" }, { label: "Urgent", value: alerts.filter((a) => a.severity === "urgent").length, color: "#ef4444" }, { label: "Warnings", value: alerts.filter((a) => a.severity === "warning").length, color: "#f59e0b" }, { label: "Portfolio", value: alerts.filter((a) => a.category === "Portfolio").length, color: "#8b5cf6" }];

  return <div className="max-w-[1000px] mx-auto px-5 sm:px-8 py-8 sm:py-10 pb-20">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-5 mb-6 animate-fade-in-up">
      <div><p className="text-[#3b82f6] text-[11px] font-bold tracking-[0.12em] mb-2 uppercase">Monitoring · {isLoading ? "Syncing" : feedSource === "live" ? "Live market feed" : "Manual portfolio feed"}</p><h1 className="text-[34px] sm:text-[38px] font-semibold text-white tracking-[-0.025em] mb-2 leading-none">Smart Alerts</h1><p className="text-[#71717a] text-[15px]">Portfolio-aware financial signals that need your attention.</p></div>
      <div className="flex gap-2">{alerts.length > 0 && <button type="button" onClick={dismissAll} className="text-[13px] font-medium text-[#71717a] hover:text-white flex items-center gap-2 px-4 py-2 rounded-xl bg-[#18181b] border border-[#27272a]"><X className="w-4 h-4" />Dismiss all</button>}<button type="button" onClick={loadAlerts} className="text-[13px] font-medium text-[#a1a1aa] hover:text-white flex items-center gap-2 px-4 py-2 rounded-xl bg-[#18181b] border border-[#27272a]"><RotateCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />Refresh</button></div>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 animate-fade-in-up stagger-1">{stats.map(({ label, value, color }) => <div key={label} className="bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3 text-center"><div className="text-2xl font-bold stat-number" style={{ color }}>{value}</div><div className="text-[11px] text-[#71717a] font-medium mt-0.5">{label}</div></div>)}</div>
    <section className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4"><div><h2 className="text-white font-semibold">Your monitored holdings</h2><p className="text-[#71717a] text-[13px] mt-1">Add stocks here—no broker account or PAN needed. They stay in this browser.</p></div><span className="badge badge-blue">{holdings.length} tracked</span></div>
      <form onSubmit={addHolding} className="grid grid-cols-1 sm:grid-cols-[1fr_1.3fr_.8fr_auto] gap-2"><input value={holdingSymbol} onChange={(event) => setHoldingSymbol(event.target.value)} placeholder="Ticker (e.g. NVDA)" className="input-base px-3 py-2.5" required /><input value={holdingName} onChange={(event) => setHoldingName(event.target.value)} placeholder="Company name (optional)" className="input-base px-3 py-2.5" /><input value={holdingQuantity} onChange={(event) => setHoldingQuantity(event.target.value)} placeholder="Shares" min="0.0001" step="any" type="number" className="input-base px-3 py-2.5" required /><button type="submit" className="btn-primary flex items-center justify-center gap-2 px-4 py-2.5"><Plus className="w-4 h-4" />Add</button></form>
      <p className="text-[11px] text-[#52525b] mt-2">Use BSE symbols such as RELIANCE.BSE for Alpha Vantage price data. Live news works best for compatible US ticker symbols.</p>
      {holdings.length > 0 && <div className="flex flex-wrap gap-2 mt-4">{holdings.map((holding) => <span key={holding.symbol} className="inline-flex items-center gap-2 rounded-lg bg-[#27272a] pl-3 pr-2 py-1.5 text-[12px] text-[#e4e4e7]"><strong>{holding.symbol}</strong><span className="text-[#71717a]">{holding.quantity} shares</span><button type="button" aria-label={`Remove ${holding.symbol}`} onClick={() => removeHolding(holding.symbol)} className="rounded p-1 text-[#71717a] hover:text-[#ef4444]"><Trash2 className="w-3.5 h-3.5" /></button></span>)}</div>}
    </section>
    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6 animate-fade-in-up stagger-2"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search alerts or tickers" aria-label="Search alerts" className="input-base w-full py-2.5 pl-9 pr-3" /></div><div className="flex gap-2 flex-wrap">{FILTER_TABS.map((tab) => <button type="button" key={tab} onClick={() => setActiveFilter(tab)} className={`px-3.5 py-2.5 rounded-xl text-[13px] font-medium border transition-all ${activeFilter === tab ? "bg-[#27272a] text-white border-[#3f3f46]" : "bg-transparent text-[#71717a] border-[#27272a] hover:text-[#a1a1aa]"}`}>{tab}</button>)}</div></div>
    <div className="space-y-3">{isLoading ? <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-12 text-center text-sm text-[#71717a]">Syncing your portfolio alerts…</div> : filtered.length === 0 ? <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-12 flex flex-col items-center justify-center text-center"><div className="w-14 h-14 rounded-2xl bg-[#22c55e]/10 flex items-center justify-center mb-4"><ShieldCheck className="w-7 h-7 text-[#22c55e]" /></div><h3 className="text-white font-semibold text-lg mb-2">{alerts.length ? "Nothing matches" : "All clear!"}</h3><p className="text-[#71717a] text-sm">{alerts.length ? "Try a different search or category." : "You're up to date. New signals will appear here."}</p></div> : filtered.map((alert) => <AlertCard key={alert.id} alert={alert} onDismiss={dismiss} onSnooze={snooze} onAction={handleAction} />)}</div>
    {toast && <div role="status" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-xl border border-[#3f3f46] bg-[#18181b] px-4 py-3 shadow-[0_12px_32px_rgba(0,0,0,.55)] animate-fade-in"><Bell className="w-4 h-4 text-[#60a5fa]" /><span className="text-sm text-[#e4e4e7]">{toast.message}</span>{toast.undo && <button type="button" onClick={restore} className="text-sm font-semibold text-[#60a5fa] hover:text-white">Undo</button>}</div>}
  </div>;
}
