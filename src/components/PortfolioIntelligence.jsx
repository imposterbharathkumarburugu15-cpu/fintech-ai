import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  BarChart, Bar, Cell, PieChart, Pie 
} from "recharts";
import { 
  ShieldCheck, Activity, Briefcase, TrendingUp, TrendingDown, 
  Sparkles, Plus, RefreshCw, FileText, ChevronRight, Target, 
  Zap, Globe, BarChart3, Layers, ArrowUpRight, ArrowDownRight,
  ShieldAlert, Landmark, PieChart as PieIcon, Cpu, Info, Search
} from "lucide-react";

// --- MOCK DATA ---
const PERFORMANCE_DATA = [
  { date: 'Jan', value: 92000, benchmark: 91000 },
  { date: 'Feb', value: 95000, benchmark: 93000 },
  { date: 'Mar', value: 94000, benchmark: 95500 },
  { date: 'Apr', value: 98000, benchmark: 96000 },
  { date: 'May', value: 105000, benchmark: 98000 },
  { date: 'Jun', value: 112000, benchmark: 102000 },
  { date: 'Jul', value: 115128, benchmark: 104000 },
];

const HOLDINGS = [
  { symbol: "AAPL", name: "Apple Inc.", shares: 150, price: 214.32, value: 32148, allocation: 28, change: 1.24, rating: "BUY", type: "Equity" },
  { symbol: "NVDA", name: "NVIDIA Corp.", shares: 45, price: 875.40, value: 39393, allocation: 34, change: 2.34, rating: "HOLD", type: "Equity" },
  { symbol: "VOO", name: "Vanguard S&P 500", shares: 80, price: 504.12, value: 40329, allocation: 35, change: 0.52, rating: "BUY", type: "ETF" },
  { symbol: "BND", name: "Vanguard Total Bond", shares: 45, price: 72.40, value: 3258, allocation: 3, change: -0.15, rating: "SELL", type: "Fixed Income" },
];

// --- SUB-COMPONENTS ---

const HealthGauge = ({ score }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-40 h-40 transform -rotate-90">
        <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
        <motion.circle 
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          cx="80" cy="80" r={radius} stroke="url(#healthGradient)" strokeWidth="8" fill="transparent"
          strokeDasharray={circumference} strokeLinecap="round"
        />
        <defs>
          <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <span className="text-4xl font-black text-white">{score}</span>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Health</p>
      </div>
    </div>
  );
};

