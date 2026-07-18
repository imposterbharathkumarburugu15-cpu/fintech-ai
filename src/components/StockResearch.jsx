import { useState, useEffect } from "react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Sparkles,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  ShieldAlert,
  Users,
} from "lucide-react";

const QUICK_SEARCHES = ["AAPL", "NVDA", "TSLA", "MSFT", "GOOGL"];

function MetricRow({ label, value, last = false }) {
  return (
    <div
      className={`flex justify-between items-center py-3 ${!last ? "border-b border-[#27272a]" : ""}`}
    >
      <span className="text-[#71717a] text-[13px]">{label}</span>
      <span className="text-white font-semibold text-[13px] font-mono">
        {value}
      </span>
    </div>
  );
}

function NseStat({ label, value, color }) {
  return (
    <div className="border-r border-[#27272a] px-3 last:border-0">
      <p className="flex items-center gap-2 text-[11px] text-[#71717a]">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ background: color }}
        />
        {label}
      </p>
      <p className="mt-1 font-semibold text-white font-mono">{value}</p>
    </div>
  );
}

function NseLikeChart({ positive }) {
  const green = "#0c8a24";
  const red = "#c93b43";
  const color = positive ? green : red;
  const line = positive
    ? "M15 190 L32 188 L43 148 L58 137 L72 121 L86 131 L104 106 L122 115 L140 95 L157 112 L174 90 L190 100 L208 78 L227 102 L244 92 L264 73 L281 86 L298 70 L317 92 L336 74 L354 84 L373 61 L391 78 L410 56 L428 75 L445 43 L463 62 L480 41 L499 56 L516 29 L535 48 L552 35 L570 50 L589 25 L607 42 L625 20"
    : "M15 57 L32 61 L43 83 L58 72 L72 102 L86 91 L104 120 L122 110 L140 135 L157 119 L174 148 L190 132 L208 158 L227 147 L244 174 L264 154 L281 181 L298 166 L317 191 L336 175 L354 197 L373 183 L391 205 L410 191 L428 211 L445 198 L463 219 L480 205 L499 228 L516 213 L535 233 L552 220 L570 239 L589 226 L607 245 L625 230";
  return (
    <div className="mt-4 h-48 w-full">
      <svg
        className="h-full w-full"
        viewBox="0 0 640 250"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="nseStockFill" x1="0" x2="0" y1="0" y2="1">
            <stop
              stopColor={positive ? "#22c55e" : "#ef4444"}
              stopOpacity=".15"
            />
            <stop
              offset="1"
              stopColor={positive ? "#22c55e" : "#ef4444"}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>
        {[35, 75, 115, 155, 195, 235].map((y) => (
          <path
            key={y}
            d={`M15 ${y} H625`}
            stroke="#27272a"
            strokeDasharray="4 4"
          />
        ))}
        <path d={`${line} L625 235 L15 235 Z`} fill="url(#nseStockFill)" />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
        />
        <path d="M15 235 H625" stroke="#27272a" strokeWidth="1" />
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-[#52525b] font-mono">
        <span>09:15</span>
        <span>10:30</span>
        <span>12:00</span>
        <span>13:30</span>
        <span>15:30</span>
      </div>
    </div>
  );
}

function StockResearch() {
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inputVal, setInputVal] = useState("");
  const API_URL = import.meta.env.VITE_API_URL; 

  const fetchStockData = async (tickerSymbol) => {
    setLoading(true);
    setError(null);
    try {
<<<<<<< HEAD
      const response = await fetch(`/api/stock/${tickerSymbol}`);

      // Extract the server payload first to see what it sent us
=======
     const response = await fetch(   `${API_URL}/api/stock/${encodeURIComponent(tickerSymbol)}` );;
      if (!response.ok) {
        throw new Error("Ticker symbol not found or network threshold failed.");
      }
>>>>>>> origin/main
      const data = await response.json();

      if (!response.ok) {
        // Bubble up the real custom DEBUG SYSTEM ERROR string from Node!
        throw new Error(
          data.error || "Ticker symbol not found or network threshold failed.",
        );
      }

      setStock(data);
    } catch (err) {
      console.error("Frontend Data Core Error Catch:", err);
      setError(
        err.message || "Something went wrong fetching market execution models.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Run automatically on first mount to populate dashboard layout
  useEffect(() => {
    // Check if another component passed a stock selection in sessionStorage
    const selectedFromMarket = window.sessionStorage.getItem(
      "finpilot-selected-stock",
    );
    if (selectedFromMarket) {
      fetchStockData(selectedFromMarket);
      window.sessionStorage.removeItem("finpilot-selected-stock"); // clear to prevent loops
    } else {
      fetchStockData("AAPL");
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const cleanTicker = inputVal.trim();
    if (cleanTicker) {
      fetchStockData(cleanTicker);
      setInputVal("");
    }
  };

  return (
    <div className="max-w-[1080px] mx-auto flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-end mb-6 animate-fade-in-up">
        <div>
          <p className="text-[#3b82f6] text-[11px] font-bold tracking-[0.12em] mb-2 uppercase">
            Research
          </p>
          <h1 className="text-[38px] font-semibold text-white tracking-[-0.025em] mb-2 leading-none">
            Stock Research Hub
          </h1>
          <p className="text-[#71717a] text-[15px]">
            AI-powered company analysis — US & Indian markets.
          </p>
        </div>
      </div>

      {/* Search Bar Input Form */}
      <form
        onSubmit={handleSearch}
        className="mb-2 animate-fade-in-up stagger-1"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Search — AAPL, NVDA, GOOGL, INFY.NS..."
            className="w-full bg-[#18181b] border border-[#27272a] rounded-xl pl-11 pr-32 py-3.5 text-[14px] text-white placeholder:text-[#52525b] focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] text-white text-[13px] font-semibold transition-all disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {/* Quick switches tags */}
      <div className="flex gap-2 mb-6 animate-fade-in-up stagger-1">
        {QUICK_SEARCHES.map((sym) => (
          <button
            key={sym}
            onClick={() => fetchStockData(sym)}
            disabled={loading}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${
              stock?.ticker === sym.toUpperCase()
                ? "bg-[#3b82f6]/10 border-[#3b82f6]/40 text-[#60a5fa]"
                : "bg-[#18181b] border-[#27272a] text-[#71717a] hover:text-white hover:border-[#3f3f46]"
            } disabled:opacity-50`}
          >
            {sym.replace(".NS", "")}
          </button>
        ))}
      </div>

      {/* Async Loading Pipeline State UI */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center py-20 bg-[#18181b] border border-[#27272a] rounded-2xl">
          <div className="w-8 h-8 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[#a1a1aa] text-[14px]">
            FinPilot AI is compiling real-time global market forensics...
          </p>
        </div>
      )}

      {/* Async Error Boundary Fallback Screen */}
      {!loading && error && (
        <div className="flex-1 flex flex-col items-center justify-center py-20 bg-[#18181b] border border-red-900/30 rounded-2xl text-center px-4">
          <p className="text-red-400 font-semibold text-[15px] mb-2">
            Error Processing Financial Node
          </p>
          <p className="text-[#71717a] text-[13px] max-w-md">{error}</p>
          <button
            onClick={() => fetchStockData("AAPL")}
            className="mt-4 px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-white rounded-lg text-[12px] transition-all"
          >
            Reset Dashboard
          </button>
        </div>
      )}

      {/* Core Stock Graphics Platform Frame Layout */}
      {!loading && !error && stock && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in-up stagger-2">
          {/* Main Panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* NSE-style live market chart */}
            <div className="rounded-2xl border border-[#27272a] bg-[#18181b] p-5 text-white shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#27272a] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${stock.positive ? "bg-[#22c55e]" : "bg-[#ef4444]"}`}
                    />
                    <b className="text-base font-semibold">
                      {stock.ticker} • Market View
                    </b>
                    <span className="rounded bg-[#22c55e]/10 px-2 py-0.5 text-[9px] font-bold text-[#22c55e]">
                      LIVE
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#71717a]">
                    Open, high, low and intraday price action
                  </p>
                </div>
                <div className="flex rounded-lg bg-[#27272a] p-1">
                  {["1D", "1M", "3M", "6M", "1Y"].map((range, index) => (
                    <button
                      key={range}
                      className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${index === 0 ? "bg-[#3b82f6] text-white" : "text-[#71717a] hover:text-white"}`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-y-3 text-sm sm:grid-cols-4 border-b border-[#27272a] pb-4">
                <NseStat
                  label="Open"
                  value={
                    typeof stock.price === "number"
                      ? stock.price.toFixed(2)
                      : stock.price
                  }
                  color="#3b82f6"
                />
                <NseStat
                  label="High"
                  value={
                    typeof stock.price === "number"
                      ? (stock.price * 1.01).toFixed(2)
                      : stock.price
                  }
                  color="#22c55e"
                />
                <NseStat
                  label="Low"
                  value={
                    typeof stock.price === "number"
                      ? (stock.price * 0.99).toFixed(2)
                      : stock.price
                  }
                  color="#ef4444"
                />
                <NseStat
                  label="Change"
                  value={
                    typeof stock.change === "number"
                      ? `${stock.change.toFixed(2)}%`
                      : stock.change
                  }
                  color={stock.positive ? "#22c55e" : "#ef4444"}
                />
              </div>

              <NseLikeChart positive={stock.positive} />
            </div>

            {/* Company Title Banner Card */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6">
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3b82f6]/20 to-[#8b5cf6]/20 border border-[#3b82f6]/20 flex items-center justify-center text-xl font-black text-white">
                    {stock.ticker?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white leading-tight">
                      {stock.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#3b82f6]/10 text-[#60a5fa] border border-[#3b82f6]/20 uppercase">
                        {stock.exchange}
                      </span>
                      <span className="text-[12px] text-[#71717a]">
                        {stock.sector}
                      </span>
                      <span className="text-[#27272a]">·</span>
                      <span className="text-[12px] text-[#71717a]">
                        {stock.industry}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {stock.exchange?.toLowerCase().includes("nse") ||
                    stock.ticker?.endsWith(".NS")
                      ? "₹"
                      : "$"}
                    {typeof stock.price === "number"
                      ? stock.price.toFixed(2)
                      : stock.price}
                  </div>
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[13px] font-semibold ${stock.positive ? "text-[#22c55e]" : "text-[#ef4444]"}`}
                  >
                    {stock.positive ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {typeof stock.change === "number"
                      ? `${stock.change.toFixed(2)}%`
                      : stock.change}{" "}
                    Today
                  </div>
                </div>
              </div>

              {/* AI Narrative Context Container */}
              <div className="bg-[#0f0f11] rounded-xl p-4 border border-[#27272a]">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
                  <span className="text-[12px] font-semibold text-[#8b5cf6] uppercase tracking-wider">
                    AI Company Summary
                  </span>
                </div>
                <p className="text-[13px] text-[#a1a1aa] leading-relaxed">
                  {stock.summary}
                </p>
              </div>
            </div>

            {/* Bull vs Bear Assessment Layout Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 border-l-4 border-l-[#22c55e]">
                <h4 className="text-[#22c55e] font-semibold mb-3 flex items-center gap-2 text-[14px]">
                  <TrendingUp className="w-4 h-4" /> Bull Case
                </h4>
                <ul className="space-y-2">
                  {stock.bull?.map((pt, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-[13px] text-[#a1a1aa] leading-relaxed"
                    >
                      <span className="w-1 h-1 rounded-full bg-[#22c55e] shrink-0 mt-2" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 border-l-4 border-l-[#ef4444]">
                <h4 className="text-[#ef4444] font-semibold mb-3 flex items-center gap-2 text-[14px]">
                  <TrendingDown className="w-4 h-4" /> Bear Case
                </h4>
                <ul className="space-y-2">
                  {stock.bear?.map((pt, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-[13px] text-[#a1a1aa] leading-relaxed"
                    >
                      <span className="w-1 h-1 rounded-full bg-[#ef4444] shrink-0 mt-2" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* SWOT Matrices Framework Grid */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-4 h-4 text-[#f59e0b]" />
                <h3 className="text-white font-semibold text-[14px]">
                  SWOT Analysis
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  {
                    label: "Strengths",
                    items: stock.swot?.strengths || [],
                    color: "#22c55e",
                    bg: "rgba(34,197,94,0.04)",
                  },
                  {
                    label: "Weaknesses",
                    items: stock.swot?.weaknesses || [],
                    color: "#ef4444",
                    bg: "rgba(239,68,68,0.04)",
                  },
                  {
                    label: "Opportunities",
                    items: stock.swot?.opportunities || [],
                    color: "#3b82f6",
                    bg: "rgba(59,130,246,0.04)",
                  },
                  {
                    label: "Threats",
                    items: stock.swot?.threats || [],
                    color: "#f59e0b",
                    bg: "rgba(245,158,11,0.04)",
                  },
                ].map(({ label, items, color, bg }) => (
                  <div
                    key={label}
                    className="rounded-xl p-3 border border-[#27272a]"
                    style={{ background: bg }}
                  >
                    <p
                      className="text-[11px] font-bold uppercase tracking-wider mb-2"
                      style={{ color }}
                    >
                      {label}
                    </p>
                    <ul className="space-y-1.5">
                      {items.map((item, i) => (
                        <li
                          key={i}
                          className="text-[12px] text-[#a1a1aa] flex gap-1.5"
                        >
                          <span
                            className="w-1 h-1 rounded-full shrink-0 mt-1.5"
                            style={{ background: color }}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Competitor Peer Database Grid Frame */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-[#3b82f6]" />
                <h3 className="text-white font-semibold text-[14px]">
                  Competitor Comparison
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-[#27272a]">
                      <th className="text-left text-[11px] text-[#52525b] font-semibold uppercase tracking-wider pb-2">
                        Company
                      </th>
                      <th className="text-right text-[11px] text-[#52525b] font-semibold uppercase tracking-wider pb-2">
                        Price
                      </th>
                      <th className="text-right text-[11px] text-[#52525b] font-semibold uppercase tracking-wider pb-2">
                        P/E
                      </th>
                      <th className="text-right text-[11px] text-[#52525b] font-semibold uppercase tracking-wider pb-2">
                        Mkt Cap
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#27272a] bg-[#3b82f6]/5">
                      <td className="py-3 font-semibold text-white">
                        {stock.ticker}{" "}
                        <span className="text-[10px] text-[#3b82f6] ml-1 font-normal">
                          (selected)
                        </span>
                      </td>
                      <td className="py-3 text-right text-white font-mono">
                        {stock.exchange?.toLowerCase().includes("nse") ||
                        stock.ticker?.endsWith(".NS")
                          ? "₹"
                          : "$"}
                        {typeof stock.price === "number"
                          ? stock.price.toFixed(2)
                          : stock.price}
                      </td>
                      <td className="py-3 text-right text-white font-mono">
                        {stock.pe}
                        {stock.pe !== "N/A" ? "x" : ""}
                      </td>
                      <td className="py-3 text-right text-white font-mono">
                        {stock.marketCap}
                      </td>
                    </tr>
                    {stock.competitors?.map((c) => (
                      <tr
                        key={c.ticker}
                        className="border-b border-[#27272a] last:border-0 hover:bg-[#1a1a1d] transition-colors cursor-pointer"
                        onClick={() => fetchStockData(c.ticker)}
                      >
                        <td className="py-3 text-[#a1a1aa] font-medium hover:text-[#3b82f6] transition-colors">
                          {c.name}{" "}
                          <span className="text-[#52525b] text-[11px] font-normal font-mono">
                            {c.ticker}
                          </span>
                        </td>
                        <td className="py-3 text-right text-[#a1a1aa] font-mono">
                          {c.ticker?.endsWith(".NS")
                            ? "₹"
                            : typeof c.price === "number"
                              ? "$"
                              : ""}
                          {typeof c.price === "number"
                            ? c.price.toFixed(2)
                            : c.price}
                        </td>
                        <td className="py-3 text-right text-[#a1a1aa] font-mono">
                          {c.pe}
                          {c.pe !== "N/A" &&
                          typeof c.pe === "string" &&
                          !c.pe.includes("x")
                            ? "x"
                            : ""}
                        </td>
                        <td className="py-3 text-right text-[#a1a1aa] font-mono">
                          {c.mktCap}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Panel */}
          <div className="space-y-4">
            {/* Financial Metrics Stack */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <BarChart2 className="w-4 h-4 text-[#71717a]" />
                <h3 className="text-white font-semibold text-[14px]">
                  Financial Metrics
                </h3>
              </div>
              <div>
                <MetricRow label="Market Cap" value={stock.marketCap} />
                <MetricRow
                  label="P/E Ratio"
                  value={
                    stock.pe !== "N/A" && !stock.pe.endsWith("x")
                      ? `${stock.pe}x`
                      : stock.pe
                  }
                />
                <MetricRow label="EPS (TTM)" value={stock.eps} />
                <MetricRow label="Revenue" value={stock.revenue} />
                <MetricRow label="Div Yield" value={stock.divYield} />
                <MetricRow label="Beta" value={stock.beta} />
                <MetricRow label="52W Range" value={stock.week52} last />
              </div>
            </div>

            {/* Latest News Feeds Card */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5">
              <h3 className="text-white font-semibold text-[14px] mb-3">
                Latest News
              </h3>
              <div className="space-y-3">
                {stock.news?.map((n, i) => (
                  <div
                    key={i}
                    className="flex gap-3 pb-3 border-b border-[#27272a] last:border-0 last:pb-0"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] shrink-0 mt-1.5" />
                    <div>
                      <p className="text-[13px] text-[#e4e4e7] leading-snug font-medium">
                        {n.headline}
                      </p>
                      <p className="text-[11px] text-[#52525b] mt-1 font-mono">
                        {n.time}
                      </p>
                    </div>
                  </div>
                ))}
                {(!stock.news || stock.news.length === 0) && (
                  <p className="text-[12px] text-[#52525b]">
                    No recent public news entries logged.
                  </p>
                )}
              </div>
            </div>

            {/* Live Operational Risk Calibration Profile */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5">
              <h3 className="text-white font-semibold text-[14px] mb-3">
                Risk Profile
              </h3>
              {[
                {
                  label: "Volatility",
                  value:
                    parseFloat(stock.beta) > 1.5
                      ? 80
                      : parseFloat(stock.beta) > 1.0
                        ? 55
                        : isNaN(parseFloat(stock.beta))
                          ? 0
                          : 35,
                  color: "#f59e0b",
                },
                {
                  label: "Valuation Risk",
                  value:
                    parseFloat(stock.pe) > 50
                      ? 80
                      : parseFloat(stock.pe) > 30
                        ? 55
                        : isNaN(parseFloat(stock.pe))
                          ? 0
                          : 35,
                  color: "#ef4444",
                },
                {
                  label: "Growth Score",
                  value: parseFloat(stock.beta) > 1.5 ? 85 : 68,
                  color: "#22c55e",
                },
              ].map(({ label, value, color }) => (
                <div key={label} className="mb-3 last:mb-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-[12px] text-[#71717a]">{label}</span>
                    <span
                      className="text-[12px] font-semibold"
                      style={{ color }}
                    >
                      {value}/100
                    </span>
                  </div>
                  <div className="w-full bg-[#27272a] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{ width: `${value}%`, background: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { StockResearch };
