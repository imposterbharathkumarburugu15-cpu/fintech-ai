import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, TrendingDown, TrendingUp, X, ChevronRight, Zap, 
  BarChart2, Target, DollarSign, Globe, Sparkles, Activity, 
  AlertCircle, ArrowUpRight, Fingerprint, Layers, Search, 
  Settings2, FileBarChart, Clock, ShieldAlert, Cpu
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from "recharts";

// --- MOCK INTELLIGENCE DATA ---
const PRIORITY_QUEUE = [
  {
    id: "risk-01",
    title: "High Sector Concentration",
    severity: "High",
    category: "Portfolio",
    impact: "-₹18,400 (Potential Delta)",
    why: "Technology exposure has reached 64% following the recent NVDA rally. This exceeds your defined risk mandate of 40%.",
    action: "Execute Rebalance",
    savings: "₹4,200 Risk Reduc.",
    confidence: 98
  },
  {
    id: "budget-02",
    title: "Dining Velocity Alert",
    severity: "Medium",
    category: "Budget",
    impact: "-₹6,200 (Excess Spend)",
    why: "Food delivery spending is 32% above target. At current velocity, you will exhaust your 'Discretionary' budget 8 days early.",
    action: "Optimize Budget",
    savings: "₹2,100/mo",
    confidence: 94
  },
  {
    id: "opp-03",
    title: "Savings Yield Opportunity",
    severity: "Low",
    category: "Savings",
    impact: "+₹12,400 (Annual ROI)",
    why: "Aggregate cash savings of ₹8.4L is sitting in a 3% p.a. account. System identified HYSAs offering 7.2% for this liquidity tier.",
    action: "Transfer Funds",
    savings: "₹3,100/qtr",
    confidence: 96
  }
];

const HEALTH_BREAKDOWN = [
  { label: "Spending Efficiency", v: 72, color: "#f59e0b" },
  { label: "Portfolio Resilience", v: 94, color: "#10b981" },
  { label: "Liquidity Index", v: 88, color: "#3b82f6" },
  { label: "Risk Management", v: 91, color: "#8b5cf6" },
];

// --- SUB-COMPONENTS ---

