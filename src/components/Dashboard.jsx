import { TrendingUp, CreditCard, Target, MoreHorizontal, Briefcase, Sparkles, ArrowRight, ArrowUpRight, ArrowDownRight, Activity, FileText, Bot, Zap, ArrowRightCircle } from "lucide-react";
import { CashFlowChart } from "./CashFlowChart";

const CATEGORY_COLORS = {
  Technology: "#3b82f6",
  Groceries: "#22c55e",
  Entertainment: "#8b5cf6",
  Transportation: "#f59e0b",
  Income: "#22c55e",
  Dining: "#ef4444",
  Other: "#71717a",
};

const recentActivity = [
  { name: "Apple Store", category: "Technology", amount: -1299, date: "Today", insight: "Large Purchase — Represents 18% of your monthly discretionary budget." },
  { name: "Salary Credit", category: "Income", amount: 5400, date: "Yesterday", insight: "Direct Deposit — Arrived 1 day earlier than historical average." },
  { name: "Whole Foods", category: "Groceries", amount: -145.20, date: "Jun 16", insight: "On track — Grocery spending is perfectly aligned with your monthly plan." },
  { name: "Netflix", category: "Entertainment", amount: -15.99, date: "Jun 15", insight: "Subscription — You have 3 active streaming services costing $45/mo." },
];

