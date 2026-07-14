import { useState } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import { Sidebar } from "./components/Sidebar";
import { CopilotChat } from "./components/CopilotChat";
import { AddTransactionModal } from "./components/AddTransactionModal";
import { Dashboard } from "./components/Dashboard";
import { ExpenseIntelligence } from "./components/ExpenseIntelligence";
import { StockResearch } from "./components/StockResearch";
import { PortfolioIntelligence } from "./components/PortfolioIntelligence";
import { GoalPlanner } from "./components/GoalPlanner";
import { ReportCenter } from "./components/ReportCenter";
import { MarketIntelligence } from "./components/MarketIntelligence";
import { SmartAlerts } from "./components/SmartAlerts";
function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard />;
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
        return <Dashboard />;
    }
  };
  return <div className="flex h-screen w-full bg-[#09090b] overflow-hidden text-[#fafafa] font-sans selection:bg-[#3b82f6]/30">
      <Sidebar activeView={activeView} onViewChange={setActiveView} onToggleChat={() => setIsChatOpen(!isChatOpen)} />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-0">
        {
    /* Top Header */
  }
        <header className="h-[72px] flex items-center justify-between px-8 border-b border-[#27272a]">
          <div className="relative w-96">
            <Search className="w-[18px] h-[18px] text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
    type="text"
    placeholder="Search anything"
    className="w-full bg-[#18181b] border border-[#27272a] text-[14px] text-white rounded-xl pl-[38px] pr-12 py-2 focus:outline-none focus:ring-1 focus:ring-[#3b82f6] transition-all placeholder:text-[#71717a]"
  />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
              <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-[#3f3f46] bg-[#27272a] px-1.5 font-sans text-[11px] font-medium text-[#a1a1aa]">
                <span className="text-[12px] leading-none mb-0.5">⌘</span>K
              </kbd>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="text-[#a1a1aa] hover:text-white transition-colors relative">
              <Bell className="w-[20px] h-[20px]" />
            </button>
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity pl-6 border-l border-[#27272a]">
              <div className="w-8 h-8 rounded-full bg-[#27272a] flex items-center justify-center text-[11px] font-semibold text-white tracking-wide">
                MA
              </div>
              <span className="text-[15px] font-medium text-white">Maya</span>
              <ChevronDown className="w-4 h-4 text-[#71717a]" />
            </div>
          </div>
        </header>

        {
    /* Dashboard Content */
  }
        <div className="flex-1 overflow-y-auto p-10 z-10 scrollbar-hide relative">
          {renderView()}
        </div>
        
        {
    /* Copilot Chat Slide-over */
  }
        <CopilotChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        
        {
    /* Modals */
  }
        <AddTransactionModal isOpen={isAddTransactionOpen} onClose={() => setIsAddTransactionOpen(false)} />

        {
    /* Global styling overrides */
  }
        <style dangerouslySetInnerHTML={{ __html: `
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          .markdown-body p { margin-bottom: 0.75em; line-height: 1.5; }
          .markdown-body p:last-child { margin-bottom: 0; }
          .markdown-body strong { color: #fff; font-weight: 600; }
          .markdown-body ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
          .markdown-body li { margin-bottom: 0.25em; }
          .markdown-body h1, .markdown-body h2, .markdown-body h3 { color: #fff; font-weight: 600; margin-top: 1.5em; margin-bottom: 0.5em; }
          .markdown-body h3 { font-size: 1.1em; }
        ` }} />
      </main>
    </div>;
}
export {
  App as default
};
