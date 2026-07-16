import React from "react";
import { 
  TrendingUp, Wallet, CreditCard, Target, Search, Mic, Sparkles, 
  ArrowUpRight, ArrowDownRight, Megaphone, Calendar, ChevronRight,
  Activity, Zap, PieChart, Info, MoreHorizontal
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart as RechartsPie, Pie, Cell } from "recharts";

const cashFlowData = [
  { t: "Dec '24", income: 72000, expenses: 45000 },
  { t: "Jan '25", income: 85000, expenses: 48000 },
  { t: "Feb '25", income: 78000, expenses: 42000 },
  { t: "Mar '25", income: 92000, expenses: 49000 },
  { t: "Apr '25", income: 95000, expenses: 51000 },
  { t: "May '25", income: 104250, expenses: 58570 },
];

const portfolioData = [
  { name: "Equity", value: 62, amount: "₹15,42,966", color: "#3b82f6" },
  { name: "Mutual Funds", value: 18, amount: "₹4,47,377", color: "#8b5cf6" },
  { name: "Debt", value: 12, amount: "₹2,98,251", color: "#f59e0b" },
  { name: "Cash", value: 8, amount: "₹1,96,836", color: "#22c55e" },
];

const recentActivity = [
  { name: "Apple Store", category: "Technology", date: "Today", amount: -1299, icon: "🍎" },
  { name: "Salary Credit", category: "HDFC Bank", date: "Today", amount: 85400, icon: "🏦" },
  { name: "Amazon Purchase", category: "Shopping", date: "Yesterday", amount: -2349, icon: "🛒" },
  { name: "SIP - Parag Parikh Flexi Cap", category: "Mutual Fund", date: "May 20", amount: -5000, icon: "📈" },
];

