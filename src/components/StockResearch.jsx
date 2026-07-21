import React, { useState, useMemo } from "react";
import { 
  Search, TrendingUp, TrendingDown, Sparkles, BarChart2, ArrowUpRight, 
  ArrowDownRight, Globe, ShieldAlert, Users, Zap, FileText, Scale, 
  PieChart, Activity, Target, AlertTriangle, ChevronDown, Download, 
  Plus, Layers, Compass, Cpu, Wallet, Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";

// ─── MOCK DATA DATABASE ──────────────────────────────────────────
const STOCKS = {
  AAPL: {
    name: "Apple Inc.", ticker: "AAPL", exchange: "NASDAQ", sector: "Technology", 
    price: "$214.32", change: "+1.24%", positive: true, intrinsicValue: "$245.00",
    marketCap: "$3.28T", pe: "32.4", divYield: "0.46%", eps: "$6.62", beta: "1.21",
    score: 88, recommendation: "BUY", confidence: 94,
    summary: "Apple is aggressively integrating Apple Intelligence across its product line, shifting from a hardware-centric model to an AI-integrated ecosystem. Services revenue continues to expand high-margin bases.",
    bull: ["Services revenue growing 14% YoY", "AI integration driving upgrade cycles", "Strong $162B cash position"],
    bear: ["EU regulatory pressure", "China market saturation", "Premium 32x P/E valuation"],
    swot: {
      strengths: ["Brand Loyalty", "Ecosystem Lock-in"],
      weaknesses: ["iPhone Concentration", "High Pricing"],
      opportunities: ["India Expansion", "Vision Pro"],
      threats: ["Antitrust Lawsuits", "Huawei Competition"],
    },
    metrics: [{ name: 'Rev', value: 391 }, { name: 'Net', value: 97 }, { name: 'R&D', value: 30 }, { name: 'Cap', value: 55 }],
    news: [{ headline: "Apple Intelligence rollout nears", impact: "High", sentiment: "positive" }, { headline: "Supply chain shifts to Vietnam", impact: "Mid", sentiment: "neutral" }]
  },
  NVDA: {
    name: "NVIDIA Corp.", ticker: "NVDA", exchange: "NASDAQ", sector: "Semiconductors",
    price: "$875.40", change: "+2.34%", positive: true, intrinsicValue: "$910.00",
    marketCap: "$2.16T", pe: "68.2", divYield: "0.03%", eps: "$12.84", beta: "1.72",
    score: 96, recommendation: "STRONG BUY", confidence: 98,
    summary: "The backbone of the global AI infrastructure. Blackwell architecture represents a generational leap in compute efficiency, securing a multi-year lead over rivals.",
    bull: ["80%+ GPU Market Share", "CUDA Software Moat", "Data Center Hypergrowth"],
    bear: ["Extreme Valuation", "Export Restrictions", "Cyclical Risk"],
    swot: { strengths: ["Dominance", "Innovation"], weaknesses: ["Cyclicality", "Valuation"], opportunities: ["Sovereign AI", "Auto"], threats: ["Custom Silicon", "Geopolitics"] },
    metrics: [{ name: 'Rev', value: 260 }, { name: 'Net', value: 130 }, { name: 'R&D', value: 40 }, { name: 'Cap', value: 28 }],
    news: [{ headline: "Blackwell chip demand hits record", impact: "High", sentiment: "positive" }, { headline: "New H200 shipping global", impact: "High", sentiment: "positive" }]
  },
  RELIANCE: {
    name: "Reliance Industries", ticker: "RELIANCE", exchange: "NSE", sector: "Conglomerate",
    price: "₹2,890", change: "+0.78%", positive: true, intrinsicValue: "₹3,180",
    marketCap: "₹19.6L Cr", pe: "28.4", divYield: "0.38%", eps: "₹101.8", beta: "0.82",
    score: 92, recommendation: "BUY", confidence: 96,
    summary: "India's largest conglomerate transitioning from O2C to a digital and green energy powerhouse. Jio and Retail are the primary value unlock drivers for the next fiscal year.",
    bull: ["Jio 5G Monetization", "Retail Scale", "Green Hydrogen Entry"],
    bear: ["High CapEx", "O2C Volatility", "Regulatory Shifts"],
    swot: { strengths: ["Scale", "Data Leadership"], weaknesses: ["Debt", "Complexity"], opportunities: ["New Energy", "Jio Financial"], threats: ["Adani Group", "Oil Prices"] },
    metrics: [{ name: 'Rev', value: 810 }, { name: 'Net', value: 70 }, { name: 'R&D', value: 15 }, { name: 'Cap', value: 120 }],
    news: [{ headline: "Green hydrogen plant phase 1 complete", impact: "High", sentiment: "positive" }, { headline: "Retail IPO rumors intensify", impact: "Mid", sentiment: "positive" }]
  },
};

const CHART_DATA = [
  { time: '09:15', price: 2840 }, { time: '10:30', price: 2865 },
  { time: '11:45', price: 2850 }, { time: '13:00', price: 2890 },
  { time: '14:15', price: 2875 }, { time: '15:30', price: 2910 },
];

const QUICK_CHIPS = ["RELIANCE", "TCS", "INFY", "AAPL", "NVDA", "TSLA", "MSFT"];

// ─── REUSABLE UI COMPONENTS ──────────────────────────────────────

const StatItem = ({ label, value, subValue, color = "text-white" }) => (
  <div className="bg-white/5 border border-white/5 rounded-xl p-4">
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-xl font-bold ${color}`}>{value}</p>
    {subValue && <p className="text-[11px] text-slate-500 mt-0.5">{subValue}</p>}
  </div>
);

const SectionHeader = ({ icon: Icon, title, badge }) => (
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-blue-500/10 rounded-lg">
        <Icon className="w-4 h-4 text-blue-500" />
      </div>
      <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">{title}</h3>
    </div>
    {badge && <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-bold text-slate-500 border border-white/10 uppercase">{badge}</span>}
  </div>
);

export function StockResearch() {
  const [query, setQuery] = useState("RELIANCE");
  const [search, setSearch] = useState("");

  const stock = useMemo(() => STOCKS[query] || STOCKS["AAPL"], [query]);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 p-4 lg:p-6 font-sans selection:bg-blue-500/30">
      <div className="max-w-[1440px] mx-auto">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[11px] font-black tracking-[0.2em] text-blue-500 uppercase">Investment Intelligence Center</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">Strategy Terminal</h1>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                className="w-full bg-[#0c0c0e] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                placeholder="Search ticker (e.g. NVDA)..."
                value={search}
                onChange={(e) => setSearch(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && STOCKS[search] && setQuery(search)}
              />
            </div>
            <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
              <Download className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </header>

        {/* QUICK ACCESS CHIPS */}
        <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
          {QUICK_CHIPS.map(c => (
            <button 
              key={c}
              onClick={() => setQuery(c)}
              className={`px-4 py-1.5 rounded-full text-[11px] font-bold border transition-all whitespace-nowrap ${query === c ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6">
          
          {/* MAIN CONTENT (LEFT) */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* EXECUTIVE AI BRIEF */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden bg-[#0c0c0e] border border-white/5 rounded-3xl p-6 lg:p-8"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles className="w-32 h-32 text-blue-500" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-500 uppercase tracking-widest">AI Verdict: {stock.recommendation}</div>
                  <div className="text-[10px] font-bold text-slate-500">CONFIDENCE: {stock.confidence}%</div>
                </div>

                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4 leading-tight">
                  {stock.name} showing strong {stock.positive ? 'upward' : 'neutral'} momentum in {stock.sector}.
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-3xl mb-8">{stock.summary}</p>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatItem label="Intrinsic Value" value={stock.intrinsicValue} color="text-green-400" subValue="DCF Model" />
                  <StatItem label="AI Score" value={`${stock.score}/100`} subValue="Quality + Value" />
                  <StatItem label="Risk Level" value="Medium" color="text-amber-400" subValue="Sector Adjusted" />
                  <StatItem label="Horizon" value="12-24 Mo" subValue="Recommended" />
                </div>
              </div>
            </motion.div>

            {/* CHART SECTION */}
            <div className="bg-[#0c0c0e] border border-white/5 rounded-3xl p-6">
              <SectionHeader icon={Activity} title="Technical Intelligence" badge="Live Action" />
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={CHART_DATA}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip contentStyle={{ backgroundColor: '#0c0c0e', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-6">
                {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map(t => (
                  <button key={t} className={`text-[11px] font-bold px-4 py-1 rounded-lg transition-all ${t === '1D' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}>{t}</button>
                ))}
              </div>
            </div>

            {/* BULL VS BEAR */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#0c0c0e] border border-white/5 rounded-3xl p-6 border-l-4 border-l-green-500/50">
                <SectionHeader icon={TrendingUp} title="Expansionary Drivers" />
                <ul className="space-y-4">
                  {stock.bull.map((b, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-300 leading-snug">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#0c0c0e] border border-white/5 rounded-3xl p-6 border-l-4 border-l-red-500/50">
                <SectionHeader icon={TrendingDown} title="Risk Headwinds" />
                <ul className="space-y-4">
                  {stock.bear.map((b, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-300 leading-snug">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* SIDEBAR (RIGHT) */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* PRICE CARD */}
            <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-900/20">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest">{stock.ticker} Current</p>
                  <h3 className="text-4xl font-black tracking-tighter mt-1">{stock.price}</h3>
                </div>
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                  {stock.positive ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded-lg">{stock.change} Today</span>
                <span className="text-[10px] text-blue-100 font-medium uppercase tracking-widest">Market Open</span>
              </div>
            </div>

            {/* PERFORMANCE BAR CHART */}
            <div className="bg-[#0c0c0e] border border-white/5 rounded-3xl p-6">
              <SectionHeader icon={BarChart2} title="Key Metrics" />
              <div className="h-[150px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stock.metrics}>
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {stock.metrics.map((_, i) => <Cell key={i} fill={i === 0 ? '#3b82f6' : '#1e1e21'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {[
                  { l: "Market Cap", v: stock.marketCap },
                  { l: "P/E Ratio", v: stock.pe },
                  { l: "EPS", v: stock.eps },
                  { l: "Div Yield", v: stock.divYield }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <span className="text-xs text-slate-500 font-medium">{item.l}</span>
                    <span className="text-xs text-white font-mono font-bold">{item.v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* NEWS & SENTIMENT */}
            <div className="bg-[#0c0c0e] border border-white/5 rounded-3xl p-6">
              <SectionHeader icon={Globe} title="News Intelligence" />
              <div className="space-y-6">
                {stock.news.map((n, i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <p className="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-colors leading-relaxed">{n.headline}</p>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 ${n.sentiment === 'positive' ? 'bg-green-500/10 text-green-500' : 'bg-slate-500/10 text-slate-400'}`}>{n.impact}</span>
                    </div>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">AI Summarized • 4h ago</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTION SIDEBAR */}
            <div className="grid grid-cols-1 gap-3">
              <button className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-3">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Run DCF Model</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-600" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Portfolio Impact</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>

        </div>
      </div>
      
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}