import { Home, Target, Bot, FileText, TrendingUp, CreditCard, Search, Bell, PieChart } from "lucide-react";
function Sidebar({ activeView, onViewChange, onToggleChat }) {
  const topIcons = [
    { icon: Home, id: "dashboard", label: "Dashboard" },
    { icon: CreditCard, id: "expenses", label: "Expense Intelligence" },
    { icon: Search, id: "stocks", label: "Stock Research Hub" },
    { icon: PieChart, id: "portfolio", label: "Portfolio Intelligence" },
    { icon: Target, id: "goals", label: "Goal Planner" },
    { icon: FileText, id: "reports", label: "AI Report Center" },
    { icon: TrendingUp, id: "markets", label: "Market Intelligence" },
    { icon: Bell, id: "alerts", label: "Smart Alerts" }
  ];
  return <aside className="group w-[72px] hover:w-[240px] border-r border-[#27272a] bg-[#09090b] flex flex-col items-start py-5 shrink-0 z-20 transition-all duration-300 overflow-hidden relative">
      <div className="flex items-center px-4 w-full mb-8 whitespace-nowrap relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl blur-xl"></div>
        <div className="w-10 h-10 shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xl rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-white/10 relative z-10 overflow-hidden">
          <div className="absolute inset-0 bg-white/20 blur-md rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          <span className="relative z-10">F</span>
        </div>
        <div className="flex flex-col justify-center ml-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0 relative z-10">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 font-bold text-[16px] tracking-tight leading-none mb-0.5">
            FinPilot
          </span>
          <span className="text-blue-400 font-semibold text-[10px] tracking-[0.2em] uppercase">
            Intelligence
          </span>
        </div>
      </div>
      
      <div className="flex flex-col w-full flex-1 px-3 space-y-2">
        {topIcons.map(({ icon: Icon, id, label }) => <button
    key={id}
    onClick={() => onViewChange(id)}
    className={`flex items-center w-full p-2.5 rounded-xl transition-colors whitespace-nowrap ${activeView === id ? "bg-[#18181b] text-white shadow-sm" : "text-[#71717a] hover:text-white hover:bg-[#18181b]"}`}
  >
            <div className="w-5 h-5 shrink-0 flex items-center justify-center">
              <Icon className="w-5 h-5" />
            </div>
            <span className="ml-3 text-[14px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {label}
            </span>
          </button>)}
        
        {
    /* AI Copilot Button */
  }
        <button
    onClick={onToggleChat}
    className="flex items-center w-full p-2.5 rounded-xl text-[#3b82f6] hover:bg-[#3b82f6]/10 transition-colors mt-2 whitespace-nowrap"
    title="FinPilot AI"
  >
          <div className="w-5 h-5 shrink-0 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <span className="ml-3 text-[14px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Ask Copilot
          </span>
        </button>
      </div>
    </aside>;
}
export {
  Sidebar
};
