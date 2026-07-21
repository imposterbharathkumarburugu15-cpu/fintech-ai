import React, { useRef, useState, useEffect } from "react";
import Papa from "papaparse";
import { UploadCloud, CreditCard, DollarSign, Sparkles, X, TrendingDown, TrendingUp, AlertTriangle, Coffee, ShoppingBag, Laptop, Home, Plane, Plus } from "lucide-react";
import { getTransactions, addTransactionsBulk, computeSummary, CATEGORY_COLORS } from "../lib/transactions";
import { AddExpenseModal } from "./AddExpenseModal";

// returns { cat, icon, color } — unchanged from his version
const autoCategorize = (description) => {
  const desc = (description || "").toLowerCase();
  if (desc.includes("apple") || desc.includes("best buy") || desc.includes("amazon") || desc.includes("microsoft")) return { cat: "Technology", icon: Laptop, color: "#3b82f6" };
  if (desc.includes("whole foods") || desc.includes("kroger") || desc.includes("walmart") || desc.includes("trader joe")) return { cat: "Groceries", icon: ShoppingBag, color: "#22c55e" };
  if (desc.includes("netflix") || desc.includes("spotify") || desc.includes("hulu") || desc.includes("amc") || desc.includes("disney")) return { cat: "Entertainment", icon: Sparkles, color: "#8b5cf6" };
  if (desc.includes("uber") || desc.includes("lyft") || desc.includes("chevron") || desc.includes("shell") || desc.includes("transit") || desc.includes("gas") || desc.includes("delta") || desc.includes("united")) return { cat: "Transportation", icon: Plane, color: "#f59e0b" };
  if (desc.includes("salary") || desc.includes("payroll") || desc.includes("deposit")) return { cat: "Income", icon: DollarSign, color: "#22c55e" };
  if (desc.includes("restaurant") || desc.includes("cafe") || desc.includes("starbucks") || desc.includes("mcdonalds") || desc.includes("coffee") || desc.includes("dining")) return { cat: "Dining", icon: Coffee, color: "#ef4444" };
  if (desc.includes("rent") || desc.includes("mortgage") || desc.includes("airbnb")) return { cat: "Housing", icon: Home, color: "#06b6d4" };
  return { cat: "Other", icon: CreditCard, color: "#71717a" };
};

// pick a display icon from a stored category name
const iconForCategory = (cat) => {
  switch (cat) {
    case "Technology": return Laptop;
    case "Groceries": return ShoppingBag;
    case "Entertainment": return Sparkles;
    case "Transportation": return Plane;
    case "Dining": return Coffee;
    case "Housing": return Home;
    case "Income": return DollarSign;
    default: return CreditCard;
  }
};

// DB row -> display shape his JSX expects (signed amount, icon, color)
const toDisplay = (row) => {
  const isIncome = row.type === "credit";
  const cat = row.category || "Other";
  return {
    id: row.id,
    name: row.merchant || "Unknown",
    category: cat,
    amount: isIncome ? Number(row.amount) : -Number(row.amount),
    date: new Date(row.occurred_at).toLocaleString(),
    icon: isIncome ? DollarSign : iconForCategory(cat),
    type: isIncome ? "income" : "expense",
    color: isIncome ? "#22c55e" : (CATEGORY_COLORS[cat] || "#71717a"),
  };
};

