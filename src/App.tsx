// src/App.tsx

import React, { useState, useEffect } from "react";
import { TopNav } from "./components/TopNav";
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
import ReportViewer from './components/reports/ReportViewer';
import { supabase } from "./supabaseClient";

type ViewType = "dashboard" | "expenses" | "stocks" | "portfolio" | "goals" | "reports" | "markets" | "alerts";

function App() {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const [selectedReportType, setSelectedReportType] = useState<string>("monthly");
  const [user, setUser] = useState<any>(null);

  // Get user from Supabase
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  const handleExport = (format: 'pdf' | 'excel'): void => {
    console.log(`Exporting report as ${format}`);
    alert(`${format.toUpperCase()} export coming soon!`);
  };

  // Wrapper function to handle view changes with proper typing
  const handleViewChange = (view: string) => {
    setActiveView(view as ViewType);
  };

  const renderView = (): React.ReactNode => {
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
        return (
          <div className="p-4 md:p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setSelectedReportType("monthly")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedReportType === "monthly"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                Monthly Report
              </button>
              <button
                onClick={() => setSelectedReportType("expense")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedReportType === "expense"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                Expense Analysis
              </button>
              <button
                onClick={() => setSelectedReportType("investment")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedReportType === "investment"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                Portfolio Report
              </button>
              <button
                onClick={() => setSelectedReportType("health")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedReportType === "health"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                Health Score
              </button>
            </div>
            
            <ReportViewer 
              userId="demo-user"
              reportType={selectedReportType}
              onExport={handleExport}
            />
          </div>
        );
      case "markets":
        return <MarketIntelligence />;
      case "alerts":
        return <SmartAlerts />;
      default:
        return <Dashboard onViewChange={setActiveView} onToggleChat={() => setIsChatOpen(true)} />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#040405] overflow-hidden text-[#fafafa] font-sans">
      <TopNav 
        activeView={activeView}
        onViewChange={handleViewChange}
        onToggleChat={() => setIsChatOpen(true)}
        user={user}
      />

      <main className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto scrollbar-hide relative bg-[#040405]">
          {renderView()}
        </div>

        <CopilotChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

        <AddTransactionModal
          isOpen={isAddTransactionOpen}
          onClose={() => setIsAddTransactionOpen(false)}
        />
      </main>
    </div>
  );
}

export default App;