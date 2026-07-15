import { Home, Target, Bot, FileText, TrendingUp, CreditCard, Search, Bell, PieChart } from "lucide-react";

const NAV_ITEMS = [
  { icon: Home, id: "dashboard", label: "Dashboard" },
  { icon: CreditCard, id: "expenses", label: "Expense Intelligence" },
  { icon: Search, id: "stocks", label: "Stock Research" },
  { icon: PieChart, id: "portfolio", label: "Portfolio" },
  { icon: Target, id: "goals", label: "Goal Planner" },
  { icon: FileText, id: "reports", label: "Report Center" },
  { icon: TrendingUp, id: "markets", label: "Market Intelligence" },
  { icon: Bell, id: "alerts", label: "Smart Alerts" },
];

function Sidebar({ activeView, onViewChange, onToggleChat }) {
  return (
    <aside className="group w-[72px] hover:w-[240px] border-r border-[#1e1e22] bg-[#09090b] flex flex-col items-start py-5 shrink-0 z-20 transition-all duration-300 ease-in-out overflow-hidden relative">
      
      {/* Logo */}
      <div className="flex items-center px-4 w-full mb-8 whitespace-nowrap">
        <div className="w-10 h-10 shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)] border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <span className="relative z-10 font-black">F</span>
        </div>
        <div className="flex flex-col justify-center ml-3 opacity-0 group-hover:opacity-100 transition-all duration-200 overflow-hidden">
          <span className="text-white font-bold text-[15px] tracking-tight leading-none mb-0.5 whitespace-nowrap">
            FinPilot
          </span>
          <span className="text-[#3b82f6] font-semibold text-[9px] tracking-[0.2em] uppercase whitespace-nowrap">
            AI Financial OS
          </span>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex flex-col w-full flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ icon: Icon, id, label }) => {
          const isActive = activeView === id;
          return (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              data-tooltip={label}
              className={`tooltip relative flex items-center w-full px-2.5 py-2.5 rounded-xl transition-all duration-150 whitespace-nowrap group/item ${
                isActive
                  ? "bg-[#1e1e22] text-white"
                  : "text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#18181b]"
              }`}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#3b82f6] rounded-r-full" />
              )}

              <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? "text-white" : "text-[#52525b] group-hover/item:text-[#a1a1aa]"
                  }`}
                />
              </div>

              <span
                className={`ml-3 text-[13px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                  isActive ? "text-white" : "text-[#a1a1aa]"
                }`}
              >
                {label}
              </span>

              {/* Alerts badge */}
              {id === "alerts" && (
                <span className="absolute top-2 left-[22px] w-2 h-2 rounded-full bg-[#ef4444] border-2 border-[#09090b] group-hover:left-auto group-hover:right-3 group-hover:top-1/2 group-hover:-translate-y-1/2 group-hover:w-auto group-hover:h-auto group-hover:px-1.5 group-hover:py-0.5 group-hover:text-[10px] group-hover:text-white group-hover:font-semibold transition-all duration-200">
                  <span className="hidden group-hover:inline">3 new</span>
                </span>
              )}
            </button>
          );
        })}

        {/* Divider */}
        <div className="h-px bg-[#1e1e22] mx-1 my-2" />

        {/* Ask Copilot CTA */}
        <button
          onClick={onToggleChat}
          className="relative flex items-center w-full px-2.5 py-2.5 rounded-xl text-[#3b82f6] hover:bg-[#3b82f6]/10 hover:text-[#60a5fa] transition-all duration-150 mt-1 whitespace-nowrap group/copilot overflow-hidden"
          title="FinPilot AI"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6]/0 to-[#8b5cf6]/0 group-hover/copilot:from-[#3b82f6]/5 group-hover/copilot:to-[#8b5cf6]/5 transition-all duration-300" />
          <div className="w-5 h-5 shrink-0 flex items-center justify-center relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
          </div>
          <span className="ml-3 text-[13px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Ask Copilot
          </span>
        </button>
      </div>

      {/* Bottom user section */}
      <div className="px-3 w-full mt-4 pt-4 border-t border-[#1e1e22]">
        <div className="flex items-center px-2.5 py-2 rounded-xl hover:bg-[#18181b] transition-colors cursor-pointer whitespace-nowrap">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
            MA
          </div>
          <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <p className="text-[12px] font-semibold text-white">Maya</p>
            <p className="text-[10px] text-[#52525b]">Pro Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export { Sidebar };
