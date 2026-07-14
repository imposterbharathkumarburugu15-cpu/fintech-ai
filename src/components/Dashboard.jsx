import { TrendingUp, CreditCard, Target, MoreHorizontal, Briefcase } from "lucide-react";
import { CashFlowChart } from "./CashFlowChart";
function StatCard({ title, value, change, isPositive, icon: Icon }) {
  return <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 flex flex-col justify-between transition-all hover:border-[#3f3f46]">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-[10px] bg-[#27272a] flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#a1a1aa]" />
        </div>
        <div className={`px-2.5 py-1 rounded-md text-xs font-medium ${isPositive ? "bg-[#22c55e]/10 text-[#22c55e]" : "bg-[#ef4444]/10 text-[#ef4444]"}`}>
          {isPositive ? "+" : ""}{change}
        </div>
      </div>
      <div>
        <p className="text-[#a1a1aa] text-[14px] mb-1">{title}</p>
        <h3 className="text-[28px] font-semibold text-white tracking-tight">{value}</h3>
      </div>
    </div>;
}
function Dashboard() {
  return <div className="max-w-[1000px] mx-auto flex flex-col h-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <p className="text-[#3b82f6] text-[11px] font-bold tracking-[0.1em] mb-3 uppercase">
            {new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(/* @__PURE__ */ new Date())}
          </p>
          <h1 className="text-[40px] font-semibold text-white tracking-[-0.02em] mb-2 leading-none">Dashboard</h1>
          <p className="text-[#a1a1aa] text-[16px]">AI Financial Health Score: <span className="text-[#22c55e] font-semibold">92/100 (Excellent)</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard title="Net Worth" value="$1.24M" change="4.8%" isPositive={true} icon={Briefcase} />
        <StatCard title="Monthly Income" value="$14,500" change="3.6%" isPositive={true} icon={TrendingUp} />
        <StatCard title="Monthly Expenses" value="$4,520" change="10.5%" isPositive={false} icon={CreditCard} />
        <StatCard title="Savings Rate" value="68%" change="2.1%" isPositive={true} icon={Target} />
      </div>

      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 relative flex-1 min-h-[300px] mb-8 mt-2">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-white font-medium text-[16px] mb-1">Budget Progress & Cash Flow</h3>
            <p className="text-[#a1a1aa] text-[14px]">Income and spending, last six months</p>
          </div>
          <button className="text-[#71717a] hover:text-white transition-colors">
            <MoreHorizontal className="w-[20px] h-[20px]" />
          </button>
        </div>
        <div className="h-[250px] w-full">
          <CashFlowChart />
        </div>
      </div>
    </div>;
}
export {
  Dashboard
};
