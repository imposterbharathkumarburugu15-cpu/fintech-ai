import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { 
  Sparkles, Download, Share2, ShieldAlert, Target, 
  ChevronRight, Zap, Landmark, ArrowUpRight, Activity, 
  AlertCircle, CheckCircle2, MessageSquare
} from "lucide-react";

// --- MOCK DATA ---
const TREND_DATA = [
  { month: 'Jan', net: 110000 }, { month: 'Feb', net: 125000 },
  { month: 'Mar', net: 118000 }, { month: 'Apr', net: 142000 },
  { month: 'May', net: 155000 }, { month: 'Jun', net: 185000 },
  { month: 'Jul', net: 198000 }
];

const DECISIONS = [
  { id: 1, title: "Capital Reallocation", detail: "Shift 12% of idle cash to Liquid ETFs to capture yield.", impact: "+₹14,500/yr", priority: "High", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { id: 2, title: "Subscription Audit", detail: "4 duplicate SaaS tools detected across your accounts.", impact: "₹8,400/yr", priority: "Medium", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { id: 3, title: "Tax Harvest Opportunity", detail: "Realize ₹45k in short-term losses before fiscal end.", impact: "₹13,500 Saved", priority: "Urgent", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
];

export function Reports() {
  const chartRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Manual measurement to force chart visibility in React 19
  useEffect(() => {
    const handleMeasure = () => {
      if (chartRef.current) setChartWidth(chartRef.current.offsetWidth);
    };
    const timer = setTimeout(() => {
      handleMeasure();
      setIsReady(true);
    }, 500);
    window.addEventListener("resize", handleMeasure);
    return () => {
      window.removeEventListener("resize", handleMeasure);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 bg-black min-h-screen text-white">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-2">
            Executive Intelligence <span className="text-blue-500">✨</span>
          </h1>
          <p className="text-[#a1a1aa] text-sm mt-1">AI Generative Briefing • Fiscal Period July 2026</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center justify-center p-2.5 bg-[#121214] border border-white/5 rounded-xl hover:bg-[#18181b] transition-colors text-[#a1a1aa] hover:text-white">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="flex items-center justify-center p-2.5 bg-[#121214] border border-white/5 rounded-xl hover:bg-[#18181b] transition-colors text-[#a1a1aa] hover:text-white">
            <Download className="w-4 h-4" />
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[13px] font-bold px-5 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] active:scale-95">
            <Sparkles className="w-4 h-4" /> Generate Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (8 COLS) */}
        <div className="lg:col-span-8 flex flex-col gap-6 min-w-0">
          
          {/* 2. AI EXECUTIVE BRIEFING */}
          <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg">System Status: Optimized</span>
                <span className="text-xs font-medium text-[#71717a]">Confidence Index: 98%</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-8">
                Good Afternoon, Bharath.<br/>Your financial operating health is <span className="text-blue-400">Exceptional</span>.
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {[
                  { text: "Portfolio Alpha is +4.2% vs Benchmark", icon: TrendingUp, color: "text-emerald-400" },
                  { text: "Tax optimization detected (₹13,500/yr)", icon: Zap, color: "text-amber-400" },
                  { text: "Savings rate sustained at 24.8%", icon: CheckCircle2, color: "text-blue-400" },
                  { text: "Emergency fund at 3.2 months coverage", icon: ShieldCheck, color: "text-indigo-400" }
                ].map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-[#18181b] p-4 rounded-2xl border border-white/5">
                    <insight.icon className={`w-4 h-4 ${insight.color} mt-0.5 shrink-0`} />
                    <span className="text-[13px] text-[#a1a1aa] font-medium leading-snug">{insight.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. AI DECISION CENTER (Action Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {DECISIONS.map(d => (
               <div key={d.id} className="bg-[#121214] border border-white/5 rounded-3xl p-6 hover:border-white/10 transition-colors flex flex-col">
                 <div className="flex items-center justify-between mb-4">
                   <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${d.bg} ${d.color} ${d.border}`}>
                     {d.priority}
                   </div>
                 </div>
                 <h4 className="text-white text-[15px] font-semibold mb-2">{d.title}</h4>
                 <p className="text-[#a1a1aa] text-xs leading-relaxed mb-6 flex-1">{d.detail}</p>
                 
                 <div className="bg-[#18181b] rounded-xl p-3 mb-6 border border-white/5 flex justify-between items-center">
                   <span className="text-xs text-[#71717a] font-medium">Est. Impact</span>
                   <span className="text-sm font-bold text-emerald-400">{d.impact}</span>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-2 mt-auto">
                   <button className="py-2 bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] text-xs font-semibold rounded-xl transition-colors">Review</button>
                   <button className="py-2 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-xl transition-colors">Apply</button>
                 </div>
               </div>
             ))}
          </div>

          {/* 4. PERFORMANCE INTELLIGENCE CHART */}
          <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 flex flex-col min-h-[420px]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-white text-[15px] font-semibold">Growth Matrix</h3>
                <p className="text-[#71717a] text-xs mt-1">Consolidated Net Worth Trend</p>
              </div>
              <div className="flex gap-1.5">
                 {['1M', '3M', '6M', '1Y'].map(t => (
                   <button key={t} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${t === '6M' ? 'bg-[#27272a] text-white' : 'text-[#71717a] hover:text-white'}`}>{t}</button>
                 ))}
              </div>
            </div>

            <div ref={chartRef} className="flex-1 w-full relative min-h-[250px]">
               {isReady && chartWidth > 0 ? (
                 <AreaChart width={chartWidth} height={280} data={TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <defs>
                      <linearGradient id="matrixGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                   <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#52525b', fontSize: 11, fontWeight: 500}} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{fill: '#52525b', fontSize: 11, fontWeight: 500}} tickFormatter={(v) => `₹${v/1000}k`} />
                   <Tooltip contentStyle={{backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px'}} itemStyle={{color: '#fff', fontWeight: 600}} />
                   <Area type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={3} fill="url(#matrixGlow)" isAnimationActive={false} />
                 </AreaChart>
               ) : (
                 <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-zinc-700 animate-pulse">Calculating Projections...</div>
               )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (4 COLS) */}
        <div className="lg:col-span-4 flex flex-col gap-6 min-w-0">
          
          {/* 5. RISK ANALYSIS */}
          <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 shadow-xl">
            <h3 className="text-white text-[15px] font-semibold flex items-center gap-2 mb-6">
              <ShieldAlert className="w-4 h-4 text-blue-400" /> Risk Radar
            </h3>
            <div className="flex flex-col gap-5">
              {[
                { l: "Cash Flow Risk", v: "Low", s: 24, c: "bg-emerald-500" },
                { l: "Volatility Exposure", v: "High", s: 82, c: "bg-rose-500" },
                { l: "Inflation Drag", v: "Medium", s: 45, c: "bg-amber-500" },
              ].map((r, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#a1a1aa] font-medium">{r.l}</span>
                    <span className={`font-bold ${r.v === 'High' ? 'text-rose-400' : r.v === 'Medium' ? 'text-amber-400' : 'text-emerald-400'}`}>{r.v}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#18181b] rounded-full overflow-hidden">
                    <div className={`${r.c} h-full rounded-full`} style={{ width: `${r.s}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. STRATEGIC GOALS */}
          <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 shadow-xl">
            <h3 className="text-white text-[15px] font-semibold flex items-center gap-2 mb-6">
              <Target className="w-4 h-4 text-emerald-400" /> Milestone Tracking
            </h3>
            <div className="flex flex-col gap-6">
               {[
                 { name: "Luxury Real Estate", prog: 64, eta: "24 Mo", amt: "₹1.2Cr" },
                 { name: "Legacy Wealth Fund", prog: 28, eta: "120 Mo", amt: "₹5.0Cr" },
               ].map((g, i) => (
                 <div key={i} className="flex flex-col gap-2">
                   <div className="flex justify-between items-start">
                     <div>
                       <p className="text-white text-xs font-semibold mb-0.5">{g.name}</p>
                       <p className="text-[10px] text-[#71717a] font-medium">Target: {g.amt}</p>
                     </div>
                     <p className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">{g.eta} Left</p>
                   </div>
                   <div className="h-1.5 w-full bg-[#18181b] rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${g.prog}%` }} />
                   </div>
                 </div>
               ))}
            </div>
          </div>

          {/* 7. QUICK ACTIONS */}
          <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col gap-3">
            <h3 className="text-white text-[15px] font-semibold mb-3">Quick Actions</h3>
            <button className="w-full flex items-center justify-between p-4 bg-[#18181b] border border-white/5 hover:border-white/10 hover:bg-[#1f1f24] rounded-2xl transition-all group">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shrink-0">
                   <Cpu className="w-4 h-4 text-purple-400" />
                 </div>
                 <div className="text-left">
                   <p className="text-white text-xs font-semibold">Neural Tax Audit</p>
                   <p className="text-[10px] text-[#71717a] mt-0.5">Est. Save: ₹14k</p>
                 </div>
               </div>
               <ChevronRight className="w-4 h-4 text-[#52525b] group-hover:text-white transition-colors" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-[#18181b] border border-white/5 hover:border-white/10 hover:bg-[#1f1f24] rounded-2xl transition-all group">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                   <Landmark className="w-4 h-4 text-blue-400" />
                 </div>
                 <div className="text-left">
                   <p className="text-white text-xs font-semibold">Scenario Lab</p>
                   <p className="text-[10px] text-[#71717a] mt-0.5">Stress test portfolio</p>
                 </div>
               </div>
               <ChevronRight className="w-4 h-4 text-[#52525b] group-hover:text-white transition-colors" />
            </button>
          </div>

        </div>
      </div>

      {/* FLOATING AI ASSISTANT */}
      <button className="fixed bottom-8 right-8 h-14 w-14 bg-blue-600 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group">
        <MessageSquare className="w-5 h-5 text-white" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-black"></span>
        </span>
      </button>

    </div>
  );
}
