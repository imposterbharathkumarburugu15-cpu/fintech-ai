import React from "react";
import { motion } from "motion/react";
import { 
  Sparkles, Search, ArrowRight, TrendingUp, TrendingDown, 
  Wallet, BarChart2, Lightbulb, Activity, ArrowUpRight, 
  ChevronRight, Calendar, Bell, PieChart, ShieldCheck, Target,
  Mic, Zap, CreditCard, Info, ShoppingBag, Coffee
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart as RePieChart, Pie, Cell
} from "recharts";

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
  return (
    <div className="max-w-[1400px] mx-auto page-shell">
      
      {/* Hero Header Section */}
      <div className="page-header flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <h1 className="page-title text-3xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-2">
            Your finances at a glance <span className="text-amber-400 text-2xl"></span>
          </h1>
          <p className="text-[#a1a1aa] text-sm mt-1">Here's your financial operating picture for today.</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#a1a1aa] mt-4 md:mt-0">
          <span className="flex items-center gap-1.5 bg-[#121214] px-3 py-1.5 rounded-lg border border-white/5">
            <Calendar className="w-3.5 h-3.5 text-[#8b5cf6]" />
            {new Date().toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </span>
          <span className="flex items-center gap-1.5 bg-[#121214] px-3 py-1.5 rounded-lg border border-white/5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Market: <span className="text-white font-medium">US Market Open</span>
          </span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Ask Nexus AI Block */}
          <div className="bg-[#121214] border border-white/5 rounded-3xl p-4 sm:p-6 shadow-xl">
            <h2 className="text-white text-[16px] font-semibold mb-4">How can Nexus AI help you today?</h2>
            
            {/* Unified Input Field */}
            <div 
              onClick={onToggleChat}
              className="relative flex items-center bg-[#18181b] border border-white/5 hover:border-white/10 rounded-2xl p-2 pl-3 sm:pl-4 cursor-text transition-all duration-300 group min-h-[56px] mb-4"
            >
              <Search className="w-5 h-5 text-[#52525b] group-hover:text-[#a1a1aa] mr-3 shrink-0 transition-colors" />
              <span className="text-[#52525b] group-hover:text-[#a1a1aa] text-[14px] flex-1 text-left transition-colors">
                Search your finances or ask anything...
              </span>
              
              <div className="flex items-center gap-3 shrink-0">
                <Mic className="w-4 h-4 text-[#71717a] hover:text-white transition-colors cursor-pointer" />
                <button 
                  type="button"
                  className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white text-[12px] font-bold px-4 py-2 rounded-xl transition-all shadow-[0_0_12px_rgba(99,102,241,0.2)] active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ask Nexus AI</span>
                </button>
              </div>
            </div>

            {/* Suggestions Chips Row */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: "Analyze my spending" },
                { label: "Best stocks to buy now" },
                { label: "Review my portfolio" },
                { label: "SIP recommendation" }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={onToggleChat}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#18181b] border border-white/5 hover:border-indigo-500/30 hover:bg-[#1f1f24] transition-all text-[#a1a1aa] hover:text-white text-[13px] font-medium"
                >
                  <Zap className="w-3.5 h-3.5 text-indigo-400" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* KPI Cards Row (4 columns) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Card 1: Net Worth */}
            <div className="bg-[#121214] border border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:border-white/10 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <Wallet className="w-4 h-4 text-indigo-400" />
                </div>
              </div>
              <div>
                <span className="text-[#a1a1aa] text-xs font-semibold uppercase tracking-wider">Net Worth</span>
                <h3 className="text-white text-xl md:text-2xl font-bold mt-1 tracking-tight">₹24,85,430</h3>
                <p className="text-emerald-400 text-[11px] font-semibold mt-2 flex items-center gap-1">
                  <span>↗</span> 4.8% <span className="text-[#71717a] font-normal">vs last month</span>
                </p>
              </div>
            </div>

            {/* Card 2: Cash Flow */}
            <div className="bg-[#121214] border border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:border-white/10 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <Activity className="w-4 h-4 text-blue-400" />
                </div>
              </div>
              <div>
                <span className="text-[#a1a1aa] text-xs font-semibold uppercase tracking-wider">Cash Flow</span>
                <h3 className="text-white text-xl md:text-2xl font-bold mt-1 tracking-tight">+₹45,680</h3>
                <p className="text-emerald-400 text-[11px] font-semibold mt-2 flex items-center gap-1">
                  <span>↗</span> 12.4% <span className="text-[#71717a] font-normal">vs last month</span>
                </p>
              </div>
            </div>

            {/* Card 3: Monthly Spend */}
            <div className="bg-[#121214] border border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:border-white/10 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                </div>
              </div>
              <div>
                <span className="text-[#a1a1aa] text-xs font-semibold uppercase tracking-wider">Monthly Spend</span>
                <h3 className="text-white text-xl md:text-2xl font-bold mt-1 tracking-tight">₹68,540</h3>
                <p className="text-emerald-400 text-[11px] font-semibold mt-2 flex items-center gap-1">
                  <span>↗</span> 5.2% <span className="text-[#71717a] font-normal">vs last month</span>
                </p>
              </div>
            </div>

            {/* Card 4: Savings Rate */}
            <div className="bg-[#121214] border border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:border-white/10 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Target className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <div>
                <span className="text-[#a1a1aa] text-xs font-semibold uppercase tracking-wider">Savings Rate</span>
                <h3 className="text-white text-xl md:text-2xl font-bold mt-1 tracking-tight">68%</h3>
                <p className="text-emerald-400 text-[11px] font-semibold mt-2 flex items-center gap-1">
                  <span>↗</span> 2.1% <span className="text-[#71717a] font-normal">vs last month</span>
                </p>
              </div>
            </div>

          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Cash Flow Overview Chart */}
            <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-white text-[15px] font-semibold">Cash Flow Overview</h3>
                  <Info className="w-3.5 h-3.5 text-[#52525b]" />
                </div>
                <div>
                  <select className="bg-[#18181b] border border-white/5 rounded-lg px-2.5 py-1 text-[11px] text-[#a1a1aa] focus:outline-none focus:border-indigo-500 font-medium cursor-pointer">
                    <option>6 Months</option>
                    <option>3 Months</option>
                    <option>1 Year</option>
                  </select>
                </div>
              </div>

              {/* Legend row */}
              <div className="flex items-center gap-4 mb-6 text-xs text-[#a1a1aa] font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                  Income
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
                  Expenses
                </div>
              </div>

              {/* Area Chart Container */}
              <div className="h-[220px] w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: -22, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#52525b", fontSize: 11, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#52525b", fontSize: 11, fontWeight: 500 }}
                      tickFormatter={(v) => `₹${v/1000}k`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#18181b", borderColor: "rgba(255,255,255,0.05)", borderRadius: "12px", color: "#fff" }}
                      itemStyle={{ color: "#fff", fontWeight: 500 }}
                      cursor={{ stroke: "#27272a", strokeWidth: 1, strokeDasharray: "4 4" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorIncome)"
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stroke="#8b5cf6"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorExpenses)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Portfolio Allocation Pie Card */}
            <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 flex flex-col">
              <div className="flex items-center gap-1.5 mb-6">
                <h3 className="text-white text-[15px] font-semibold">Portfolio Allocation</h3>
                <Info className="w-3.5 h-3.5 text-[#52525b]" />
              </div>

              <div className="flex flex-row items-center justify-between gap-4 flex-1">
                {/* Doughnut Chart */}
                <div className="w-[150px] h-[150px] shrink-0 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={portfolioAllocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {portfolioAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </RePieChart>
                  </ResponsiveContainer>
                  {/* Absolute Center Total */}
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-[10px] text-[#71717a] uppercase font-bold tracking-wider">Total</span>
                    <span className="text-[13px] font-bold text-white">₹24.8L</span>
                  </div>
                </div>

                {/* Customized Legend List */}
                <div className="flex-1 flex flex-col gap-3 pl-2">
                  {portfolioAllocation.map((item, index) => (
                    <div key={index} className="flex flex-col gap-0.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-[#a1a1aa] font-medium">{item.name}</span>
                        </div>
                        <span className="text-white font-semibold font-mono">{item.value}%</span>
                      </div>
                      <span className="text-[10px] text-[#71717a] font-mono pl-4">{item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Sidebar Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Nexus AI Daily Brief */}
          <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 flex flex-col shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-white text-[15px] font-semibold">Nexus AI Daily Brief</h3>
              </div>
              <span className="text-[10px] text-[#71717a] font-semibold">Updated 8:30 AM</span>
            </div>

            {/* Brief items list */}
            <div className="flex flex-col gap-5 mb-6">
              
              {/* Item 1 */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0 mt-0.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-xs text-[#a1a1aa] leading-relaxed">
                    You're spending <span className="text-white font-semibold">12% less</span> this month on discretionary expenses.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
                  Good job! 🥳
                </span>
              </div>

              {/* Item 2 */}
              <div className="flex items-start justify-between gap-3 group cursor-pointer" onClick={onToggleChat}>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shrink-0 mt-0.5">
                    <Bell className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <p className="text-xs text-[#a1a1aa] leading-relaxed group-hover:text-white transition-colors">
                    <span className="text-white font-semibold">NVIDIA earnings</span> tomorrow. May impact tech sector &amp; your portfolio.
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#52525b] group-hover:text-white mt-1 transition-colors shrink-0" />
              </div>

              {/* Item 3 */}
              <div className="flex items-start justify-between gap-3 group cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0 mt-0.5">
                    <Wallet className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <p className="text-xs text-[#a1a1aa] leading-relaxed group-hover:text-white transition-colors">
                    Emergency fund is <span className="text-white font-semibold">82% complete</span>. You're on track!
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#52525b] group-hover:text-white mt-1 transition-colors shrink-0" />
              </div>

              <div className="h-px bg-white/5 my-1" />

              {/* Recommended Action block */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Recommended Action</span>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0 mt-0.5">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <p className="text-xs text-[#a1a1aa] leading-relaxed">
                    Increase your SIP by <span className="text-white font-semibold">₹2,000</span> to reach your goal 3 months earlier.
                  </p>
                </div>
              </div>

            </div>

            {/* View Full Brief button */}
            <button 
              onClick={onToggleChat}
              className="w-full flex items-center justify-between bg-[#18181b] border border-white/5 hover:border-white/10 hover:bg-[#1f1f24] text-white text-[12px] font-semibold px-4 py-2.5 rounded-xl transition-all group"
            >
              <span>View Full Brief</span>
              <ChevronRight className="w-4 h-4 text-[#71717a] group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white text-[15px] font-semibold">Recent Activity</h3>
              <button 
                onClick={() => onViewChange("expenses")} 
                className="text-[#a855f7] hover:text-purple-400 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {[
                { name: "Apple Store", type: "Technology", date: "Today", amount: "₹1,259", icon: ShoppingBag, color: "text-orange-400", bg: "bg-orange-500/10" },
                { name: "Amazon India", type: "Shopping", date: "Yesterday", amount: "₹3,450", icon: CreditCard, color: "text-indigo-400", bg: "bg-indigo-500/10" },
                { name: "Starbucks Coffee", type: "Dining Out", date: "July 15", amount: "₹450", icon: Coffee, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                { name: "Zerodha Fund", type: "Investment", date: "July 12", amount: "₹15,000", icon: Wallet, color: "text-blue-400", bg: "bg-blue-500/10" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between group cursor-pointer hover:bg-[#18181b] p-2 rounded-xl -mx-2 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${activity.bg} flex items-center justify-center border border-white/5 shrink-0`}>
                      <activity.icon className={`w-4 h-4 ${activity.color}`} />
                    </div>
                    <div>
                      <p className="text-white text-xs font-semibold group-hover:text-[#a855f7] transition-colors">{activity.name}</p>
                      <p className="text-[#71717a] text-[10px] mt-0.5">{activity.type} · {activity.date}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white font-mono">{activity.amount}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