function ExpenseIntelligence() {
  const fileInputRef = useRef(null);
  const [isRecommendationsOpen, setIsRecommendationsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function refresh() {
    setLoading(true); setError(null);
    try {
      const rows = await getTransactions();
      setTransactions(rows.map(toDisplay));
      setSummary(computeSummary(rows));
    } catch (err) {
      setError(err.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const processFile = (file) => {
    if (!file) return;
    if (file.type === "text/csv" || file.name.endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const parsed = results.data
            .filter((row) => Object.keys(row).length > 0 && Object.values(row).some((v) => v !== ""))
            .map((row) => {
              const keys = Object.keys(row);
              let descKey = keys.find((k) => k.toLowerCase().match(/desc|name|merchant|payee|title|transaction|detail|particular|narration|info|memo|remark|company/i));
              if (!descKey) {
                const possibleKeys = keys.filter((k) => isNaN(parseFloat(row[k])) && !String(row[k]).match(/\d{2}[\/\-]\d{2}[\/\-]\d{2,4}/));
                descKey = possibleKeys.length > 0 ? possibleKeys[0] : keys[1];
              }
              const description = descKey && row[descKey] ? String(row[descKey]).trim() : "Unknown Transaction";

              let amountKey = keys.find((k) => k.toLowerCase().match(/amount|cost|price|debit|credit|value|total|withdrawal|deposit/i));
              let rawAmount = amountKey ? row[amountKey] : null;
              if (!rawAmount) {
                const possibleAmountKey = keys.find((k) => String(row[k]).match(/^[\$£€\-\+]?\s*\d+(?:,\d{3})*(?:\.\d{2})?$/));
                rawAmount = possibleAmountKey ? row[possibleAmountKey] : "0";
              }
              let cleanedAmount = String(rawAmount).replace(/[,$£€]/g, "").trim();
              if (cleanedAmount.endsWith("-") || (cleanedAmount.startsWith("(") && cleanedAmount.endsWith(")"))) {
                cleanedAmount = "-" + cleanedAmount.replace(/[-()]/g, "");
              }
              let amount = parseFloat(cleanedAmount);
              if (isNaN(amount)) amount = 0;

              const catData = autoCategorize(description);
              const type = amount >= 0 ? "credit" : "debit";
              return { merchant: description, amount: Math.abs(amount), type, category: catData.cat, source: "upload" };
            });
          try {
            await addTransactionsBulk(parsed);
            await refresh();
          } catch (err) {
            setError(err.message || "Upload failed");
          }
        },
      });
    } else {
      alert("Please upload a valid CSV file.");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileUpload = (e) => processFile(e.target.files?.[0]);
  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const money = (n) => `₹${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <div className="max-w-[1080px] mx-auto flex flex-col h-full page-shell">
      {/* Header */}
      <div className="page-header flex justify-between items-end mb-8 animate-fade-in-up">
        <div>
          <p className="text-[#3b82f6] text-[11px] font-bold tracking-[0.12em] mb-2 uppercase">Analysis</p>
          <h1 className="page-title text-[38px] font-semibold text-white tracking-[-0.025em] mb-2 leading-none">Expense Intelligence</h1>
          <p className="text-[#71717a] text-[15px]">AI-powered transaction categorization and spending trends.</p>
        </div>
        <button onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors">
          <Plus className="w-4 h-4" /> Add Transaction
        </button>
      </div>

      {/* Top Stats Cards — REAL data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fade-in-up stagger-1">
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5">
          <p className="text-[#71717a] text-[13px] font-medium mb-1">Total Spent This Month</p>
          <h3 className="text-[28px] font-semibold text-white tracking-tight">{summary ? money(summary.totalSpent) : "—"}</h3>
          <div className="flex items-center text-[#71717a] text-[12px] font-medium mt-1">{summary ? `${summary.count} transactions` : ""}</div>
        </div>
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5">
          <p className="text-[#71717a] text-[13px] font-medium mb-1">Top Spending Category</p>
          <h3 className="text-[28px] font-semibold text-white tracking-tight">{summary?.topCategory || "—"}</h3>
          <div className="flex items-center text-[#a1a1aa] text-[12px] font-medium mt-1">{summary && summary.topCategory ? `${summary.topCategoryPct}% of total expenses` : ""}</div>
        </div>
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5">
          <p className="text-[#71717a] text-[13px] font-medium mb-1">Average Daily Spend</p>
          <h3 className="text-[28px] font-semibold text-white tracking-tight">{summary ? money(summary.avgDaily) : "—"}</h3>
          <div className="flex items-center text-[#71717a] text-[12px] font-medium mt-1">this month</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in-up stagger-2">
        {/* Left: transactions from DB */}
        <div className="md:col-span-2 bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-[#27272a] flex justify-between items-center bg-[#18181b] shrink-0">
            <h3 className="text-white font-semibold text-[15px]">Recent Transactions</h3>
            <span className="text-[12px] text-[#71717a]">{transactions.length} total</span>
          </div>

          {loading ? (
            <div className="p-10 text-center text-[#71717a]">Loading…</div>
          ) : error ? (
            <div className="p-10 text-center text-[#ef4444]">{error}</div>
          ) : transactions.length === 0 ? (
            <div className="p-10 text-center text-[#71717a]">No transactions yet. Add one or upload a CSV.</div>
          ) : (
            <div className="divide-y divide-[#27272a] overflow-y-auto max-h-[500px] scrollbar-thin">
              {transactions.map((t) => (
                <div key={t.id} className="p-5 flex items-center justify-between hover:bg-[#1a1a1d] transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                         style={{ background: `${t.color}15`, color: t.color }}>
                      <t.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-[15px] mb-0.5">{t.name}</h4>
                      <div className="flex items-center gap-2 text-[12px] text-[#71717a]">
                        <span className="font-medium" style={{ color: t.color }}>{t.category}</span>
                        <span>•</span>
                        <span className="font-mono text-[11px]">{t.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`text-[15px] font-mono font-medium ${t.type === "income" ? "text-[#22c55e]" : "text-white"}`}>
                    {t.type === "income" ? "+" : ""}{t.amount < 0 ? "-" : ""}₹{Math.abs(t.amount).toLocaleString(void 0, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: insights + upload + breakdown */}
        <div className="space-y-6">
          <div className="bg-[#18181b] border border-[#3b82f6]/30 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.05)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#3b82f6]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#3b82f6]" />
              <h3 className="text-white font-semibold text-[15px]">AI Insights</h3>
            </div>
            <p className="text-[#a1a1aa] text-[13px] leading-relaxed mb-4">
              {summary && summary.count > 0
                ? <>You logged <span className="text-white font-semibold">{summary.count} transaction(s)</span> this month. Top category: <span className="text-white font-medium">{summary.topCategory || "—"}</span>.</>
                : "Add transactions to unlock AI insights on your spending."}
            </p>
            <button onClick={() => setIsRecommendationsOpen(true)}
              className="text-[#3b82f6] hover:text-[#60a5fa] text-[13px] font-semibold transition-colors flex items-center gap-1">
              Review Budget Recommendations <TrendingUp className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            className={`bg-[#18181b] border-2 border-dashed ${isDragging ? 'border-[#3b82f6] bg-[#3b82f6]/5' : 'border-[#3f3f46]'} rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${isDragging ? 'bg-[#3b82f6]/20' : 'bg-[#27272a]'}`}>
              <UploadCloud className={`w-6 h-6 ${isDragging ? 'text-[#3b82f6]' : 'text-[#a1a1aa]'}`} />
            </div>
            <h3 className="text-white font-semibold text-[15px] mb-1">Upload Statement</h3>
            <p className="text-[#71717a] text-[12px] mb-4 max-w-[200px]">Drag & drop CSV formats supported</p>
            <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileUpload} />
            <button onClick={() => fileInputRef.current?.click()}
              className="bg-[#27272a] hover:bg-[#3f3f46] text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-colors w-full">
              Browse Files
            </button>
          </div>

          {/* Category Breakdown — REAL data */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6">
            <h3 className="text-white font-semibold text-[15px] mb-4">Category Breakdown</h3>
            {summary && summary.breakdown.length > 0 ? (
              <div className="space-y-4">
                {summary.breakdown.map((stat) => (
                  <div key={stat.name}>
                    <div className="flex justify-between text-[12px] mb-1.5">
                      <span className="text-[#e4e4e7] font-medium">{stat.name}</span>
                      <span className="text-[#71717a] font-mono">₹{stat.amount.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#27272a] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${stat.percent}%`, backgroundColor: stat.color }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#71717a] text-[13px]">No spending yet this month.</p>
            )}
          </div>
        </div>
      </div>

      <AddExpenseModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSaved={refresh} />

      {/* Recommendations modal (unchanged UI, placeholder copy) */}
      {isRecommendationsOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#09090b] border border-[#27272a] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col animate-fade-in-up">
            <div className="p-6 border-b border-[#27272a] flex items-center justify-between bg-[#09090b]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3b82f6]/20 to-[#8b5cf6]/20 border border-[#3b82f6]/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#3b82f6]" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">AI Budget Recommendations</h2>
                  <p className="text-[#a1a1aa] text-[13px]">Personalized insights based on your spending</p>
                </div>
              </div>
              <button onClick={() => setIsRecommendationsOpen(false)} className="p-2 text-[#71717a] hover:text-white hover:bg-[#18181b] rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4 custom-scrollbar">
              <div className="flex gap-4 p-5 rounded-xl border border-[#27272a] bg-[#18181b]">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1 text-[15px]">Coming soon</h3>
                  <p className="text-[#a1a1aa] text-[13px] leading-relaxed">These recommendations become AI-generated from your real data once Nexus AI is wired in.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { ExpenseIntelligence };
