import { useState } from "react";
import { TopNav } from "./components/TopNav";
import { NexusChat } from "./components/NexusAI";
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
    <div className="flex flex-col h-screen w-full bg-[#0A0A0A] overflow-hidden text-[#fafafa] font-sans">
      {/* Top Navigation */}
      <TopNav 
        activeView={activeView}
        onViewChange={setActiveView}
        onToggleChat={() => setIsChatOpen(true)} 
      />

      <main className="flex-1 overflow-hidden relative">
        {/* Content */}
        <div className="h-full overflow-y-auto scrollbar-hide relative bg-[#0A0A0A]">
          {renderView()}
        </div>

        {/* Copilot Chat Slide-over */}
        <NexusChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

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