function StatCard({ title, value, change, isPositive, icon: Icon, iconColor }) {
  return (
    <div className="bg-[#0f0f11] border border-[#27272a] rounded-2xl p-5 hover:border-[#3f3f46] transition-all">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#18181b] border border-[#27272a]">
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
      </div>
      <p className="text-[13px] text-[#a1a1aa] font-medium mb-1">{title}</p>
      <h3 className="text-[24px] font-bold text-white tracking-tight mb-2 font-mono">{value}</h3>
      <div className={`flex items-center text-[11px] font-bold ${isPositive ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
        {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
        {change}
      </div>
    </div>
  );
}

export function Dashboard({ onToggleChat, onViewChange }) {
  return (
    <div className="max-w-[1400px] mx-auto flex flex-col h-full pb-10 animate-fade-in-up">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8 relative z-10">
        <div>
          <h1 className="text-[32px] font-semibold text-white tracking-tight mb-1 flex items-center gap-3">
            Good Morning, Maya ☀️
          </h1>
          <p className="text-[#a1a1aa] text-[15px]">Here's your financial operating picture for today.</p>
        </div>
        <div className="flex items-center gap-4 text-[13px]">
          <div className="flex items-center gap-2 text-[#a1a1aa]">
            <Calendar className="w-4 h-4" />
            May 22, 2025
          </div>
          <div className="w-px h-4 bg-[#27272a]" />
          <div className="flex items-center gap-2 text-[#a1a1aa]">
            Market: <span className="flex items-center gap-1.5 text-white"><span className="w-2 h-2 rounded-full bg-[#22c55e]" /> US Market Open</span>
          </div>
        </div>
      </div>

      {/* Main Grid Structure */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        
        {/* LEFT COLUMN (Flex 2) */}
        <div className="flex-[2] flex flex-col gap-6">
          
          {/* Nexus AI Search Card */}
          <div className="bg-[#0f0f11] border border-[#27272a] rounded-3xl p-6 relative overflow-hidden">
            <h2 className="text-white font-medium text-[16px] mb-4">How can Nexus AI help you today?</h2>
            <div className="relative mb-5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
              <input 
                type="text" 
                placeholder="Search your finances or ask anything..."
                className="w-full bg-[#18181b] border border-[#27272a] rounded-2xl pl-12 pr-40 py-4 text-[15px] text-white placeholder:text-[#52525b] focus:outline-none focus:border-[#3b82f6] transition-all"
              />
              <Mic className="absolute right-36 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a] hover:text-white cursor-pointer transition-colors" />
              <button 
                onClick={onToggleChat}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#4f46e5] hover:to-[#9333ea] text-white text-[13px] font-bold px-4 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              >
                <Sparkles className="w-4 h-4" />
                Ask Nexus AI
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Analyze my spending", action: () => onViewChange("expenses") },
                { label: "Best stocks to buy now", action: () => onViewChange("stocks") },
                { label: "Review my portfolio", action: () => onViewChange("portfolio") },
                { label: "SIP recommendation", action: onToggleChat }
              ].map(chip => (
                <button key={chip.label} onClick={chip.action} className="flex items-center gap-2 bg-[#121214] border border-[#27272a] text-[#a1a1aa] text-[13px] px-4 py-2 rounded-xl hover:bg-[#18181b] hover:text-white transition-colors">
                  <Zap className="w-3.5 h-3.5" />
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stat Cards Row */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard title="Net Worth" value="₹24,85,430" change="↗ 4.8% vs last month" isPositive icon={Wallet} iconColor="#a855f7" />
            <StatCard title="Cash Flow" value="+₹45,680" change="↗ 12.4% vs last month" isPositive icon={Activity} iconColor="#3b82f6" />
            <StatCard title="Monthly Spend" value="₹68,540" change="↓ 5.2% vs last month" isPositive icon={CreditCard} iconColor="#f59e0b" />
            <StatCard title="Savings Rate" value="68%" change="↗ 2.1% vs last month" isPositive icon={Target} iconColor="#22c55e" />
          </div>

          {/* Row 3 Split: Cash Flow (60%) & Portfolio (40%) */}
          <div className="flex gap-6 h-[340px]">
            {/* Cash Flow Overview */}
            <div className="flex-[3] bg-[#0f0f11] border border-[#27272a] rounded-3xl p-6 flex flex-col relative overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#8b5cf6]/5 to-transparent pointer-events-none" />
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h3 className="text-white font-semibold text-[15px] flex items-center gap-2">Cash Flow Overview <Info className="w-4 h-4 text-[#71717a]" /></h3>
                  <p className="text-[#a1a1aa] text-[12px] mt-1">Income vs Expenses</p>
                </div>
                <button className="bg-[#18181b] border border-[#27272a] text-[#a1a1aa] text-[12px] px-3 py-1.5 rounded-lg flex items-center gap-2 hover:text-white transition-colors">
                  6 Months <ChevronDown className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center gap-6 mb-4 relative z-10">
                <div className="flex items-center gap-2 text-[12px] text-white"><span className="w-2 h-2 rounded-full bg-[#3b82f6]" /> Income</div>
                <div className="flex items-center gap-2 text-[12px] text-white"><span className="w-2 h-2 rounded-full bg-[#a855f7]" /> Expenses</div>
              </div>
              <div className="flex-1 w-full min-h-0 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashFlowData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="t" axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 11 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 11 }} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
                    <Tooltip cursor={{ stroke: '#3f3f46', strokeWidth: 1, strokeDasharray: '4 4' }} contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                    <Area type="monotone" dataKey="income" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="expenses" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Portfolio Allocation */}
            <div className="flex-[2] bg-[#0f0f11] border border-[#27272a] rounded-3xl p-6 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-white font-semibold text-[15px] flex items-center gap-2">Portfolio Allocation <Info className="w-4 h-4 text-[#71717a]" /></h3>
              </div>
              <div className="flex-1 flex items-center gap-6">
                {/* Donut */}
                <div className="relative w-[140px] h-[140px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie data={portfolioData} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                        {portfolioData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </RechartsPie>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[14px] font-bold text-white font-mono">₹24,85,430</span>
                    <span className="text-[10px] text-[#71717a]">Total Value</span>
                  </div>
                </div>
                {/* Legend */}
                <div className="flex-1 flex flex-col justify-center gap-3">
                  {portfolioData.map((item) => (
                    <div key={item.name} className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-[12px] text-white">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </div>
                      <div className="text-right">
                        <p className="text-[12px] font-bold text-white">{item.value}%</p>
                        <p className="text-[10px] text-[#71717a] font-mono">{item.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#27272a] flex justify-between items-center">
                <div className="flex items-center gap-2 text-[12px] text-[#a1a1aa]">
                  Risk Profile: <span className="px-2 py-0.5 rounded text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20 font-bold">Moderate</span>
                </div>
                <button onClick={() => onViewChange("portfolio")} className="text-[#a855f7] hover:text-[#c084fc] text-[12px] font-bold flex items-center transition-colors">
                  View Portfolio <ArrowRight className="w-3 h-3 ml-1" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (Flex 1) */}
        <div className="flex-[1] flex flex-col gap-6">
          
          {/* Nexus AI Daily Brief */}
          <div className="bg-[#09090b] border border-[#27272a] rounded-3xl p-6 relative overflow-hidden flex flex-col shadow-2xl flex-1">
            <div className="absolute inset-0 bg-gradient-to-b from-[#4f46e5]/10 to-[#9333ea]/5 pointer-events-none" />
            
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-white font-semibold text-[15px] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#a855f7]" /> Nexus AI Daily Brief
              </h3>
              <span className="text-[11px] text-[#71717a]">Updated 8:30 AM</span>
            </div>

            <div className="flex-1 flex flex-col gap-6 relative z-10">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-[#22c55e]" />
                </div>
                <div>
                  <p className="text-white text-[14px] font-medium leading-snug">You're spending 12% less</p>
                  <p className="text-[#a1a1aa] text-[13px] leading-snug mt-1">this month on discretionary expenses.</p>
                </div>
                <div className="ml-auto flex items-start">
                  <span className="text-[#22c55e] text-[12px] font-bold">Good job! 🎉</span>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center shrink-0">
                  <Megaphone className="w-5 h-5 text-[#a855f7]" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-[14px] font-medium leading-snug">NVIDIA earnings tomorrow</p>
                  <p className="text-[#a1a1aa] text-[13px] leading-snug mt-1">May impact tech sector & your portfolio.</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#71717a] mt-1 shrink-0" />
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5 text-[#3b82f6]" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-[14px] font-medium leading-snug">Emergency fund is 82% complete</p>
                  <p className="text-[#a1a1aa] text-[13px] leading-snug mt-1">You're on track!</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#71717a] mt-1 shrink-0" />
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5 text-[#f59e0b]" />
                </div>
                <div className="flex-1">
                  <p className="text-[#f59e0b] text-[12px] font-bold uppercase tracking-wider mb-1">Recommended Action</p>
                  <p className="text-[#a1a1aa] text-[13px] leading-snug">Increase your SIP by <span className="text-white">₹2,000</span> to reach your goal 3 months earlier.</p>
                </div>
              </div>
            </div>

            <button onClick={() => onViewChange("reports")} className="w-full mt-6 bg-[#18181b] border border-[#27272a] text-[#a1a1aa] text-[13px] font-bold py-3 rounded-xl hover:bg-[#27272a] hover:text-white transition-colors flex items-center justify-between px-4 relative z-10">
              View Full Brief <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-[#0f0f11] border border-[#27272a] rounded-3xl p-6 h-[340px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-semibold text-[15px]">Recent Activity</h3>
              <button onClick={() => onViewChange("expenses")} className="text-[#a855f7] text-[12px] font-bold hover:text-[#c084fc] flex items-center transition-colors">
                View all <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">
              {recentActivity.map((t, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[16px]">
                      {t.icon}
                    </div>
                    <div>
                      <p className="text-[14px] text-white font-medium mb-0.5">{t.name}</p>
                      <p className="text-[11px] text-[#71717a]">{t.category} · {t.date}</p>
                    </div>
                  </div>
                  <span className={`text-[13px] font-bold font-mono ${t.amount > 0 ? "text-[#22c55e]" : "text-white"}`}>
                    {t.amount > 0 ? "+" : ""}₹{Math.abs(t.amount).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Smart Alerts Bottom Row */}
      <div className="bg-[#0f0f11] border border-[#27272a] rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-white font-semibold text-[15px]">Smart Alerts</h3>
          <span className="px-2 py-0.5 rounded-full bg-[#a855f7]/20 text-[#a855f7] text-[10px] font-bold border border-[#a855f7]/30">3 New</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Alert 1 */}
          <div onClick={() => onViewChange("alerts")} className="flex items-center justify-between p-4 rounded-2xl bg-[#121214] border border-[#27272a] hover:border-[#3f3f46] transition-colors group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#22c55e]" />
              </div>
              <div>
                <p className="text-[14px] text-white font-medium mb-1 group-hover:text-[#a855f7] transition-colors">NVIDIA earnings tomorrow</p>
                <p className="text-[12px] text-[#71717a]">May 23, 2025 · Before Market Open</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#52525b] group-hover:text-white transition-colors" />
          </div>

          {/* Alert 2 */}
          <div onClick={() => onViewChange("alerts")} className="flex items-center justify-between p-4 rounded-2xl bg-[#121214] border border-[#27272a] hover:border-[#3f3f46] transition-colors group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[#f59e0b]" />
              </div>
              <div>
                <p className="text-[14px] text-white font-medium mb-1 group-hover:text-[#a855f7] transition-colors">Credit Card Bill Due</p>
                <p className="text-[12px] text-[#71717a]">May 25, 2025 · HDFC Credit Card</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#52525b] group-hover:text-white transition-colors" />
          </div>

          {/* Alert 3 */}
          <div onClick={() => onViewChange("alerts")} className="flex items-center justify-between p-4 rounded-2xl bg-[#121214] border border-[#27272a] hover:border-[#3f3f46] transition-colors group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center">
                <PieChart className="w-5 h-5 text-[#8b5cf6]" />
              </div>
              <div>
                <p className="text-[14px] text-white font-medium mb-1 group-hover:text-[#a855f7] transition-colors">Your top spending category</p>
                <p className="text-[12px] text-[#71717a]">Dining out – 28% of total spends</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#52525b] group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>

    </div>
  );
}

// Ensure icons export properly
function ChevronDown(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m6 9 6 6 6-6"/></svg>
}
function ArrowRight(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
}