function HealthScoreAnimated({ score }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center w-[120px] h-[120px] shrink-0">
      <div className="absolute inset-0 rounded-full animate-pulse" style={{ background: `${color}15`, filter: "blur(20px)" }} />
      <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 112 112">
        <circle cx="56" cy="56" r={radius} stroke="#27272a" strokeWidth="4" fill="none" />
        <circle
          cx="56" cy="56" r={radius}
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          style={{ transition: "stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <span className="text-3xl font-bold text-white tracking-tighter leading-none">{score}</span>
        <span className="text-[10px] text-[#71717a] uppercase tracking-widest mt-1 font-semibold">Score</span>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, isPositive, icon: Icon, delay = 0 }) {
  return (
    <div
      className="bg-[#0f0f11] border border-[#27272a] rounded-2xl p-5 hover:border-[#3f3f46] hover:bg-[#18181b] transition-all duration-300 animate-fade-in-up group cursor-default"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-[#a1a1aa] text-[13px] font-medium">{title}</span>
        <Icon className="w-4 h-4 text-[#52525b] group-hover:text-white transition-colors" />
      </div>
      <h3 className="text-[26px] font-semibold text-white tracking-tight mb-2 font-mono">{value}</h3>
      <div className={`flex items-center text-[12px] font-semibold ${isPositive ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
        {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-1" />}
        {change}
      </div>
    </div>
  );
}

function Dashboard({ onViewChange, onToggleChat }) {
  return (
    <div className="max-w-[1080px] mx-auto flex flex-col h-full pb-10">

      {/* Header */}
      <div className="flex justify-between items-end mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-[34px] font-semibold text-white tracking-[-0.03em] mb-1 leading-none">
            Good Morning, Bharath
          </h1>
          <p className="text-[#a1a1aa] text-[15px]">Here is your financial operating picture for today.</p>
        </div>
        <button
          onClick={onToggleChat}
          className="group relative flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-[13px] font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:scale-105 active:scale-95"
        >
          <Bot className="w-4 h-4" />
          Ask Copilot
          <div className="absolute inset-0 rounded-full ring-2 ring-white/20 scale-105 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
        </button>
      </div>

      {/* AI Daily Brief Hero */}
      <div className="relative w-full bg-gradient-to-br from-[#121214] to-[#09090b] border border-[#27272a] rounded-3xl p-8 mb-8 overflow-hidden animate-fade-in-up stagger-1 shadow-2xl">
        {/* Abstract Background Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#3b82f6]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#22c55e]/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row gap-8 lg:items-center justify-between">
          
          <div className="flex-1">
            <div className="flex items-center gap-2 text-[#3b82f6] mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase">AI Daily Brief</span>
            </div>
            
            <div className="space-y-4 mb-8">
              <p className="text-xl text-white font-medium leading-relaxed tracking-tight">
                Your Financial Health increased by <span className="text-[#22c55e]">4 points</span> this week.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-[#a1a1aa] text-[15px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                  <p>Your <strong className="text-white">Emergency Fund</strong> is 84% complete.</p>
                </div>
                <div className="flex items-center gap-3 text-[#a1a1aa] text-[15px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                  <p><strong className="text-white">NVIDIA</strong> reports earnings tomorrow after market close.</p>
                </div>
                <div className="flex items-center gap-3 text-[#a1a1aa] text-[15px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                  <p>You spent <strong className="text-[#22c55e]">12% less</strong> on discretionary items this week.</p>
                </div>
              </div>
            </div>

            <div className="bg-[#18181b]/80 backdrop-blur-md border border-[#27272a] rounded-2xl p-4 inline-flex items-center gap-6">
              <div>
                <p className="text-[11px] text-[#71717a] uppercase font-bold tracking-wider mb-1">Recommended Action</p>
                <p className="text-white font-semibold text-[15px]">Move ₹8,000 into Savings</p>
              </div>
              <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-white text-black hover:bg-[#e4e4e7] transition-colors shadow-lg active:scale-95">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center lg:w-[280px] shrink-0 border-l border-[#27272a]/50 pl-8">
            <div className="flex flex-col items-center">
              <HealthScoreAnimated score={92} />
              <div className="mt-5 text-center">
                <p className="text-white font-semibold text-[18px]">Excellent</p>
                <p className="text-[#71717a] text-[13px] mt-1 max-w-[180px] leading-relaxed">
                  Top 5% of users with similar income profiles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* High-level metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Net Worth" value="$1.24M" change="+4.8% YTD" isPositive icon={Briefcase} delay={100} />
        <StatCard title="Cash Flow" value="+$3,450" change="+12.4% MoM" isPositive icon={Activity} delay={150} />
        <StatCard title="Monthly Spend" value="$4,520" change="-5.2% MoM" isPositive icon={CreditCard} delay={200} />
        <StatCard title="Savings Rate" value="68%" change="+2.1% MoM" isPositive icon={Target} delay={250} />
      </div>

      {/* Main Grid: Chart & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up stagger-3">
        
        {/* Left Col: Chart */}
        <div className="lg:col-span-2 bg-[#09090b] border border-[#27272a] rounded-3xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-white font-semibold text-[16px] mb-1 tracking-tight">Cash Flow Dynamics</h3>
              <p className="text-[#71717a] text-[13px]">Income vs expenses analyzed over 6 months</p>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <CashFlowChart />
          </div>
        </div>

        {/* Right Col: Intelligent Transactions */}
        <div className="bg-[#09090b] border border-[#27272a] rounded-3xl overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-[#27272a] flex justify-between items-center bg-[#09090b] shrink-0">
            <h3 className="text-white font-semibold text-[16px] tracking-tight">Recent Activity</h3>
            <button
              onClick={() => onViewChange?.("expenses")}
              className="text-[#71717a] hover:text-white transition-colors"
            >
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="divide-y divide-[#1e1e22] overflow-y-auto custom-scrollbar">
            {recentActivity.map((t, i) => (
              <div
                key={i}
                className="p-5 hover:bg-[#121214] transition-colors group cursor-default"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{ 
                        background: `${CATEGORY_COLORS[t.category] || "#71717a"}10`,
                        borderColor: `${CATEGORY_COLORS[t.category] || "#71717a"}20`
                      }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: CATEGORY_COLORS[t.category] || "#71717a", boxShadow: `0 0 10px ${CATEGORY_COLORS[t.category] || "#71717a"}` }} />
                    </div>
                    <div>
                      <p className="text-[15px] text-white font-medium tracking-tight mb-0.5">{t.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-[#a1a1aa]">{t.category}</span>
                        <span className="text-[#3f3f46]">·</span>
                        <span className="text-[11px] text-[#71717a]">{t.date}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-[15px] font-semibold font-mono ${t.amount > 0 ? "text-[#22c55e]" : "text-white"}`}>
                    {t.amount > 0 ? "+" : ""}${Math.abs(t.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                {/* AI Insight Pill */}
                <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-2.5 flex items-start gap-2.5 group-hover:border-[#3b82f6]/30 transition-colors">
                  <Zap className="w-3.5 h-3.5 text-[#3b82f6] shrink-0 mt-0.5" />
                  <p className="text-[12px] text-[#a1a1aa] leading-relaxed pr-2">
                    {t.insight}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}

export { Dashboard };
