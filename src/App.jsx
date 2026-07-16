import { useState } from "react";
import { Search, Bell, ChevronDown, Command } from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { CopilotChat } from "./components/NexusAI";
import { AddTransactionModal } from "./components/AddTransactionModal";
import { Dashboard } from "./components/Dashboard";
import { ExpenseIntelligence } from "./components/ExpenseIntelligence";
import { StockResearch } from "./components/StockResearch";
import { PortfolioIntelligence } from "./components/PortfolioIntelligence";
import { GoalPlanner } from "./components/GoalPlanner";
import { ReportCenter } from "./components/ReportCenter";
import { MarketIntelligence } from "./components/MarketIntelligence";
import { SmartAlerts } from "./components/SmartAlerts";

const PAGE_TITLES = {
  dashboard: "Dashboard",
  expenses: "Expense Intelligence",
  stocks: "Stock Research",
  portfolio: "Portfolio Intelligence",
  goals: "Goal Planner",
  reports: "AI Report Center",
  markets: "Market Intelligence",
  alerts: "Smart Alerts",
};

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [notifCount] = useState(3);

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard onViewChange={setActiveView} onToggleChat={() => setIsChatOpen(true)} />;
      case "expenses":
        return <ExpenseIntelligence />;
      case "stocks":
        return <StockResearch />;
      case "portfolio":
        return <PortfolioIntelligence />;
      case "goals":
        return <GoalPlanner />;
      case "reports":
        return <ReportCenter />;
      case "markets":
        return <MarketIntelligence />;
      case "alerts":
        return <SmartAlerts />;
      default:
        return <Dashboard onViewChange={setActiveView} onToggleChat={() => setIsChatOpen(true)} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#09090b] overflow-hidden text-[#fafafa] font-sans">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-0">
        {/* Header */}
        <header className="h-[64px] flex items-center justify-between px-8 border-b border-[#1e1e22] bg-[#09090b] shrink-0">
          {/* Search */}
          <div className="relative w-80">
            <Search className="w-4 h-4 text-[#52525b] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full bg-[#18181b] border border-[#27272a] text-[13px] text-white rounded-xl pl-10 pr-14 py-2 focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all placeholder:text-[#52525b]"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-[#3f3f46] bg-[#1e1e22] px-1.5 font-sans text-[10px] font-medium text-[#71717a]">
                <Command className="w-2.5 h-2.5" />K
              </kbd>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button className="relative w-9 h-9 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#71717a] hover:text-white hover:border-[#3f3f46] transition-all">
              <Bell className="w-4 h-4" />
              {notifCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ef4444] border border-[#09090b]" />
              )}
            </button>

            {/* Divider */}
            <div className="h-6 w-px bg-[#27272a]" />

            {/* User */}
            <button className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-[#18181b] transition-colors group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]">
                MA
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-[13px] font-semibold text-white leading-tight">Maya</p>
                <p className="text-[10px] text-[#52525b] leading-tight">Pro Plan</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#52525b] group-hover:text-[#a1a1aa] transition-colors" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide relative">
          {renderView()}
        </div>

        {/* Copilot Chat Slide-over */}
        <CopilotChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

        {/* Modals */}
        <AddTransactionModal
          isOpen={isAddTransactionOpen}
          onClose={() => setIsAddTransactionOpen(false)}
        />
      </main>
    </div>
  );
}

export default App;
