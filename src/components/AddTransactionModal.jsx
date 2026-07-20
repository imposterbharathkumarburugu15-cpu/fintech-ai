import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
function AddTransactionModal({ isOpen, onClose }) {
  const [amount, setAmount] = useState("");
  const [symbol, setSymbol] = useState("");
  const [type, setType] = useState("buy");
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ amount, symbol, type });
    onClose();
    setAmount("");
    setSymbol("");
  };
  return <AnimatePresence>
      {isOpen && <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
    onClick={onClose}
  />
          <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: 20 }}
    className="relative w-full max-w-md max-h-[calc(100dvh-1.5rem)] overflow-y-auto bg-[#09090b] border border-[#27272a] rounded-2xl shadow-2xl p-4 sm:p-6"
  >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Execute Trade</h2>
              <button onClick={onClose} className="p-2 text-[#71717a] hover:text-white transition-colors rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex p-1 bg-[#18181b] rounded-xl border border-[#27272a]">
                <button
    type="button"
    onClick={() => setType("buy")}
    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${type === "buy" ? "bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30 shadow-sm" : "text-[#a1a1aa] hover:text-white"}`}
  >
                  Buy
                </button>
                <button
    type="button"
    onClick={() => setType("sell")}
    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${type === "sell" ? "bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30 shadow-sm" : "text-[#a1a1aa] hover:text-white"}`}
  >
                  Sell
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a1a1aa] mb-1.5">Asset Symbol</label>
                <input
    type="text"
    required
    value={symbol}
    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
    className="w-full bg-[#18181b] border border-[#27272a] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#3b82f6] transition-all placeholder:text-[#71717a] uppercase"
    placeholder="e.g., AAPL, TSLA, BTC"
  />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a1a1aa] mb-1.5">Quantity / Size</label>
                <div className="relative">
                  <input
    type="number"
    step="0.01"
    required
    value={amount}
    onChange={(e) => setAmount(e.target.value)}
    className="w-full bg-[#18181b] border border-[#27272a] text-white text-lg rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#3b82f6] transition-all"
    placeholder="0.00"
  />
                </div>
              </div>

              <div className="pt-4">
                <button
    type="submit"
    className={`w-full font-medium py-3 rounded-xl transition-colors text-white ${type === "buy" ? "bg-[#22c55e] hover:bg-[#16a34a]" : "bg-[#ef4444] hover:bg-[#dc2626]"}`}
  >
                  Confirm Execution
                </button>
              </div>
            </form>
          </motion.div>
        </div>}
    </AnimatePresence>;
}
export {
  AddTransactionModal
};