const CommandCard = ({ title, icon: Icon, children, badge }) => (
  <div className="bg-[#0c0c0e] border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md">
    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-slate-500" />
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">{title}</h3>
      </div>
      {badge && <span className="text-[9px] font-black px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">{badge}</span>}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// --- MAIN COMPONENT ---

export function PortfolioIntelligence() {
  const [expanded, setExpanded] = useState(null);
  const chartRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // FIX: Neural Render Sync for React 19
  useEffect(() => {
    const handleMeasure = () => {
      if (chartRef.current) {
        setChartWidth(chartRef.current.offsetWidth);
      }
    };

    const timer = setTimeout(() => {
      handleMeasure();
      setIsReady(true);
    }, 600); // 600ms to allow Institutional layout to stabilize

    window.addEventListener("resize", handleMeasure);
    return () => {
      window.removeEventListener("resize", handleMeasure);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 p-4 lg:p-8 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* HEADER */}
      <header className="max-w-[1400px] mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Landmark className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] font-black tracking-[0.3em] text-blue-500 uppercase">Institutional Terminal</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Portfolio Intelligence</h1>
          <p className="text-slate-500 text-sm font-medium">Global Multi-Asset Monitoring & AI Allocation</p>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all text-[11px] font-black uppercase tracking-widest text-slate-300">
            <RefreshCw className="w-3.5 h-3.5" /> Rebalance
          </button>
          <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/20">
            <Plus className="w-3.5 h-3.5" /> Add Asset
          </button>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN (8 Units) */}
        <div className="col-span-12 lg:col-span-8 space-y-8 min-w-0">
          
          {/* AI EXECUTIVE BRIEF */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-[#0c0c0e] border border-white/5 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <Sparkles className="w-48 h-48 text-blue-500" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-full border border-emerald-500/20 uppercase tracking-widest">AI Status: Optimized</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">97% Confidence Level</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-white leading-tight">Your portfolio is outperforming the benchmark by <span className="text-emerald-400">4.2%</span>.</h2>
                  <div className="space-y-4">
                    {[
                      { text: "Tech allocation is 8% overweight vs S&P 500.", type: "amber-500" },
                      { text: "Cash reserves are below target by 2.4%.", type: "rose-500" },
                    ].map((insight, i) => (
                      <div key={i} className="flex gap-4 items-start text-sm text-slate-400">
                        <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 bg-${insight.type}`} />
                        {insight.text}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { l: "Net Worth", v: "$115,128", c: "text-white" },
                    { l: "Daily P&L", v: "+$1,642", c: "text-emerald-500" },
                    { l: "YTD Return", v: "+12.4%", c: "text-white" },
                    { l: "Alpha", v: "2.14", c: "text-blue-400" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 rounded-3xl p-5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.l}</p>
                      <p className={`text-xl font-bold ${stat.c}`}>{stat.v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* PERFORMANCE CHART CARD (FIXED) */}
          <CommandCard title="Performance Analytics" icon={Activity}>
            <div ref={chartRef} className="h-[350px] w-full relative">
              {isReady && chartWidth > 0 ? (
                <AreaChart width={chartWidth} height={350} data={PERFORMANCE_DATA} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ backgroundColor: '#0c0c0e', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#glow)" isAnimationActive={false} />
                  <Area type="monotone" dataKey="benchmark" stroke="#475569" strokeWidth={2} strokeDasharray="5 5" fill="transparent" isAnimationActive={false} />
                </AreaChart>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-800 uppercase tracking-[0.4em] animate-pulse">Calculating institutional vectors...</div>
              )}
            </div>
            <div className="flex justify-center gap-6 mt-8">
              {['1D', '1W', '1M', '3M', '1Y'].map(t => (
                <button key={t} className={`text-[10px] font-black px-4 py-1.5 rounded-xl transition-all ${t === '1M' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}>{t}</button>
              ))}
            </div>
          </CommandCard>

          {/* HOLDINGS LIST */}
          <div className="space-y-4 pb-20">
            <div className="flex justify-between items-center px-4">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500" /> Live Asset Inventory
              </h3>
            </div>

            {HOLDINGS.map((h) => (
              <motion.div 
                key={h.symbol}
                onClick={() => setExpanded(expanded === h.symbol ? null : h.symbol)}
                className="group bg-[#0c0c0e] border border-white/5 rounded-[2rem] p-5 cursor-pointer hover:border-white/10 transition-all overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center gap-5 w-64">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-black text-xs text-white group-hover:bg-blue-600 transition-colors">{h.symbol.substring(0, 2)}</div>
                    <div>
                      <p className="font-bold text-white text-base">{h.symbol}</p>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{h.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-4 gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Weight</p>
                      <p className="text-xs font-bold text-white">{h.allocation}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Value</p>
                      <p className="text-xs font-bold text-white">${h.value.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Rating</p>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${h.rating === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>{h.rating}</span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-600 transition-transform ${expanded === h.symbol ? 'rotate-90' : ''}`} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN (4 Units) */}
        <div className="col-span-12 lg:col-span-4 space-y-8 min-w-0">
          
          <CommandCard title="Integrity Index" icon={ShieldCheck}>
            <div className="flex flex-col items-center py-6">
              <HealthGauge score={92} />
              <div className="w-full space-y-5 mt-10">
                {[
                  { label: "Diversification", score: 88 },
                  { label: "Liquidity", score: 95 },
                  { label: "Risk-Adjusted", score: 91 },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="text-white">{item.score}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600" style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CommandCard>

          <CommandCard title="Risk Lab" icon={ShieldAlert}>
            <div className="space-y-6">
              {[
                { label: "Volatility", risk: "Low", score: 32, color: "bg-emerald-500" },
                { label: "Concentration", risk: "High", score: 85, color: "bg-rose-500" },
              ].map((r, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300">{r.label}</span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded ${r.risk === 'High' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>{r.risk}</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${r.color}`} style={{ width: `${r.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CommandCard>

          <div className="space-y-3">
             <button className="w-full flex items-center justify-between p-5 bg-[#0c0c0e] hover:bg-white/5 border border-white/5 rounded-3xl transition-all group">
                <div className="flex items-center gap-4">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Optimize Allocation</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-700 group-hover:translate-x-1 transition-transform" />
              </button>
          </div>

        </div>
      </div>
    </div>
  );
}