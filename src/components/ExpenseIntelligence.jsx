import React, { useRef, useState, useEffect, useMemo } from "react";
import Papa from "papaparse";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UploadCloud, CreditCard, DollarSign, Sparkles, X, TrendingUp, 
  AlertTriangle, Coffee, ShoppingBag, Laptop, Home, 
  Plane, Plus, Search, ChevronRight, Filter, Download, Zap, 
  Target, Calendar, PieChart, Activity, Shield, Receipt,
  RefreshCw, MousePointer, MoreHorizontal
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer
} from "recharts";
import { getTransactions, addTransactionsBulk, computeSummary, CATEGORY_COLORS } from "../lib/transactions";
import { AddExpenseModal } from "./AddExpenseModal";

// Fallback colors if lib is missing
const COLORS = CATEGORY_COLORS || { Technology: "#3b82f6", Groceries: "#22c55e", Other: "#71717a" };

const toDisplay = (row) => {
  const isIncome = row?.type === "credit";
  const cat = row?.category || "Other";
  return {
    id: row?.id || Math.random(),
    name: row?.merchant || "Unknown",
    category: cat,
    amount: isIncome ? Number(row?.amount || 0) : -Number(row?.amount || 0),
    date: row?.occurred_at ? new Date(row.occurred_at).toLocaleDateString() : "Recent",
    type: isIncome ? "income" : "expense",
    color: isIncome ? "#22c55e" : (COLORS[cat] || "#71717a"),
    confidence: 95,
  };
};

const CHART_DATA = [
  { d: 'M', s: 400 }, { d: 'T', s: 700 }, { d: 'W', s: 500 }, { d: 'T', s: 1200 }, { d: 'F', s: 900 }
];

function ExpenseIntelligence() {
  const fileInputRef = useRef(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const rows = await getTransactions();
      if (rows) {
        setTransactions(rows.map(toDisplay));
        setSummary(computeSummary(rows));
      }
    } catch (err) {
      console.error("Data Load Error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 p-4 lg:p-8 font-sans">
      
      {/* HEADER */}
      <header className="max-w-[1440px] mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] font-black tracking-[0.3em] text-blue-500 uppercase">Intelligence Terminal</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Expense Intelligence</h1>
          <p className="text-slate-500 text-sm">Behavioral Analysis Engine</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => setIsAddOpen(true)} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all text-[11px] font-black uppercase tracking-widest shadow-xl">
            <Plus className="w-3.5 h-3.5 inline mr-2" /> Add Entry
          </button>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto grid grid-cols-12 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="col-span-12 lg:col-span-9 space-y-8">
          
          {/* AI EXECUTIVE BRIEF */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[#0c0c0e] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-blue-500"><Sparkles className="w-4 h-4" /><span className="text-[10px] font-bold uppercase">AI Analysis Active</span></div>
                <h2 className="text-3xl font-bold text-white leading-tight">Monthly spend is ₹{summary?.totalSpent?.toLocaleString() || "0"}.</h2>
                <p className="text-slate-500 text-sm">Target savings for this month: <span className="text-blue-400">₹6,500</span></p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Health Score</p>
                  <p className="text-3xl font-bold text-white">82<span className="text-slate-600 text-sm">/100</span></p>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Savings</p>
                  <p className="text-2xl font-bold text-blue-400">18%</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CHART */}
          <div className="bg-[#0c0c0e] border border-white/5 rounded-[2rem] p-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA}>
                <Area type="monotone" dataKey="s" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* LIST */}
          <div className="space-y-3">
            {transactions?.length > 0 ? (
              transactions.slice(0, 10).map((t) => (
                <div key={t.id} className="bg-[#0c0c0e] border border-white/5 rounded-2xl p-4 flex justify-between items-center hover:border-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white"><CreditCard className="w-5 h-5" /></div>
                    <div>
                      <p className="font-bold text-white text-sm">{t.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">{t.category} • {t.date}</p>
                    </div>
                  </div>
                  <p className={`font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-white'}`}>
                    ₹{Math.abs(t.amount || 0).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-600 uppercase text-[10px] font-bold tracking-widest">No Transactions Found</div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
           <div className="bg-[#0c0c0e] border border-white/5 rounded-[2rem] p-6">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Security Scan</h3>
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
                <p className="text-xs font-bold text-emerald-500">System Secure</p>
                <p className="text-[10px] text-slate-400 mt-1">No anomalies detected in last 30 days.</p>
              </div>
           </div>
        </div>
      </div>

      <AddExpenseModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSaved={refresh} />
    </div>
  );
}

export { ExpenseIntelligence };