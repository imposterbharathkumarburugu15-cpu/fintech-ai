// src/App.tsx

import { useState, useEffect } from "react";
import { TopNav } from "./components/TopNav";
import { NexusChat } from "./components/NexusAI";
import { AddTransactionModal } from "./components/AddTransactionModal";
import { Dashboard } from "./components/Dashboard";
import { ExpenseIntelligence } from "./components/ExpenseIntelligence";
import { StockResearch } from "./components/StockResearch";
import { PortfolioIntelligence } from "./components/PortfolioIntelligence";
import { GoalPlanner } from "./components/GoalPlanner";
import { ReportCenter } from "./components/ReportCenter";
import { MarketIntelligence
 } from "./components/MarketIntelligence";
import { SmartAlerts } from "./components/SmartAlerts";
import { Login } from "./components/Login";
import { isSupabaseConfigured, supabase } from "./supabaseClient";
import ReportViewer from './components/reports/ReportViewer';
import { Session, User } from '@supabase/supabase-js'; // 👈 ADD THIS IMPORT

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedReportType, setSelectedReportType] = useState<string>("monthly");

  // AUTH STATE - with proper types
  const [session, setSession] = useState<Session | null>(null); // 👈 ADD TYPE
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setChecking(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle view change
  const handleViewChange = (view: string) => {
    setActiveView(view);
  };

  // Handle PDF export
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
            
            <ReportViewer 
              userId={session?.user?.id || "demo-user"}
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

  // AUTH GATE
  if (checking) {
    return (
      <div className="min-h-screen w-full bg-[#040405] flex items-center justify-center text-[#71717a]">
        Loading…
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen w-full bg-[#040405] p-6 text-white flex items-center justify-center">
        <div className="w-full max-w-xl rounded-3xl border border-blue-400/20 bg-[#121214] p-8 shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">FinPilot AI setup</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Add your Supabase settings to continue.</h1>
          <p className="mt-3 leading-6 text-[#a1a1aa]">The app is running, but authentication needs a local <code className="rounded bg-white/5 px-1.5 py-0.5 text-blue-200">.env</code> file before it can load your workspace.</p>
          <pre className="mt-6 overflow-x-auto rounded-2xl border border-[#27272a] bg-[#09090b] p-4 text-sm leading-7 text-[#d4d4d8]">VITE_SUPABASE_URL="https://your-project.supabase.co"{`\n`}VITE_SUPABASE_ANON_KEY="your-anon-key"{`\n`}VITE_FINNHUB_API_KEY="your-finnhub-key"</pre>
          <p className="mt-5 text-sm text-[#71717a]">Save those values in <code>.env</code>, then restart the dev server.</p>
        </div>
      </div>
    );
  }
  
  if (!session) {
    return <Login />;
  }

  // LOGGED IN - MAIN APP
  return (
    <div className="flex flex-col h-screen w-full bg-[#040405] overflow-hidden text-[#fafafa] font-sans">
      <TopNav
        activeView={activeView}
        onViewChange={handleViewChange}
        onToggleChat={() => setIsChatOpen(true)}
        user={session.user} // 👈 This is now properly typed as User
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
