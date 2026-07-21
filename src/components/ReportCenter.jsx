import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { 
  Sparkles, Share2, Calendar, ShieldCheck, 
  Activity, FileText, Landmark, 
  ChevronRight, AlertTriangle, 
  Plus, Target, Zap, Clock, Receipt, TrendingUp
} from "lucide-react";

// --- FIXED MOCK DATA ---
const PERFORMANCE_TREND = [
  { month: 'Jan', income: 420000, expenses: 310000 },
  { month: 'Feb', income: 435000, expenses: 325000 },
  { month: 'Mar', income: 410000, expenses: 340000 },
  { month: 'Apr', income: 450000, expenses: 315000 },
  { month: 'May', income: 480000, expenses: 350000 },
  { month: 'Jun', income: 495000, expenses: 360000 },
  { month: 'Jul', income: 510000, expenses: 410000 },
];

const HEALTH_BREAKDOWN = [
  { label: "Savings Rate", score: 85, color: "bg-emerald-500" },
  { label: "Tax Efficiency", score: 62, color: "bg-amber-500" },
  { label: "Debt-to-Income", score: 94, color: "bg-blue-500" },
  { label: "Portfolio Risk", score: 78, color: "bg-purple-500" },
];

const RECOMMENDATIONS = [
  { title: "Optimize Entertainment", impact: "₹6,200/mo", priority: "Medium", icon: Receipt },
  { title: "Emergency Fund Gap", impact: "High Risk", priority: "Urgent", icon: ShieldCheck },
  { title: "Portfolio Diversification", impact: "2.4% ROI", priority: "Medium", icon: TrendingUp },
];

// --- SUB-COMPONENTS ---
const GlassCard = ({ children, title, icon: Icon, badge }) => (
  <div className="bg-[#0c0c0e] border border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-md mb-6">
    {(title || Icon) && (
      <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-4 h-4 text-slate-500" />}
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</h3>
        </div>
        {badge && <span className="text-[9px] font-black px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">{badge}</span>}
      </div>
    )}
    <div className="p-8">{children}</div>
  </div>
);

const HealthCircle = ({ score }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-48 h-48 transform -rotate-90">
        <circle cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5" />
        <motion.circle 
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
          transition={{ duration: 2, ease: "easeOut" }}
          cx="96" cy="96" r={radius} stroke="#3b82f6" strokeWidth="10" fill="transparent"
          strokeDasharray={circumference} strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-5xl font-black text-white tracking-tighter">{score}</span>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Health Index</p>
      </div>
    </div>
  );
};

function ReportCenter() {
  const [activeTab, setActiveTab] = useState("Monthly Report");

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 p-4 lg:p-8 font-sans">
      
      {/* HEADER */}
      <header className="max-w-[1400px] mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Landmark className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] font-black tracking-[0.3em] text-blue-500 uppercase">Executive Intelligence</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Intelligence Center</h1>
          <p className="text-slate-500 text-sm">AI-driven financial modeling and executive reporting.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button className="flex-1 lg:flex-none px-6 py-3 bg-white/5 border border-white/5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
            <Share2 className="w-3.5 h-3.5 inline mr-2" /> Share
          </button>
          <button className="flex-1 lg:flex-none px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl">
            <Plus className="w-3.5 h-3.5 inline mr-2" /> Generate New
          </button>
        </div>
      </header>

      {/* TABS */}
      <div className="max-w-[1400px] mx-auto flex gap-2 mb-10 overflow-x-auto no-scrollbar pb-2">
        {["Monthly Report", "Expense Intel", "Investment Analysis"].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest border transition-all ${activeTab === tab ? 'bg-white text-black' : 'bg-white/5 border-white/5 text-slate-500'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          
          {/* AI BRIEF */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-gradient-to-br from-blue-600/10 via-slate-900/40 to-black border border-white/5 rounded-[3rem] p-10 lg:p-12 shadow-2xl"
          >
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Confidence Index: 98%</span>
                </div>
                <h2 className="text-3xl font-bold text-white leading-tight">Good Afternoon Bharath. AI confirms financial health is <span className="text-emerald-400">Improving</span>.</h2>
                <p className="text-slate-400 text-sm leading-relaxed">Technology spending is 18% above target, but portfolio returns have offset the delta.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Spending", val: "₹4.1L", pos: false },
                  { label: "Return", val: "+12.4%", pos: true },
                  { label: "Savings", val: "18%", pos: true },
                  { label: "Emergency", val: "3.2 Mo", pos: true },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 rounded-3xl p-5">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-1">{stat.label}</p>
                    <p className={`text-xl font-bold ${stat.pos ? 'text-emerald-400' : 'text-rose-400'}`}>{stat.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* CHART */}
          <GlassCard title="Timeline Intelligence" icon={Activity} badge="Live">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PERFORMANCE_TREND}>
                  <defs>
                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ backgroundColor: '#0c0c0e', border: '1px solid #ffffff10', borderRadius: '16px' }} />
                  <Area type="monotone" dataKey="income" stroke="#3b82f6" strokeWidth={3} fill="url(#colorInc)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <GlassCard title="Health Matrix" icon={ShieldCheck}>
            <div className="flex flex-col items-center">
              <HealthCircle score={82} />
              <div className="w-full space-y-5 mt-10">
                {HEALTH_BREAKDOWN.map((h, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase">
                      <span className="text-slate-500">{h.label}</span>
                      <span className="text-white">{h.score}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${h.color}`} style={{ width: `${h.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Board Actions</h4>
            {[
              { l: "Tax Optimization", i: Zap },
              { l: "Schedule Audit", i: Clock },
            ].map((action, i) => (
              <button key={i} className="w-full flex items-center justify-between p-5 bg-[#0c0c0e] hover:bg-white/5 border border-white/5 rounded-[1.5rem] transition-all">
                <div className="flex items-center gap-4">
                  <action.i className="w-4 h-4 text-blue-500" />
                  <span className="text-[11px] font-bold text-slate-200 uppercase tracking-widest">{action.l}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-700" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export { ReportCenter };