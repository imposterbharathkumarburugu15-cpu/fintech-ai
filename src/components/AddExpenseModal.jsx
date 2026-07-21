import React, { useState, useEffect } from "react";
import { 
  X, Sparkles, Receipt, CreditCard, Wallet, Landmark, 
  ArrowUpRight, ArrowDownLeft, Calendar, Tag, FileText, 
  ChevronRight, Utensils, ShoppingBag, Car, Zap, 
  Gamepad2, HeartPulse, GraduationCap, Monitor, 
  LineChart, Plus, CheckCircle2, AlertCircle, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { addTransaction } from "../lib/transactions";

// Premium Category Config
const CATEGORIES = [
  { id: "Dining", icon: Utensils, color: "bg-orange-500/20 text-orange-400" },
  { id: "Shopping", icon: ShoppingBag, color: "bg-pink-500/20 text-pink-400" },
  { id: "Transportation", icon: Car, color: "bg-blue-500/20 text-blue-400" },
  { id: "Bills", icon: Zap, color: "bg-yellow-500/20 text-yellow-400" },
  { id: "Entertainment", icon: Gamepad2, color: "bg-purple-500/20 text-purple-400" },
  { id: "Health", icon: HeartPulse, color: "bg-red-500/20 text-red-400" },
  { id: "Education", icon: GraduationCap, color: "bg-emerald-500/20 text-emerald-400" },
  { id: "Technology", icon: Monitor, color: "bg-indigo-500/20 text-indigo-400" },
  { id: "Investment", icon: LineChart, color: "bg-cyan-500/20 text-cyan-400" },
  { id: "Other", icon: Plus, color: "bg-slate-500/20 text-slate-400" },
];

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", icon: Zap },
  { id: "credit", label: "Credit Card", icon: CreditCard },
  { id: "debit", label: "Debit Card", icon: Landmark },
  { id: "cash", label: "Cash", icon: Wallet },
];

