import React, { useRef, useState } from "react";
import Papa from "papaparse";
import { UploadCloud, CreditCard, DollarSign, Sparkles, X, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";

const autoCategorize = (description) => {
  const desc = description.toLowerCase();
  if (desc.includes("apple") || desc.includes("best buy") || desc.includes("amazon")) return "Technology";
  if (desc.includes("whole foods") || desc.includes("kroger") || desc.includes("walmart") || desc.includes("trader joe")) return "Groceries";
  if (desc.includes("netflix") || desc.includes("spotify") || desc.includes("hulu") || desc.includes("amc") || desc.includes("disney")) return "Entertainment";
  if (desc.includes("uber") || desc.includes("lyft") || desc.includes("chevron") || desc.includes("shell") || desc.includes("transit") || desc.includes("gas")) return "Transportation";
  if (desc.includes("salary") || desc.includes("payroll") || desc.includes("deposit")) return "Income";
  if (desc.includes("restaurant") || desc.includes("cafe") || desc.includes("starbucks") || desc.includes("mcdonalds") || desc.includes("coffee") || desc.includes("dining")) return "Dining";
  return "Other";
};

function ExpenseIntelligence() {
  const fileInputRef = useRef(null);
  const [isRecommendationsOpen, setIsRecommendationsOpen] = useState(false);
  
  const [transactions, setTransactions] = useState([
    { id: 1, name: "Apple Store", category: "Technology", amount: -1299, date: "Today, 2:45 PM", icon: CreditCard, type: "expense" },
    { id: 2, name: "Salary", category: "Income", amount: 5400, date: "Yesterday, 9:00 AM", icon: DollarSign, type: "income" },
    { id: 3, name: "Whole Foods", category: "Groceries", amount: -145.2, date: "Jun 16, 4:20 PM", icon: CreditCard, type: "expense" },
    { id: 4, name: "Netflix", category: "Entertainment", amount: -15.99, date: "Jun 15, 10:00 AM", icon: CreditCard, type: "expense" },
    { id: 5, name: "Uber", category: "Transportation", amount: -24.5, date: "Jun 14, 8:15 PM", icon: CreditCard, type: "expense" }
  ]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "text/csv" || file.name.endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const newTransactions = results.data.filter(row => Object.keys(row).length > 0 && Object.values(row).some(v => v !== "")).map((row, index) => {
            const keys = Object.keys(row);
            
            const descKey = keys.find(k => k.toLowerCase().match(/desc|name|merchant|payee|title|transaction/i));
            const description = descKey ? row[descKey] : "Unknown Transaction";
            
            let amountKey = keys.find(k => k.toLowerCase().match(/amount|cost|price|debit|credit|value|total/i));
            let rawAmount = amountKey ? row[amountKey] : null;
            
            if (!rawAmount) {
              const possibleAmountKey = keys.find(k => String(row[k]).match(/^[\$£€\-\+]?\s*\d+(?:,\d{3})*(?:\.\d{2})?$/));
              rawAmount = possibleAmountKey ? row[possibleAmountKey] : "0";
            }

            const dateKey = keys.find(k => k.toLowerCase().match(/date|time|when/i));
            const date = dateKey ? row[dateKey] : new Date().toLocaleDateString();
            
            // Fix parsing for formats like "$1,234.56" or "-$12.34"
            // Also handle cases where expenses might be represented as positive numbers (common in some statements)
            let cleanedAmount = String(rawAmount).replace(/[,$£€]/g, '').trim();
            // Handle trailing minus sign like "12.34-" or parentheses "(12.34)"
            if (cleanedAmount.endsWith('-') || (cleanedAmount.startsWith('(') && cleanedAmount.endsWith(')'))) {
              cleanedAmount = '-' + cleanedAmount.replace(/[-()]/g, '');
            }
            
            let amount = parseFloat(cleanedAmount);
            if (isNaN(amount)) amount = 0;
            
            // If the statement is a credit card statement, purchases (debits) might be positive and payments (credits) negative.
            // In our system, expenses should be negative and income positive.
            // We'll leave it as parsed for now unless there's a strong reason to invert it.

            const category = autoCategorize(description);
            const type = amount >= 0 ? "income" : "expense";
            
            return {
              id: Date.now() + index,
              name: description,
              category,
              amount,
              date,
              icon: type === "income" ? DollarSign : CreditCard,
              type
            };
          });
          
          setTransactions((prev) => [...newTransactions, ...prev]);
        }
      });
    } else {
      alert("Please upload a valid CSV file.");
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return <div className="max-w-[1000px] mx-auto flex flex-col h-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-[40px] font-semibold text-white tracking-[-0.02em] mb-2 leading-none">Expense Intelligence</h1>
          <p className="text-[#a1a1aa] text-[16px]">AI-powered transaction categorization and spending trends.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#27272a] flex justify-between items-center">
            <h3 className="text-white font-medium text-[16px]">Recent Transactions</h3>
          </div>
          <div className="divide-y divide-[#27272a]">
            {transactions.map((t) => <div key={t.id} className="p-6 flex items-center justify-between hover:bg-[#202022] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === "income" ? "bg-[#22c55e]/10 text-[#22c55e]" : "bg-[#27272a] text-[#a1a1aa]"}`}>
                    <t.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-[15px] mb-0.5">{t.name}</h4>
                    <div className="flex items-center gap-2 text-[13px] text-[#a1a1aa]">
                      <span>{t.category}</span>
                      <span>•</span>
                      <span className="font-mono text-[11px]">{t.date}</span>
                    </div>
                  </div>
                </div>
                <div className={`text-[16px] font-mono font-medium ${t.type === "income" ? "text-[#22c55e]" : "text-white"}`}>
                  {t.type === "income" ? "+" : ""}{t.amount < 0 ? "-" : ""}${Math.abs(t.amount).toLocaleString(void 0, { minimumFractionDigits: 2 })}
                </div>
              </div>)}
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 flex flex-col items-center justify-center text-center border-dashed">
            <div className="w-12 h-12 rounded-xl bg-[#27272a] flex items-center justify-center mb-4">
              <UploadCloud className="w-6 h-6 text-[#a1a1aa]" />
            </div>
            <h3 className="text-white font-medium mb-2">Upload Statement</h3>
            <p className="text-[#a1a1aa] text-sm mb-4">CSV or PDF formats supported</p>
            <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileUpload} />
            <button onClick={() => fileInputRef.current?.click()} className="bg-[#27272a] hover:bg-[#3f3f46] text-white px-4 py-2 rounded-lg text-sm transition-colors w-full">Browse Files</button>
          </div>
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b5cf6]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-[#8b5cf6]" />
              <h3 className="text-white font-medium">AI Insights</h3>
            </div>
            <p className="text-[#a1a1aa] text-sm leading-relaxed mb-4">
              We detected <span className="text-white font-medium">3 active subscriptions</span> totaling $45/mo. Your dining expenses are <span className="text-[#ef4444]">12% higher</span> this month compared to average.
            </p>
            <button onClick={() => setIsRecommendationsOpen(true)} className="text-[#8b5cf6] hover:text-[#7c3aed] text-sm font-medium transition-colors">Review Budget Recommendations →</button>
          </div>
        </div>
      </div>

      {isRecommendationsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#09090b] border border-[#27272a] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-[#27272a] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#8b5cf6]" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-lg">AI Budget Recommendations</h2>
                  <p className="text-[#a1a1aa] text-sm">Personalized insights based on your spending</p>
                </div>
              </div>
              <button onClick={() => setIsRecommendationsOpen(false)} className="text-[#71717a] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
              <div className="flex gap-4 p-4 rounded-xl border border-[#27272a] bg-[#18181b]">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <TrendingDown className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Optimize Subscriptions</h3>
                  <p className="text-[#a1a1aa] text-sm leading-relaxed mb-3">
                    You are paying for both Netflix and Hulu but rarely use Hulu. Canceling Hulu could save you <span className="text-white font-medium">$14.99/mo</span> ($179.88/year).
                  </p>
                  <button className="bg-[#27272a] hover:bg-[#3f3f46] text-white px-4 py-2 rounded-lg text-sm transition-colors">
                    Review Subscriptions
                  </button>
                </div>
              </div>
              
              <div className="flex gap-4 p-4 rounded-xl border border-[#27272a] bg-[#18181b]">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Dining Out Alert</h3>
                  <p className="text-[#a1a1aa] text-sm leading-relaxed mb-3">
                    Dining expenses are trending <span className="text-amber-500 font-medium">12% higher</span> than your historical average. Consider a weekly meal prep plan to reduce weekday lunches.
                  </p>
                  <button className="bg-[#27272a] hover:bg-[#3f3f46] text-white px-4 py-2 rounded-lg text-sm transition-colors">
                    Set Dining Budget
                  </button>
                </div>
              </div>
              
              <div className="flex gap-4 p-4 rounded-xl border border-[#27272a] bg-[#18181b]">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Savings Opportunity</h3>
                  <p className="text-[#a1a1aa] text-sm leading-relaxed mb-3">
                    Your income exceeded expenses by a larger margin this month. Redirecting an extra <span className="text-white font-medium">$300</span> to your Emergency Fund will reach your goal 2 months faster.
                  </p>
                  <button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-4 py-2 rounded-lg text-sm transition-colors">
                    Transfer to Savings
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-[#27272a] bg-[#18181b] flex justify-end">
              <button onClick={() => setIsRecommendationsOpen(false)} className="bg-[#27272a] hover:bg-[#3f3f46] text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>;
}
export {
  ExpenseIntelligence
};
