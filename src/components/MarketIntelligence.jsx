import React, { useState } from "react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { ArrowUpRight, ArrowDownRight, Activity, Search, Globe, TrendingUp, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const INDICES = [
  { id: "sp500", name: "S&P 500", exchange: "US", price: "5,438.50", change: "+0.52%", positive: true, data: [{ t: "9:30", v: 5410 }, { t: "11:00", v: 5422 }, { t: "13:00", v: 5425 }, { t: "16:00", v: 5438 }], color: "#22c55e" },
  { id: "nasdaq", name: "NASDAQ", exchange: "US", price: "17,970.20", change: "+0.85%", positive: true, data: [{ t: "9:30", v: 17820 }, { t: "11:00", v: 17890 }, { t: "13:00", v: 17910 }, { t: "16:00", v: 17970 }], color: "#22c55e" },
  { id: "nifty50", name: "NIFTY 50", exchange: "IN", price: "24,502.15", change: "+0.34%", positive: true, data: [{ t: "9:15", v: 24380 }, { t: "11:00", v: 24455 }, { t: "13:00", v: 24460 }, { t: "15:30", v: 24502 }], color: "#22c55e" },
  { id: "sensex", name: "SENSEX", exchange: "IN", price: "80,519.34", change: "-0.12%", positive: false, data: [{ t: "9:15", v: 80620 }, { t: "11:00", v: 80550 }, { t: "13:00", v: 80570 }, { t: "15:30", v: 80519 }], color: "#ef4444" },
  { id: "bitcoin", name: "BTC-USD", exchange: "Crypto", price: "$65,920.00", change: "+1.20%", positive: true, data: [{ t: "9:30", v: 65120 }, { t: "11:00", v: 65280 }, { t: "13:00", v: 65150 }, { t: "16:00", v: 65920 }], color: "#f59e0b" },
];

const TRENDING = [
  { sym: "NVDA", name: "NVIDIA", price: "875.40", change: "+2.34%", positive: true },
  { sym: "AAPL", name: "Apple Inc.", price: "214.32", change: "+1.24%", positive: true },
  { sym: "TCS", name: "Tata Consultancy", price: "3920.00", change: "-0.43%", positive: false },
  { sym: "TSLA", name: "Tesla Inc.", price: "248.10", change: "+3.10%", positive: true },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#18181b]/90 backdrop-blur-md border border-[#27272a] rounded-lg px-3 py-2 shadow-2xl">
      <p className="text-[11px] text-[#71717a] font-mono mb-0.5">{label}</p>
      <p className="text-[13px] font-bold text-white font-mono">{payload[0].value?.toLocaleString()}</p>
    </div>
  );
}