const HealthGauge = ({ score }) => {
  const radius = 75;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-44 h-44 transform -rotate-90">
        <circle cx="88" cy="88" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
        <motion.circle 
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
          transition={{ duration: 2, ease: "easeOut" }}
          cx="88" cy="88" r={radius} stroke="url(#healthGrad)" strokeWidth="8" fill="transparent"
          strokeDasharray={circumference} strokeLinecap="round"
        />
        <defs>
          <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <span className="text-4xl font-black text-white tracking-tighter">{score}</span>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Health Index</p>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

export function SmartAlerts() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 p-4 lg:p-8 font-sans selection:bg-blue-500/30">
      
      {/* HEADER */}
      <header className="max-w-[1400px] mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Fingerprint className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] font-black tracking-[0.3em] text-blue-500 uppercase">Ops Center // Live Monitoring</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Financial Operations</h1>
          <p className="text-slate-500 text-sm font-medium">Real-time AI auditing of risk, budget, and market impact.</p>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button className="flex-1 lg:flex-none px-6 py-3 bg-white/5 border border-white/5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400">
            Dismiss Resolved
          </button>
          <button className="flex-1 lg:flex-none px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/20">
            <Sparkles className="w-3.5 h-3.5 inline mr-2" /> AI Summary
          </button>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-8">
        
        {/* LEFT COLUMN (8 Units) */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          
          {/* AI EXECUTIVE BRIEFING */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-[#0c0c0e] border border-white/5 rounded-[2.5rem] p-8 lg:p-10"
          >
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <ShieldAlert className="w-40 h-40 text-blue-500" />
            </div>
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest">AI Status: Active Monitoring</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Confidence: 98%</span>
                </div>
                <h2 className="text-3xl font-bold text-white leading-tight">Good Afternoon Bharath. <br />Your alert level is <span className="text-amber-500 underline underline-offset-8">Medium</span>.</h2>
                <div className="space-y-3">
                  {["Portfolio concentration increased in Tech.", "Entertainment spending is above budget.", "Two subscriptions flagged for review."].map((s, i) => (
                    <div key={i} className="flex gap-3 text-sm text-slate-400">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" /> {s}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { l: "Critical Alerts", v: "0", c: "text-white" },
                  { l: "Warnings", v: "3", c: "text-amber-500" },
                  { l: "Opportunities", v: "5", c: "text-blue-500" },
                  { l: "Threats", v: "1", c: "text-rose-500" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 rounded-3xl p-5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.l}</p>
                    <p className={`text-2xl font-bold ${stat.c}`}>{stat.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* PRIORITY QUEUE */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-4">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500" /> Decision Queue
              </h3>
              <div className="flex gap-2">
                <button className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-white"><Search className="w-4 h-4" /></button>
                <button className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-white"><Settings2 className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="space-y-3">
              {PRIORITY_QUEUE.map((alert) => (
                <motion.div 
                  layout key={alert.id}
                  onClick={() => setExpanded(expanded === alert.id ? null : alert.id)}
                  className="bg-[#0c0c0e] border border-white/5 rounded-2xl p-5 cursor-pointer hover:border-white/10 transition-all overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-5 w-72">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${alert.severity === 'High' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        {alert.severity.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{alert.title}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{alert.category} // {alert.severity} Priority</p>
                      </div>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-3 gap-4 text-right">
                      <div><p className="text-[10px] font-black text-slate-500 uppercase mb-1">Impact</p><p className="text-xs font-bold text-white">{alert.impact}</p></div>
                      <div><p className="text-[10px] font-black text-slate-500 uppercase mb-1">Savings</p><p className="text-xs font-bold text-emerald-500">{alert.savings}</p></div>
                      <div><p className="text-[10px] font-black text-slate-500 uppercase mb-1">Confidence</p><p className="text-xs font-bold text-blue-500">{alert.confidence}%</p></div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-600 transition-transform ${expanded === alert.id ? 'rotate-90' : ''}`} />
                  </div>

                  <AnimatePresence>
                    {expanded === alert.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="mt-6 pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8"
                      >
                        <div className="space-y-4">
                           <div>
                              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Business Impact</p>
                              <p className="text-xs text-slate-400 leading-relaxed">{alert.why}</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Technical Observation</p>
                              <p className="text-xs text-slate-400 italic">"{alert.why}"</p>
                           </div>
                        </div>
                        <div className="bg-blue-600/5 border border-blue-500/10 p-5 rounded-2xl flex flex-col justify-between">
                           <div>
                              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">AI Suggested Action</p>
                              <p className="text-sm font-bold text-white">System recommends executing the {alert.action} to stabilize health vector.</p>
                           </div>
                           <button className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all">
                             Execute: {alert.action}
                           </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (4 Units) */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          
          {/* HEALTH MONITOR */}
          <div className="bg-[#0c0c0e] border border-white/5 rounded-[2.5rem] p-8">
            <div className="flex items-center gap-2 mb-8 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
              <Activity className="w-4 h-4 text-blue-500" /> Financial Health Matrix
            </div>
            <div className="flex flex-col items-center">
              <HealthGauge score={86} />
              <div className="w-full space-y-5 mt-10">
                {HEALTH_BREAKDOWN.map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                      <span className="text-slate-500">{item.label}</span>
                      <span className="text-white">{item.v}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full" style={{ width: `${item.v}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI OPPORTUNITIES */}
          <div className="space-y-3">
             <h4 className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">AI Opportunities</h4>
             {[
               { t: "Increase SIP by ₹5,000", i: TrendingUp, p: "High ROI" },
               { t: "Cancel Unused Prime Sub", i: Zap, p: "Quick Win" },
               { t: "Portfolio Rebalance", i: BarChart2, p: "Strategic" },
             ].map((rec, i) => (
               <button key={i} className="w-full flex items-center justify-between p-5 bg-[#0c0c0e] hover:bg-white/5 border border-white/5 rounded-3xl transition-all group text-left">
                 <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-500/10 rounded-xl group-hover:bg-blue-600 transition-colors">
                       <rec.i className="w-4 h-4 text-white" />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-white leading-none">{rec.t}</p>
                       <p className="text-[10px] text-slate-500 font-bold uppercase mt-1.5">{rec.p}</p>
                    </div>
                 </div>
                 <ArrowUpRight className="w-4 h-4 text-slate-700 group-hover:text-blue-500 transition-all" />
               </button>
             ))}
          </div>

          {/* ANALYTICS PREVIEW */}
          <div className="bg-[#0c0c0e] border border-white/5 rounded-3xl p-6">
             <div className="flex items-center gap-2 mb-6">
                <FileBarChart className="w-4 h-4 text-slate-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resolution Analytics</span>
             </div>
             <div className="flex items-end justify-between h-20 gap-1 px-2">
                {[40, 70, 45, 90, 65, 80, 50, 60, 40, 85].map((h, i) => (
                  <div key={i} className="flex-1 bg-blue-500/20 rounded-full hover:bg-blue-500 transition-all cursor-pointer" style={{ height: `${h}%` }} />
                ))}
             </div>
             <p className="text-[10px] text-center text-slate-600 uppercase font-black mt-4 tracking-widest">92% Resolution Rate</p>
          </div>
        </div>

      </div>

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}