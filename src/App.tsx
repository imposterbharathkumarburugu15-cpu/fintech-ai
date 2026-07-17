// src/App.tsx

<<<<<<< HEAD
<<<<<<< HEAD
import { useState, useEffect } from "react";
=======
import React, { useState } from "react";
>>>>>>> 6ef9b16 (feat: Implement comprehensive AI Report Center with PDF export)
=======
import { useState, useEffect } from "react";
>>>>>>> fcaae31 (Re-established broken Login component)
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> fcaae31 (Re-established broken Login component)
import { Login } from "./components/Login";
import { supabase } from "./supabaseClient";
import ReportViewer from './components/reports/ReportViewer';
import { Session, User } from '@supabase/supabase-js'; // 👈 ADD THIS IMPORT
<<<<<<< HEAD

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedReportType, setSelectedReportType] = useState<string>("monthly");

  // AUTH STATE - with proper types
  const [session, setSession] = useState<Session | null>(null); // 👈 ADD TYPE
  const [checking, setChecking] = useState(true);

  useEffect(() => {
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
=======
import ReportViewer from './components/reports/ReportViewer';

type ViewType = "dashboard" | "expenses" | "stocks" | "portfolio" | "goals" | "reports" | "markets" | "alerts";
=======
>>>>>>> fcaae31 (Re-established broken Login component)

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedReportType, setSelectedReportType] = useState<string>("monthly");
<<<<<<< HEAD
=======

  // AUTH STATE - with proper types
  const [session, setSession] = useState<Session | null>(null); // 👈 ADD TYPE
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);
>>>>>>> fcaae31 (Re-established broken Login component)

  // Handle view change
  const handleViewChange = (view: string) => {
    setActiveView(view);
  };

  // Handle PDF export
  const handleExport = (format: 'pdf' | 'excel'): void => {
    console.log(`Exporting report as ${format}`);
<<<<<<< HEAD
    alert(`📄 ${format.toUpperCase()} export coming soon!`);
  };

  const renderView = (): React.ReactNode => {
>>>>>>> 6ef9b16 (feat: Implement comprehensive AI Report Center with PDF export)
=======
    alert(`${format.toUpperCase()} export coming soon!`);
  };

  const renderView = () => {
>>>>>>> fcaae31 (Re-established broken Login component)
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
<<<<<<< HEAD
                Monthly Report
=======
                📊 Monthly Report
>>>>>>> 6ef9b16 (feat: Implement comprehensive AI Report Center with PDF export)
              </button>
              <button
                onClick={() => setSelectedReportType("expense")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedReportType === "expense"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
<<<<<<< HEAD
                Expense Analysis
=======
                💰 Expense Analysis
>>>>>>> 6ef9b16 (feat: Implement comprehensive AI Report Center with PDF export)
              </button>
              <button
                onClick={() => setSelectedReportType("investment")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedReportType === "investment"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
<<<<<<< HEAD
                Portfolio Report
=======
                📈 Portfolio Report
>>>>>>> 6ef9b16 (feat: Implement comprehensive AI Report Center with PDF export)
              </button>
              <button
                onClick={() => setSelectedReportType("health")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedReportType === "health"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
<<<<<<< HEAD
                Health Score
=======
                ❤️ Health Score
>>>>>>> 6ef9b16 (feat: Implement comprehensive AI Report Center with PDF export)
              </button>
            </div>
            
            <ReportViewer 
<<<<<<< HEAD
<<<<<<< HEAD
              userId={session?.user?.id || "demo-user"}
=======
              userId="demo-user"
>>>>>>> 6ef9b16 (feat: Implement comprehensive AI Report Center with PDF export)
=======
              userId={session?.user?.id || "demo-user"}
>>>>>>> fcaae31 (Re-established broken Login component)
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

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> fcaae31 (Re-established broken Login component)
  // AUTH GATE
  if (checking) {
    return (
      <div className="min-h-screen w-full bg-[#040405] flex items-center justify-center text-[#71717a]">
        Loading…
      </div>
    );
  }
  
  if (!session) {
    return <Login />;
  }

  // LOGGED IN - MAIN APP
<<<<<<< HEAD
  return (
    <div className="flex flex-col h-screen w-full bg-[#040405] overflow-hidden text-[#fafafa] font-sans">
      <TopNav
        activeView={activeView}
        onViewChange={handleViewChange}
        onToggleChat={() => setIsChatOpen(true)}
        user={session.user} // 👈 This is now properly typed as User
      />
=======
=======
>>>>>>> fcaae31 (Re-established broken Login component)
  return (
    <div className="flex flex-col h-screen w-full bg-[#040405] overflow-hidden text-[#fafafa] font-sans">
      <TopNav
        activeView={activeView}
<<<<<<< HEAD
        onViewChange={setActiveView}
        onToggleChat={() => setIsChatOpen(true)} 
      />

>>>>>>> 6ef9b16 (feat: Implement comprehensive AI Report Center with PDF export)
=======
        onViewChange={handleViewChange}
        onToggleChat={() => setIsChatOpen(true)}
        user={session.user} // 👈 This is now properly typed as User
      />
>>>>>>> fcaae31 (Re-established broken Login component)
      <main className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto scrollbar-hide relative bg-[#040405]">
          {renderView()}
        </div>
<<<<<<< HEAD
<<<<<<< HEAD
        <CopilotChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
=======

        <CopilotChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

>>>>>>> 6ef9b16 (feat: Implement comprehensive AI Report Center with PDF export)
=======
        <CopilotChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
>>>>>>> fcaae31 (Re-established broken Login component)
        <AddTransactionModal
          isOpen={isAddTransactionOpen}
          onClose={() => setIsAddTransactionOpen(false)}
        />
      </main>
    </div>
  );
}

export default App;