function MiniChart({ data, color }) {
  return (
    <div className="h-10 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#grad-${color})`} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Simulated Marquee Ticker
function TickerTape() {
  const tickerItems = [...INDICES, ...TRENDING, ...INDICES]; // Duplicate for seamless scroll
  return (
    <div className="w-full bg-[#09090b] border-b border-[#1e1e22] py-2.5 overflow-hidden flex whitespace-nowrap z-20 relative">
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#09090b] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#09090b] to-transparent z-10" />
      <motion.div
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
        className="flex gap-8 px-4"
      >
        {tickerItems.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-white tracking-wider">{item.sym || item.id.toUpperCase()}</span>
            <span className="text-[12px] font-mono text-[#a1a1aa]">{item.price}</span>
            <span className={`text-[11px] font-bold font-mono ${item.positive ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
              {item.change}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function MarketIntelligence() {
  const [activeId, setActiveId] = useState("sp500");
  const [searchQuery, setSearchQuery] = useState("");
  const activeIndex = INDICES.find((i) => i.id === activeId);

  return (
    <div className="flex flex-col h-full bg-[#09090b]">
      
      {/* Ticker Tape */}
      <TickerTape />

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-[1080px] mx-auto">
          {/* Header */}
          <div className="flex justify-between items-end mb-8 animate-fade-in-up">
            <div>
              <p className="text-[#3b82f6] text-[11px] font-bold tracking-[0.15em] mb-2 uppercase flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" /> Market Terminal
              </p>
              <h1 className="text-[34px] font-semibold text-white tracking-[-0.03em] mb-1 leading-none">
                Market Intelligence
              </h1>
              <p className="text-[#a1a1aa] text-[15px]">Bloomberg-style global indices & stock research.</p>
            </div>
            
            <div className="relative w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
              <input
                type="text"
                placeholder="Search Ticker (e.g. AAPL, INFY)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121214] border border-[#27272a] rounded-full pl-10 pr-4 py-2.5 text-[13px] text-white placeholder:text-[#52525b] focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all font-mono"
              />
            </div>
          </div>

          {/* Indices Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6 animate-fade-in-up stagger-1">
            {INDICES.map((idx) => (
              <button
                key={idx.id}
                onClick={() => setActiveId(idx.id)}
                className={`text-left p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
                  activeId === idx.id
                    ? "border-[#3b82f6]/50 bg-[#121214] shadow-[0_0_30px_rgba(59,130,246,0.1)]"
                    : "border-[#27272a] bg-[#0f0f11] hover:border-[#3f3f46] hover:bg-[#121214]"
                }`}
              >
                {activeId === idx.id && <div className="absolute inset-0 bg-[#3b82f6]/5 opacity-100 transition-opacity" />}
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[11px] font-bold text-[#71717a] uppercase tracking-wider">{idx.exchange}</span>
                    <span className={`text-[11px] font-bold font-mono flex items-center ${idx.positive ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                      {idx.positive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                      {idx.change}
                    </span>
                  </div>
                  <h3 className="text-[14px] font-semibold text-white mb-0.5">{idx.name}</h3>
                  <p className="text-[16px] font-bold text-white font-mono tracking-tight">{idx.price}</p>
                </div>
                <MiniChart data={idx.data} color={idx.color} />
              </button>
            ))}
          </div>

          {/* Main Chart Section */}
          <div className="bg-[#0f0f11] border border-[#27272a] rounded-3xl p-8 mb-6 relative overflow-hidden animate-fade-in-up stagger-2 shadow-xl">
            {/* Vercel-like Glow */}
            <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-[#3b82f6]/10 blur-[100px] pointer-events-none rounded-full translate-y-[-50%]" />
            
            <div className="relative z-10 flex justify-between items-start mb-8">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#27272a] to-[#18181b] border border-[#3f3f46] flex items-center justify-center">
                  <Activity className="w-5 h-5 text-[#a1a1aa]" />
                </div>
                <div>
                  <h2 className="text-[22px] font-bold text-white tracking-tight leading-none mb-2">{activeIndex.name}</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-[18px] text-white font-mono font-semibold">{activeIndex.price}</span>
                    <span className={`text-[13px] font-bold font-mono flex items-center ${activeIndex.positive ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                      {activeIndex.positive ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                      {activeIndex.change} Today
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex bg-[#18181b] p-1 rounded-xl border border-[#27272a]">
                {["1D", "1W", "1M", "YTD", "ALL"].map((tf) => (
                  <button key={tf} className={`px-4 py-1.5 rounded-lg text-[12px] font-bold tracking-wide transition-all ${tf === "1D" ? "bg-[#27272a] text-white shadow-sm" : "text-[#71717a] hover:text-[#a1a1aa]"}`}>
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[320px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeIndex.data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mainGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="t" axisLine={false} tickLine={false} tick={{ fill: "#52525b", fontSize: 11, fontFamily: "monospace" }} dy={10} />
                  <YAxis domain={["auto", "auto"]} axisLine={false} tickLine={false} tick={{ fill: "#52525b", fontSize: 11, fontFamily: "monospace" }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#3f3f46", strokeWidth: 1, strokeDasharray: "4 4" }} />
                  <Area type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#mainGrad)" activeDot={{ r: 5, fill: "#fff", stroke: "#3b82f6", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up stagger-3">
            
            {/* Fear & Greed */}
            <div className="bg-[#0f0f11] border border-[#27272a] rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#f59e0b]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-white font-semibold text-[15px]">Fear & Greed</h3>
                <TrendingUp className="w-4 h-4 text-[#f59e0b]" />
              </div>
              <div className="flex flex-col items-center justify-center relative z-10">
                <div className="relative w-28 h-28 mb-4">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#27272a" strokeWidth="8" fill="none" strokeDasharray="125 251" strokeDashoffset="-125" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="40" stroke="#f59e0b" strokeWidth="8" fill="none" strokeDasharray="170 251" strokeDashoffset="-125" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 8px rgba(245,158,11,0.4))" }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                    <span className="text-2xl font-bold text-white font-mono">68</span>
                  </div>
                </div>
                <span className="text-[#f59e0b] font-bold text-[15px] uppercase tracking-wider mb-1">Greed</span>
                <p className="text-[12px] text-[#71717a] text-center max-w-[180px]">Market momentum is exceptionally strong. Exercise caution.</p>
              </div>
            </div>

            {/* Trending Equities Table */}
            <div className="lg:col-span-2 bg-[#0f0f11] border border-[#27272a] rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-[15px]">Trending Equities</h3>
                <button className="text-[#3b82f6] text-[12px] font-bold hover:text-[#60a5fa] transition-colors">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-[#27272a]">
                      <th className="text-left text-[#52525b] font-bold uppercase tracking-wider pb-3 font-mono text-[10px]">Ticker</th>
                      <th className="text-right text-[#52525b] font-bold uppercase tracking-wider pb-3 font-mono text-[10px]">Price</th>
                      <th className="text-right text-[#52525b] font-bold uppercase tracking-wider pb-3 font-mono text-[10px]">24H Change</th>
                      <th className="text-right text-[#52525b] font-bold uppercase tracking-wider pb-3 font-mono text-[10px]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TRENDING.map((s, i) => (
                      <tr key={s.sym} className="border-b border-[#1e1e22] last:border-0 hover:bg-[#121214] transition-colors group cursor-pointer">
                        <td className="py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[10px] font-bold text-white group-hover:border-[#3b82f6]/30 transition-colors">
                              {s.sym.substring(0,2)}
                            </div>
                            <div>
                              <p className="font-bold text-white font-mono text-[14px]">{s.sym}</p>
                              <p className="text-[11px] text-[#71717a]">{s.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 text-right font-mono text-white text-[14px]">${s.price}</td>
                        <td className={`py-3.5 text-right font-mono text-[13px] font-bold ${s.positive ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                          {s.change}
                        </td>
                        <td className="py-3.5 text-right">
                          <button className="px-3 py-1.5 rounded-lg bg-[#18181b] text-[#a1a1aa] text-[11px] font-bold hover:bg-[#27272a] hover:text-white transition-colors border border-[#27272a]">
                            Analyze
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export { MarketIntelligence };
