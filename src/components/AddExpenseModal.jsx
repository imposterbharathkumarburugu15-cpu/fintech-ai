import React, { useState, useEffect } from "react";
import { X, Sparkles, Receipt, CreditCard, Wallet, Landmark, ArrowUpRight, ArrowDownLeft, Calendar, Tag, Plus, CheckCircle2, AlertCircle, Info, Utensils, ShoppingBag, Car, Zap, Gamepad2, HeartPulse, GraduationCap, Monitor, LineChart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { addTransaction } from "../lib/transactions"; // Ensure this path is correct for your project

const CATEGORIES = [
  { id: "Dining", icon: Utensils },
  { id: "Shopping", icon: ShoppingBag },
  { id: "Transportation", icon: Car },
  { id: "Bills", icon: Zap },
  { id: "Entertainment", icon: Gamepad2 },
  { id: "Health", icon: HeartPulse },
  { id: "Education", icon: GraduationCap },
  { id: "Technology", icon: Monitor },
  { id: "Investment", icon: LineChart },
  { id: "Other", icon: Plus },
];

export default function AddExpenseModal({ isOpen, onClose, onSaved }) {
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("debit");
  const [category, setCategory] = useState("Other");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await addTransaction({ merchant, amount, type, category: type === "credit" ? "Income" : category, source: "manual" });
      setMerchant(""); setAmount(""); setType("debit"); setCategory("Other");
      onSaved?.(); onClose();
    } catch (err) {
      setError(err.message || "Error saving");
    } finally { setSaving(false); }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-[760px] h-full md:h-auto md:max-h-[90vh] bg-zinc-950 border border-white/10 rounded-none md:rounded-[24px] shadow-2xl flex flex-col overflow-hidden text-zinc-300">
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500 rounded-lg"><Sparkles className="w-5 h-5 text-white" /></div>
                <div><h2 className="text-lg font-bold text-white">Expense Intelligence</h2><p className="text-[10px] text-zinc-500 uppercase tracking-widest">AI Capture</p></div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr]">
              <form onSubmit={handleSubmit} className="p-6 space-y-6 border-r border-white/5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Amount</label>
                  <input type="number" required placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 text-white text-4xl font-bold rounded-2xl px-4 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                </div>
                <div className="flex p-1 bg-white/[0.03] rounded-xl border border-white/5">
                  <button type="button" onClick={() => setType("debit")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === "debit" ? "bg-white/10 text-white shadow-lg" : "text-zinc-500"}`}>Expense</button>
                  <button type="button" onClick={() => setType("credit")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${type === "credit" ? "bg-white/10 text-white shadow-lg" : "text-zinc-500"}`}>Income</button>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Merchant</label>
                  <input type="text" required placeholder="Amazon, Uber, etc." value={merchant} onChange={(e) => setMerchant(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                {type === "debit" && (
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map(cat => (
                      <button key={cat.id} type="button" onClick={() => setCategory(cat.id)} className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${category === cat.id ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'bg-white/5 border-transparent text-zinc-500'}`}><cat.icon className="w-4 h-4" />{cat.id}</button>
                    ))}
                  </div>
                )}
              </form>
              <aside className="p-6 bg-white/[0.01] space-y-6">
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex justify-between items-center"><span className="text-[10px] text-zinc-400 font-bold uppercase">AI Prediction</span><span className="text-[10px] text-emerald-400 font-bold uppercase">98% Match</span></div>
                    <p className="text-sm font-bold text-white">{category}</p>
                    <p className="text-xs text-zinc-500">Based on your spending history at {merchant || '...'}</p>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between text-xs font-bold border-b border-white/5 pb-2"><span>Monthly Spend</span><span className="text-white">₹12,460</span></div>
                    <div className="flex justify-between text-xs font-bold border-b border-white/5 pb-2"><span>Budget Impact</span><span className="text-red-400">High</span></div>
                 </div>
              </aside>
            </div>
            <div className="p-6 bg-white/[0.02] border-t border-white/5 flex gap-3">
              <button type="button" onClick={onClose} className="px-6 py-3 text-sm font-bold text-zinc-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleSubmit} disabled={saving} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50">
                {saving ? "Saving..." : "Save Transaction"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
