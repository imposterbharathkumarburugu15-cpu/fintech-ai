// src/components/AddExpenseModal.jsx
// A dedicated modal for adding an EXPENSE or INCOME transaction.
// (Note: the existing AddTransactionModal is a TRADE modal — Buy/Sell stocks —
//  which belongs to the Portfolio feature, not here.)

import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { addTransaction } from "../lib/transactions";

// same category options your autoCategorize produces, so things stay consistent
const CATEGORIES = [
  "Technology", "Groceries", "Entertainment", "Transportation",
  "Dining", "Income", "Other",
];

function AddExpenseModal({ isOpen, onClose, onSaved }) {
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("debit");       // debit = spend, credit = income
  const [category, setCategory] = useState("Other");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await addTransaction({
        merchant,
        amount,                 // data layer forces this positive
        type,
        category: type === "credit" ? "Income" : category,
        source: "manual",
      });
      // reset + tell parent to refresh its list
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[#09090b] border border-[#27272a] rounded-2xl shadow-2xl p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Add Transaction</h2>
              <button onClick={onClose} className="p-2 text-[#71717a] hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* debit / credit toggle */}
              <div className="flex p-1 bg-[#18181b] rounded-xl border border-[#27272a]">
                <button type="button" onClick={() => setType("debit")}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${type === "debit" ? "bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30" : "text-[#a1a1aa] hover:text-white"}`}>
                  Expense
                </button>
                <button type="button" onClick={() => setType("credit")}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${type === "credit" ? "bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30" : "text-[#a1a1aa] hover:text-white"}`}>
                  Income
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a1a1aa] mb-1.5">Merchant / Description</label>
                <input type="text" required value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="w-full bg-[#18181b] border border-[#27272a] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#3b82f6] placeholder:text-[#71717a]"
                  placeholder="e.g., Swiggy, Salary, Amazon" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a1a1aa] mb-1.5">Amount (₹)</label>
                <input type="number" step="0.01" min="0" required value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#18181b] border border-[#27272a] text-white text-lg rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
                  placeholder="0.00" />
              </div>

              {type === "debit" && (
                <div>
                  <label className="block text-sm font-medium text-[#a1a1aa] mb-1.5">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#18181b] border border-[#27272a] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#3b82f6]">
                    {CATEGORIES.filter((c) => c !== "Income").map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              {error && <p className="text-[#ef4444] text-sm">{error}</p>}

              <div className="pt-2">
                <button type="submit" disabled={saving}
                  className="w-full font-medium py-3 rounded-xl transition-colors text-white bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50">
                  {saving ? "Saving..." : "Save Transaction"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export { AddExpenseModal };
