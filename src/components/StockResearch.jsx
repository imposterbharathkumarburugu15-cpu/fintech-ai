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

const QUICK_SEARCHES = ["AAPL", "NVDA", "TSLA", "MSFT", "RELIANCE.NS"];

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

function StockResearch() {
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inputVal, setInputVal] = useState("");

  // Reusable core engine to query your Node/Express server node
  const fetchStockData = async (tickerSymbol) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/stock/${tickerSymbol}`);
      if (!response.ok) {
        throw new Error("Ticker symbol not found or network threshold failed.");
      }
      const data = await response.json();
      setStock(data);
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Something went wrong fetching market execution models.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Run automatically on first mount to populate dashboard layout
  useEffect(() => {
    fetchStockData("AAPL");
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
        <div className="flex items-center gap-2 text-[12px] text-[#71717a]">
          <Globe className="w-4 h-4" />
          <span>NYSE · NASDAQ · NSE · BSE</span>
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
            placeholder="Search — AAPL, NVDA, RELIANCE.NS, INFY.NS..."
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
                    {stock.exchange.toLowerCase().includes("nse") ||
                    stock.ticker.endsWith(".NS")
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
                        {stock.exchange.toLowerCase().includes("nse") ||
                        stock.ticker.endsWith(".NS")
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
                          {c.ticker.endsWith(".NS")
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