function AddExpenseModal({ isOpen, onClose, onSaved }) {
  // --- FORM STATE (Retained from original) ---
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("debit");
  const [category, setCategory] = useState("Other");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // --- UI ONLY STATE (Redesign requirements) ---
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [aiConfidence, setAiConfidence] = useState(0);
  const [isFocused, setIsFocused] = useState(null);

  // Simulated AI Logic (Purely UI)
  useEffect(() => {
    if (merchant.length > 2) {
      setAiConfidence(98);
      if (merchant.toLowerCase().includes("swiggy")) setCategory("Dining");
      if (merchant.toLowerCase().includes("amazon")) setCategory("Shopping");
      if (merchant.toLowerCase().includes("uber")) setCategory("Transportation");
      if (merchant.toLowerCase().includes("netflix")) setCategory("Entertainment");
    } else {
      setAiConfidence(0);
    }
  }, [merchant]);

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await addTransaction({
        merchant,
        amount,
        type,
        category: type === "credit" ? "Income" : category,
        source: "manual",
      });
      // Reset
      setMerchant(""); setAmount(""); setType("debit"); setCategory("Other");
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message || "Could not save transaction");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[760px] h-full md:h-auto md:max-h-[90vh] bg-zinc-950 border border-white/10 rounded-none md:rounded-[24px] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white tracking-tight">Expense Intelligence</h2>
                  <p className="text-xs text-zinc-500 font-medium tracking-wide uppercase">AI-assisted expense capture</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-all border border-transparent hover:border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body - Responsive Split Layout */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr]">
              
              {/* LEFT PANEL: Transaction Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-8 border-r border-white/5">
                
                {/* Amount Section */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Amount</label>
                  <div className={`relative flex items-center transition-all duration-300 ${isFocused === 'amount' ? 'scale-[1.02]' : ''}`}>
                    <span className="absolute left-4 text-3xl font-light text-zinc-500">₹</span>
                    <input 
                      type="number"
                      required
                      placeholder="0.00"
                      value={amount}
                      onFocus={() => setIsFocused('amount')}
                      onBlur={() => setIsFocused(null)}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 text-white text-4xl font-semibold rounded-2xl pl-10 pr-6 py-5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-zinc-800"
                    />
                  </div>
                </div>

                {/* Transaction Type Toggle */}
                <div className="flex p-1 bg-white/[0.03] rounded-xl border border-white/5">
                  <button 
                    type="button" 
                    onClick={() => setType("debit")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${type === "debit" ? "bg-white/10 text-white shadow-xl" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    <ArrowDownLeft className={`w-4 h-4 ${type === 'debit' ? 'text-red-400' : ''}`} />
                    Expense
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setType("credit")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${type === "credit" ? "bg-white/10 text-white shadow-xl" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    <ArrowUpRight className={`w-4 h-4 ${type === 'credit' ? 'text-emerald-400' : ''}`} />
                    Income
                  </button>
                </div>

                {/* Merchant Input */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Merchant / Description</label>
                  <div className="relative group">
                    <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input 
                      type="text"
                      required
                      placeholder="e.g., Swiggy, Amazon, Salary"
                      value={merchant}
                      onChange={(e) => setMerchant(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 text-white text-sm rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>

                {/* Categories Grid */}
                {type === "debit" && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Category</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all text-xs font-medium ${category === cat.id ? 'bg-indigo-500/10 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/5' : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:bg-white/5 hover:border-white/10'}`}
                        >
                          <cat.icon className={`w-4 h-4 ${category === cat.id ? 'text-indigo-400' : 'text-zinc-500'}`} />
                          {cat.id}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] ml-1">Payment Method</label>
                  <div className="grid grid-cols-4 gap-2">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${paymentMethod === method.id ? 'bg-white/10 border-white/20 text-white' : 'bg-white/[0.02] border-white/5 text-zinc-500 hover:bg-white/5'}`}
                      >
                        <method.icon className="w-4 h-4" />
                        <span className="text-[10px] font-medium">{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Secondary Row: Date & Tags */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Date</label>
                      <div className="flex items-center gap-2 p-3 bg-white/[0.03] border border-white/10 rounded-xl text-zinc-300 text-xs">
                        <Calendar className="w-4 h-4 text-zinc-500" />
                        Today, Feb 24
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Tags</label>
                      <div className="flex items-center gap-2 p-3 bg-white/[0.03] border border-white/10 rounded-xl text-zinc-500 text-xs italic">
                        <Tag className="w-4 h-4" />
                        Add tags...
                      </div>
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Receipt</label>
                  <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-white/[0.02] transition-colors cursor-pointer group">
                    <div className="p-2 bg-white/5 rounded-full text-zinc-400 group-hover:text-indigo-400 transition-colors">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-zinc-500 font-medium">Drop receipt or click to upload</span>
                  </div>
                </div>
              </form>

              {/* RIGHT PANEL: AI Analysis */}
              <aside className="bg-white/[0.01] p-6 lg:p-8 flex flex-col gap-6">
                <div>
                  <h3 className="text-white font-semibold flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    AI Intelligence
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Analyzing transaction patterns and budget impact in real-time.
                  </p>
                </div>

                {/* Prediction Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-zinc-400 font-medium">Category Prediction</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${aiConfidence > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                      {aiConfidence > 0 ? `${aiConfidence}% Confidence` : 'Pending input'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${merchant ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-zinc-600'}`}>
                      {merchant ? <Utensils className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{category}</p>
                      <p className="text-[11px] text-zinc-500">{merchant || "Awaiting merchant details"}</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-white/5 pb-3">
                    <span className="text-xs text-zinc-400">Monthly Spending</span>
                    <span className="text-sm font-semibold text-white">₹12,460</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/5 pb-3">
                    <span className="text-xs text-zinc-400">Budget Impact</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-400 uppercase tracking-wider">High</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/5 pb-3">
                    <span className="text-xs text-zinc-400">Recurring Status</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 uppercase tracking-wider">Detected</span>
                  </div>
                </div>

                {/* Insight Box */}
                {merchant.toLowerCase().includes("swiggy") && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400 mt-0.5">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-white">Savings Opportunity</p>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          You're spending 23% more on food delivery compared to last month. Reducing Swiggy by 2 orders/week saves ₹2,000.
                        </p>
                        <div className="text-xs font-bold text-emerald-400">Potential: ₹2,000/month</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="mt-auto pt-6 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[11px] font-medium text-emerald-400 bg-emerald-400/5 p-3 rounded-lg border border-emerald-400/10">
                    <CheckCircle2 className="w-4 h-4" />
                    Transaction is compliant with policy
                  </div>
                </div>
              </aside>
            </div>

            {/* Footer Actions */}
            <div className="p-4 md:p-6 bg-white/[0.02] border-t border-white/5 flex flex-col md:flex-row items-center gap-3">
              <button 
                onClick={onClose}
                className="w-full md:w-auto px-6 py-2.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              
              <div className="w-full md:w-auto flex flex-col md:flex-row gap-3 md:ml-auto">
                <button 
                  type="button"
                  className="px-6 py-2.5 text-sm font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                >
                  Save & Add Another
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={saving || !amount || !merchant}
                  className="group relative overflow-hidden px-8 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-xl shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Save Transaction"
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="absolute bottom-24 left-6 right-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium text-center">
                {error}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export { AddExpenseModal };
