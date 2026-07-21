import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, Search, TrendingUp, Wallet, Activity, 
  ChevronRight, Calendar, Bell, Target,
  Mic, Zap, CreditCard, Info, ShoppingBag, Coffee
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, 
  PieChart as RePieChart, Pie, Cell
} from "recharts";

// --- Data ---
const cashFlowData = [
  { month: "Jan", income: 110000, expenses: 65000 },
  { month: "Feb", income: 115000, expenses: 70000 },
  { month: "Mar", income: 120000, expenses: 72000 },
  { month: "Apr", income: 125000, expenses: 68000 },
  { month: "May", income: 130000, expenses: 71000 },
  { month: "Jun", income: 145000, expenses: 68540 }
];

const portfolioAllocation = [
  { name: "Equity", value: 62, amount: "₹15,42,966", color: "#06b6d4" },
  { name: "Debt Mutual Funds", value: 23, amount: "₹5,72,648", color: "#6366f1" },
  { name: "Crypto", value: 10, amount: "₹2,48,543", color: "#a855f7" },
  { name: "Gold & Cash", value: 5, amount: "₹1,24,271", color: "#10b981" }
];

export function Dashboard({ onViewChange, onToggleChat }) {
  const areaRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 220 });
  const [isReady, setIsReady] = useState(false);

  // FIX: Measure the box size manually so Recharts doesn't render at 0px
  useEffect(() => {
    const measure = () => {
      if (areaRef.current) {
        setDimensions({
          width: areaRef.current.offsetWidth,
          height: 220
        });
      }
    };

    // Initial measure after a small delay
    const timer = setTimeout(() => {
      measure();
      setIsReady(true);
    }, 500);

    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 bg-black min-h-screen text-white">
      
      {/* 1. HERO HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-2">
            Your finances at a glance <span className="text-amber-400">✨</span>
          </h1>
          <p className="text-[#a1a1aa] text-sm mt-1">Here's your financial operating picture for today.</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#a1a1aa]">
          <span className="flex items-center gap-1.5 bg-[#121214] px-3 py-1.5 rounded-lg border border-white/5">
            <Calendar className="w-3.5 h-3.5 text-[#8b5cf6]" />
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="flex items-center gap-1.5 bg-[#121214] px-3 py-1.5 rounded-lg border border-white/5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Market: <span className="text-white font-medium">Open</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (8 COLS) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* 2. ASK NEXUS AI BLOCK */}
          <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 shadow-xl">
            <h2 className="text-white text-[16px] font-semibold mb-4">How can Nexus AI help you today?</h2>
            
            <div 
              onClick={onToggleChat}
              className="relative flex items-center bg-[#18181b] border border-white/10 hover:border-white/20 rounded-2xl p-2 pl-4 cursor-text transition-all group min-h-[56px] mb-4"
            >
              <Search className="w-5 h-5 text-[#52525b] group-hover:text-[#a1a1aa] mr-3 shrink-0" />
              <span className="text-[#52525b] group-hover:text-[#a1a1aa] text-[14px] flex-1">Search your finances or ask anything...</span>
              
              <div className="flex items-center gap-3 shrink-0">
                <Mic className="w-4 h-4 text-[#71717a] hover:text-white transition-colors cursor-pointer" />
                <button className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-[12px] font-bold px-4 py-2 rounded-xl shadow-lg active:scale-95">
                  <Sparkles className="w-3.5 h-3.5" /> Ask Nexus AI
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {["Analyze spending", "Best stocks", "Review portfolio", "SIP recommendation"].map((label, idx) => (
                <button key={idx} onClick={onToggleChat} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#18181b] border border-white/5 hover:border-indigo-500/30 text-[#a1a1aa] hover:text-white text-[13px] font-medium transition-all">
                  <Zap className="w-3.5 h-3.5 text-indigo-400" /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. KPI CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Net Worth", val: "₹24,85,430", color: "indigo", icon: Wallet },
              { label: "Cash Flow", val: "+₹45,680", color: "blue", icon: Activity },
              { label: "Monthly Spend", val: "₹68,540", color: "amber", icon: CreditCard },
              { label: "Savings Rate", val: "68%", color: "emerald", icon: Target },
            ].map((kpi, i) => (
              <div key={i} className="bg-[#121214] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
                <div className={`w-9 h-9 rounded-xl bg-${kpi.color}-500/10 flex items-center justify-center border border-${kpi.color}-500/20 mb-4`}>
                  <kpi.icon className={`w-4 h-4 text-${kpi.color}-400`} />
                </div>
                <span className="text-[#a1a1aa] text-[10px] font-bold uppercase tracking-[0.15em]">{kpi.label}</span>
                <h3 className="text-white text-xl md:text-2xl font-bold mt-1">{kpi.val}</h3>
                <p className="text-emerald-400 text-[11px] font-semibold mt-2 flex items-center gap-1">↗ 4.8% <span className="text-[#71717a] font-normal italic">vs last month</span></p>
              </div>
            ))}
          </div>

          {/* 4. CHARTS SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Cash Flow Chart */}
            <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 flex flex-col min-h-[380px]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-white text-[15px] font-semibold flex items-center gap-1.5">Cash Flow Overview <Info className="w-3.5 h-3.5 text-zinc-600" /></h3>
                <div className="flex gap-4 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                   <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"/> Income</span>
                   <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500"/> Expense</span>
                </div>
              </div>
              
              <div ref={areaRef} className="flex-1 w-full relative min-h-[220px]">
                {isReady && dimensions.width > 0 ? (
                  <AreaChart width={dimensions.width} height={dimensions.height} data={cashFlowData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="cInc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="cExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#52525b', fontSize: 11}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#52525b', fontSize: 11}} />
                    <Tooltip contentStyle={{backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px'}} />
                    <Area type="monotone" dataKey="income" stroke="#3b82f6" strokeWidth={3} fill="url(#cInc)" isAnimationActive={false} />
                    <Area type="monotone" dataKey="expenses" stroke="#8b5cf6" strokeWidth={3} fill="url(#cExp)" isAnimationActive={false} />
                  </AreaChart>
                ) : <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-700 animate-pulse uppercase tracking-widest font-bold">Synchronizing...</div>}
              </div>
            </div>

            {/* Portfolio Pie Chart */}
            <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 flex flex-col min-h-[380px]">
              <h3 className="text-white text-[15px] font-semibold mb-8">Portfolio Allocation</h3>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-8 flex-1">
                <div className="relative w-[180px] h-[180px] shrink-0">
                  {isReady ? (
                    <RePieChart width={180} height={180}>
                      <Pie data={portfolioAllocation} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" isAnimationActive={false}>
                        {portfolioAllocation.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
                      </Pie>
                    </RePieChart>
                  ) : null}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Total</span>
                    <span className="text-lg font-bold text-white">₹24.8L</span>
                  </div>
                </div>
                <div className="flex-1 w-full space-y-3">
                  {portfolioAllocation.map((item, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}} />
                          <span className="text-[#a1a1aa] font-medium">{item.name}</span>
                        </div>
                        <span className="text-white font-bold">{item.value}%</span>
                      </div>
                      <span className="text-[10px] text-zinc-600 font-mono pl-4">{item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT SIDEBAR (4 COLS) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* DAILY BRIEF */}
          <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-white text-[15px] font-semibold">Nexus AI Daily Brief</h3>
              </div>
              <span className="text-[10px] text-[#71717a] font-bold">8:30 AM</span>
            </div>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5"><TrendingUp className="w-3.5 h-3.5 text-emerald-400" /></div>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">Spending is <span className="text-white font-semibold">12% less</span> this month on discretionary items.</p>
              </div>
              <div className="flex items-start gap-3 group cursor-pointer" onClick={onToggleChat}>
                <div className="w-7 h-7 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 mt-0.5"><Bell className="w-3.5 h-3.5 text-purple-400" /></div>
                <p className="text-xs text-[#a1a1aa] group-hover:text-white transition-colors"><span className="text-white font-semibold">NVIDIA earnings</span> tomorrow. Impact alert for your tech holdings.</p>
              </div>
              <div className="h-px bg-white/5 my-2" />
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Recommended Action</span>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5"><Target className="w-3.5 h-3.5 text-amber-400" /></div>
                  <p className="text-xs text-[#a1a1aa]">Increase SIP by <span className="text-white font-semibold">₹2,000</span> to hit your goal 3 months early.</p>
                </div>
              </div>
            </div>
            <button onClick={onToggleChat} className="w-full mt-6 py-2.5 bg-[#18181b] border border-white/5 hover:bg-[#1f1f24] text-white text-[12px] font-bold rounded-xl transition-all flex items-center justify-center gap-2">View Full Brief <ChevronRight className="w-3.5 h-3.5" /></button>
          </div>

          {/* RECENT ACTIVITY */}
          <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-[15px] font-semibold">Recent Activity</h3>
              <button onClick={() => onViewChange("expenses")} className="text-indigo-400 hover:text-indigo-300 text-xs font-bold transition-colors">View All</button>
            </div>
            <div className="space-y-4">
              {[
                { name: "Apple Store", cat: "Technology", amt: "₹1,259", icon: ShoppingBag, color: "orange" },
                { name: "Amazon India", cat: "Shopping", amt: "₹3,450", icon: CreditCard, color: "indigo" },
                { name: "Starbucks Coffee", cat: "Dining", amt: "₹450", icon: Coffee, color: "emerald" },
              ].map((act, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer p-1 rounded-xl hover:bg-white/[0.02] transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-${act.color}-500/10 flex items-center justify-center border border-white/5`}><act.icon className={`w-4 h-4 text-${act.color}-400`} /></div>
                    <div><p className="text-white text-xs font-bold">{act.name}</p><p className="text-[10px] text-[#71717a]">{act.cat} • Today</p></div>
                  </div>
                  <span className="text-xs font-bold font-mono text-white">{act.amt}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}