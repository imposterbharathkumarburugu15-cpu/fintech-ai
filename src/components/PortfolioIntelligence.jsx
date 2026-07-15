import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Cell } from "recharts";
import { ShieldAlert, ShieldCheck, AlertTriangle, Activity, Briefcase, TrendingUp, TrendingDown, Info } from "lucide-react";

const riskData = [
  { subject: "Market Risk", A: 85, fullMark: 100 },
  { subject: "Credit Risk", A: 65, fullMark: 100 },
  { subject: "Liquidity", A: 90, fullMark: 100 },
  { subject: "Operational", A: 45, fullMark: 100 },
  { subject: "Compliance", A: 75, fullMark: 100 },
  { subject: "Systemic", A: 55, fullMark: 100 }
];

const exposureData = [
  { sector: "Technology", value: 45 },
  { sector: "Financials", value: 25 },
  { sector: "Healthcare", value: 15 },
  { sector: "Energy", value: 10 },
  { sector: "Consumer", value: 5 }
];

const HOLDINGS = [
  { symbol: "AAPL", name: "Apple Inc.", shares: 150, price: 214.32, value: 32148, allocation: 28, change: 1.24 },
  { symbol: "NVDA", name: "NVIDIA Corp.", shares: 45, price: 875.40, value: 39393, allocation: 34, change: 2.34 },
  { symbol: "VOO", name: "Vanguard S&P 500", shares: 80, price: 504.12, value: 40329, allocation: 35, change: 0.52 },
  { symbol: "BND", name: "Vanguard Total Bond", shares: 45, price: 72.40, value: 3258, allocation: 3, change: -0.15 },
];

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];

function CustomBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-xl px-3 py-2 shadow-xl">
      <p className="text-[11px] text-[#71717a] mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-white">{payload[0].value}%</p>
    </div>
  );
}

function PortfolioIntelligence() {
  const totalValue = HOLDINGS.reduce((sum, h) => sum + h.value, 0);

  return (
    <div className="max-w-[1080px] mx-auto flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-end mb-8 animate-fade-in-up">
        <div>
           <p className="text-[#3b82f6] text-[11px] font-bold tracking-[0.12em] mb-2 uppercase">Investments</p>
          <h1 className="text-[38px] font-semibold text-white tracking-[-0.025em] mb-2 leading-none">Portfolio Intelligence</h1>
          <p className="text-[#71717a] text-[15px]">AI-driven portfolio allocation and risk modeling.</p>
        </div>
        <div className="flex items-center gap-2.5 bg-[#18181b] border border-[#27272a] px-4 py-2.5 rounded-xl shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22c55e]"></span>
          </span>
          <span className="text-white font-medium text-[13px]">System Status: Nominal</span>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 animate-fade-in-up stagger-1">
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 hover:border-[#3f3f46] transition-colors group">
           <div className="flex justify-between items-start mb-3">
            <span className="text-[#a1a1aa] text-[13px] font-medium">Total Balance</span>
            <Briefcase className="w-4 h-4 text-[#71717a] group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-[28px] font-bold text-white tracking-tight leading-none">${totalValue.toLocaleString()}</h3>
          <div className="flex items-center text-[#22c55e] text-[12px] font-semibold mt-2">
             <TrendingUp className="w-3.5 h-3.5 mr-1" /> +12.4% YTD
          </div>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 hover:border-[#3f3f46] transition-colors group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[#a1a1aa] text-[13px] font-medium">Value at Risk (VaR)</span>
            <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
          </div>
          <h3 className="text-[28px] font-bold text-white tracking-tight leading-none">$8,450</h3>
          <p className="text-[12px] text-[#71717a] mt-2">99% confidence interval, 10-day</p>
        </div>
        
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 hover:border-[#3f3f46] transition-colors group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[#a1a1aa] text-[13px] font-medium">Stress Test Impact</span>
            <Activity className="w-4 h-4 text-[#f59e0b]" />
          </div>
          <h3 className="text-[28px] font-bold text-white tracking-tight leading-none">-14.2%</h3>
          <p className="text-[12px] text-[#71717a] mt-2">Historical scenario: 2008 Crash</p>
        </div>
        
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 hover:border-[#3f3f46] transition-colors group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[#a1a1aa] text-[13px] font-medium">Sharpe Ratio</span>
            <ShieldCheck className="w-4 h-4 text-[#3b82f6]" />
          </div>
          <h3 className="text-[28px] font-bold text-white tracking-tight leading-none">2.14</h3>
          <p className="text-[12px] text-[#71717a] mt-2">Excellent risk-adjusted return</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-fade-in-up stagger-2">
        {/* Holdings Table */}
        <div className="lg:col-span-2 bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-[#27272a] flex justify-between items-center bg-[#09090b]">
            <h3 className="text-white font-semibold text-[15px]">Current Holdings</h3>
            <button className="text-[#3b82f6] text-[12px] font-semibold hover:text-[#60a5fa] transition-colors">Trade</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-[#18181b]">
                <tr className="border-b border-[#27272a]">
                  <th className="text-left text-[#71717a] font-semibold uppercase tracking-wider py-3 px-6">Asset</th>
                  <th className="text-right text-[#71717a] font-semibold uppercase tracking-wider py-3 px-6">Price</th>
                  <th className="text-right text-[#71717a] font-semibold uppercase tracking-wider py-3 px-6">Holdings</th>
                  <th className="text-right text-[#71717a] font-semibold uppercase tracking-wider py-3 px-6">Allocation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a]">
                {HOLDINGS.map((h) => (
                  <tr key={h.symbol} className="hover:bg-[#1a1a1d] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#27272a] flex items-center justify-center font-bold text-[11px] text-white">
                          {h.symbol.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{h.symbol}</p>
                          <p className="text-[11px] text-[#71717a]">{h.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <p className="font-mono text-white">${h.price.toFixed(2)}</p>
                      <p className={`text-[11px] font-semibold ${h.change >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                         {h.change >= 0 ? "+" : ""}{h.change}%
                      </p>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <p className="font-mono text-white">${h.value.toLocaleString()}</p>
                      <p className="text-[11px] text-[#71717a]">{h.shares} shares</p>
                    </td>
                    <td className="py-4 px-6 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <div className="w-16 h-1.5 bg-[#27272a] rounded-full overflow-hidden">
                           <div className="h-full bg-[#3b82f6]" style={{ width: `${h.allocation}%` }} />
                         </div>
                         <span className="font-mono text-white w-8 text-right">{h.allocation}%</span>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts Col */}
        <div className="space-y-6">
           <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-2">
               <h3 className="text-white font-semibold text-[15px]">Risk Vector</h3>
               <Info className="w-4 h-4 text-[#71717a] hover:text-white cursor-pointer transition-colors" />
            </div>
            <p className="text-[#a1a1aa] text-[12px] mb-4">Multi-dimensional risk assessment.</p>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={riskData}>
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#a1a1aa", fontSize: 11, fontWeight: 500 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Risk Score" dataKey="A" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.25} />
                  <RechartsTooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px", color: "#fff", fontSize: "12px" }} itemStyle={{ color: "#3b82f6" }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 flex flex-col">
            <h3 className="text-white font-semibold text-[15px] mb-1">Sector Exposure</h3>
            <p className="text-[#a1a1aa] text-[12px] mb-4">Warning: High technology concentration.</p>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={exposureData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="sector" type="category" axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 12 }} width={80} />
                  <RechartsTooltip cursor={{ fill: "#27272a", opacity: 0.4 }} content={<CustomBarTooltip />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {exposureData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { PortfolioIntelligence };
