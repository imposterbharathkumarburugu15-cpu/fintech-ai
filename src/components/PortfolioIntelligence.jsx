import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Cell } from "recharts";
import { ShieldAlert, ShieldCheck, AlertTriangle, Activity } from "lucide-react";
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
const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444"];
function PortfolioIntelligence() {
  return <div className="max-w-[1000px] mx-auto flex flex-col h-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-[40px] font-semibold text-white tracking-[-0.02em] mb-2 leading-none">Portfolio Intelligence</h1>
          <p className="text-[#a1a1aa] text-[16px]">AI-driven portfolio allocation and risk modeling.</p>
        </div>
        <div className="flex items-center gap-3 bg-[#18181b] border border-[#27272a] px-4 py-2 rounded-xl">
          <ShieldCheck className="w-5 h-5 text-[#22c55e]" />
          <span className="text-white font-medium text-sm">System Status: Nominal</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[#a1a1aa] text-[15px] font-medium">Value at Risk (VaR)</span>
            <div className="w-10 h-10 rounded-[10px] bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[#3b82f6]" />
            </div>
          </div>
          <h3 className="text-[32px] font-semibold text-white tracking-tight mb-1 leading-none">$1.24M</h3>
          <p className="text-sm text-[#71717a]">99% confidence interval, 10-day</p>
        </div>
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[#a1a1aa] text-[15px] font-medium">Stress Test Impact</span>
            <div className="w-10 h-10 rounded-[10px] bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#ef4444]" />
            </div>
          </div>
          <h3 className="text-[32px] font-semibold text-white tracking-tight mb-1 leading-none">-8.4%</h3>
          <p className="text-sm text-[#71717a]">Historical scenario: 2008 Crash</p>
        </div>
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[#a1a1aa] text-[15px] font-medium">Sharpe Ratio</span>
            <div className="w-10 h-10 rounded-[10px] bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-[#10b981]" />
            </div>
          </div>
          <h3 className="text-[32px] font-semibold text-white tracking-tight mb-1 leading-none">2.14</h3>
          <p className="text-sm text-[#71717a]">Risk-adjusted return metric</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-[400px] mb-8">
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 flex flex-col">
          <h3 className="text-white font-medium text-[16px] mb-6">Risk Vector Breakdown</h3>
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={riskData}>
                <PolarGrid stroke="#27272a" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#71717a" }} axisLine={false} />
                <Radar name="Risk Score" dataKey="A" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.2} />
                <RechartsTooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px", color: "#fff" }} itemStyle={{ color: "#3b82f6" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 flex flex-col">
          <h3 className="text-white font-medium text-[16px] mb-6">Sector Exposure Concentration</h3>
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={exposureData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="sector" type="category" axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 13 }} width={90} />
                <RechartsTooltip cursor={{ fill: "#27272a", opacity: 0.4 }} contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px", color: "#fff" }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  {exposureData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>;
}
export {
  PortfolioIntelligence
};
