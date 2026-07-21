// src/App.tsx

import { useState, useEffect } from "react";
import { TopNav } from "./components/TopNav";
import { NexusChat } from "./components/NexusAI";
import { AddTransactionModal } from "./components/AddTransactionModal";
import { Dashboard } from "./components/Dashboard";
import { ExpenseIntelligence  } from "./components/ExpenseIntelligence";
import { StockResearch } from "./components/StockResearch";
import { PortfolioIntelligence } from "./components/PortfolioIntelligence";
import { GoalPlanner } from "./components/GoalPlanner";
import { ReportCenter } from "./components/ReportCenter";
import { MarketIntelligence } from "./components/MarketIntelligence";
import { SmartAlerts } from "./components/SmartAlerts";
import { Login } from "./components/Login";
import { supabase } from "./supabaseClient";
import ReportViewer from './components/reports/ReportViewer';

type ViewType = "dashboard" | "expenses" | "stocks" | "portfolio" | "goals" | "reports" | "markets" | "alerts";

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const [selectedReportType, setSelectedReportType] = useState<string>("monthly");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!supabase) {
      console.error('❌ Supabase client not initialized');
      setLoading(false);
      return;
    }

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('❌ Error getting session:', err);
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleViewChange = (view: string) => {
    setActiveView(view as ViewType);
  };

  const handleExport = (format: 'pdf' | 'excel'): void => {
    console.log(`Exporting report as ${format}`);
    alert(`${format.toUpperCase()} export coming soon!`);
  };

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
            
            {user?.id ? (
              <ReportViewer 
                userId={user.id}
                reportType={selectedReportType}
                onExport={handleExport}
              />
            ) : (
              <div className="p-8 text-center text-gray-400 bg-gray-800/50 rounded-xl border border-gray-700">
                <p className="text-lg">Please login to view your financial report</p>
                <p className="text-sm mt-2">Sign in to see personalized financial insights</p>
              </div>
            )}
          </div>
        );
      case "markets":
        return <MarketIntelligence onOpenStock={(symbol: string) => {
          window.sessionStorage.setItem("finpilot-selected-stock", symbol);
          setActiveView("stocks");
        }} />;
      case "alerts":
        // ✅ SmartAlerts takes NO props
        return <SmartAlerts />;
      default:
        return <Dashboard onViewChange={setActiveView} onToggleChat={() => setIsChatOpen(true)} />;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-[#040405]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user, show login
  if (!user) {
    return <Login />;
  }

  // Logged in - Main App
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
        <NexusChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        <AddTransactionModal
          isOpen={isAddTransactionOpen}
          onClose={() => setIsAddTransactionOpen(false)}
        />
      </main>
    </div>
  );
}

export default App;