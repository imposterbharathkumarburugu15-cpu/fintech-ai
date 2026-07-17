import React, { useRef, useState } from "react";
import Papa from "papaparse";
import { UploadCloud, CreditCard, DollarSign, Sparkles, X, TrendingDown, TrendingUp, AlertTriangle, Coffee, ShoppingBag, Laptop, Home, Plane } from "lucide-react";

const autoCategorize = (description) => {
  const desc = description.toLowerCase();
  if (desc.includes("apple") || desc.includes("best buy") || desc.includes("amazon") || desc.includes("microsoft")) return { cat: "Technology", icon: Laptop, color: "#3b82f6" };
  if (desc.includes("whole foods") || desc.includes("kroger") || desc.includes("walmart") || desc.includes("trader joe")) return { cat: "Groceries", icon: ShoppingBag, color: "#22c55e" };
  if (desc.includes("netflix") || desc.includes("spotify") || desc.includes("hulu") || desc.includes("amc") || desc.includes("disney")) return { cat: "Entertainment", icon: Sparkles, color: "#8b5cf6" };
  if (desc.includes("uber") || desc.includes("lyft") || desc.includes("chevron") || desc.includes("shell") || desc.includes("transit") || desc.includes("gas") || desc.includes("delta") || desc.includes("united")) return { cat: "Transportation", icon: Plane, color: "#f59e0b" };
  if (desc.includes("salary") || desc.includes("payroll") || desc.includes("deposit")) return { cat: "Income", icon: DollarSign, color: "#22c55e" };
  if (desc.includes("restaurant") || desc.includes("cafe") || desc.includes("starbucks") || desc.includes("mcdonalds") || desc.includes("coffee") || desc.includes("dining")) return { cat: "Dining", icon: Coffee, color: "#ef4444" };
  if (desc.includes("rent") || desc.includes("mortgage") || desc.includes("airbnb")) return { cat: "Housing", icon: Home, color: "#06b6d4" };
  return { cat: "Other", icon: CreditCard, color: "#71717a" };
};

const CATEGORY_STATS = [
  { name: "Housing", amount: 2400, percent: 53, color: "#06b6d4" },
  { name: "Dining", amount: 840, percent: 18, color: "#ef4444" },
  { name: "Groceries", amount: 620, percent: 14, color: "#22c55e" },
  { name: "Technology", amount: 350, percent: 8, color: "#3b82f6" },
  { name: "Transportation", amount: 310, percent: 7, color: "#f59e0b" },
];

function ExpenseIntelligence() {
  const fileInputRef = useRef(null);
  const [isRecommendationsOpen, setIsRecommendationsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const [transactions, setTransactions] = useState([
    { id: 1, name: "Apple Store", category: "Technology", amount: -1299, date: "Today, 2:45 PM", icon: Laptop, type: "expense", color: "#3b82f6" },
    { id: 2, name: "Salary", category: "Income", amount: 5400, date: "Yesterday, 9:00 AM", icon: DollarSign, type: "income", color: "#22c55e" },
    { id: 3, name: "Whole Foods", category: "Groceries", amount: -145.2, date: "Jun 16, 4:20 PM", icon: ShoppingBag, type: "expense", color: "#22c55e" },
    { id: 4, name: "Netflix", category: "Entertainment", amount: -15.99, date: "Jun 15, 10:00 AM", icon: Sparkles, type: "expense", color: "#8b5cf6" },
    { id: 5, name: "Uber", category: "Transportation", amount: -24.5, date: "Jun 14, 8:15 PM", icon: Plane, type: "expense", color: "#f59e0b" }
  ]);

  const processFile = (file) => {
    if (!file) return;
    if (file.type === "text/csv" || file.name.endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const newTransactions = results.data.filter(row => Object.keys(row).length > 0 && Object.values(row).some(v => v !== "")).map((row, index) => {
            const keys = Object.keys(row);
            
            // Look for Description column (expanded for global and Indian banks)
            let descKey = keys.find(k => k.toLowerCase().match(/desc|name|merchant|payee|title|transaction|detail|particular|narration|info|memo|remark|company/i));
            
            // If still no description key found, just pick the longest string value in the row that isn't a date or number
            if (!descKey) {
              const possibleKeys = keys.filter(k => isNaN(parseFloat(row[k])) && !row[k].match(/\d{2}[\/\-]\d{2}[\/\-]\d{2,4}/));
              descKey = possibleKeys.length > 0 ? possibleKeys[0] : keys[1]; // fallback to second column
            }
            
            const description = descKey && row[descKey] ? String(row[descKey]).trim() : "Unknown Transaction";
            
            // Look for Amount column
            let amountKey = keys.find(k => k.toLowerCase().match(/amount|cost|price|debit|credit|value|total|withdrawal|deposit/i));
            let rawAmount = amountKey ? row[amountKey] : null;
            
            if (!rawAmount) {
              const possibleAmountKey = keys.find(k => String(row[k]).match(/^[\$£€\-\+]?\s*\d+(?:,\d{3})*(?:\.\d{2})?$/));
              rawAmount = possibleAmountKey ? row[possibleAmountKey] : "0";
            }

            const dateKey = keys.find(k => k.toLowerCase().match(/date|time|when/i));
            const date = dateKey ? row[dateKey] : new Date().toLocaleDateString();
            
            let cleanedAmount = String(rawAmount).replace(/[,$£€]/g, '').trim();
            if (cleanedAmount.endsWith('-') || (cleanedAmount.startsWith('(') && cleanedAmount.endsWith(')'))) {
              cleanedAmount = '-' + cleanedAmount.replace(/[-()]/g, '');
            }
            
            let amount = parseFloat(cleanedAmount);
            if (isNaN(amount)) amount = 0;
            
            const type = amount >= 0 ? "income" : "expense";
            const catData = autoCategorize(description);
            
            return {
              id: Date.now() + index,
              name: description,
              category: catData.cat,
              amount,
              date,
              icon: type === "income" ? DollarSign : catData.icon,
              type,
              color: type === "income" ? "#22c55e" : catData.color
            };
          });
          setTransactions((prev) => [...newTransactions, ...prev]);
        }
      });
    } else {
      alert("Please upload a valid CSV file.");
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileUpload = (e) => processFile(e.target.files?.[0]);
  
  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div className="max-w-[1080px] mx-auto flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-end mb-8 animate-fade-in-up">
        <div>
          <p className="text-[#3b82f6] text-[11px] font-bold tracking-[0.12em] mb-2 uppercase">Analysis</p>
          <h1 className="text-[38px] font-semibold text-white tracking-[-0.025em] mb-2 leading-none">Expense Intelligence</h1>
          <p className="text-[#71717a] text-[15px]">AI-powered transaction categorization and spending trends.</p>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fade-in-up stagger-1">
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5">
          <p className="text-[#71717a] text-[13px] font-medium mb-1">Total Spent This Month</p>
          <h3 className="text-[28px] font-semibold text-white tracking-tight">$4,520</h3>
          <div className="flex items-center text-[#ef4444] text-[12px] font-semibold mt-1">
             <TrendingUp className="w-3.5 h-3.5 mr-1" /> +10.5% vs last month
          </div>
        </div>
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5">
          <p className="text-[#71717a] text-[13px] font-medium mb-1">Top Spending Category</p>
          <h3 className="text-[28px] font-semibold text-white tracking-tight">Housing</h3>
          <div className="flex items-center text-[#a1a1aa] text-[12px] font-medium mt-1">
             53% of total expenses
          </div>
        </div>
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5">
          <p className="text-[#71717a] text-[13px] font-medium mb-1">Average Daily Spend</p>
          <h3 className="text-[28px] font-semibold text-white tracking-tight">$145.80</h3>
          <div className="flex items-center text-[#22c55e] text-[12px] font-semibold mt-1">
             <TrendingDown className="w-3.5 h-3.5 mr-1" /> -$12.40 vs last month
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in-up stagger-2">
        {/* Left Col: Transactions */}
        <div className="md:col-span-2 bg-[#18181b] border border-[#27272a] rounded-2xl overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-[#27272a] flex justify-between items-center bg-[#18181b] shrink-0">
            <h3 className="text-white font-semibold text-[15px]">Recent Transactions</h3>
            <span className="text-[12px] text-[#71717a]">{transactions.length} total</span>
          </div>
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
                  {t.type === "income" ? "+" : ""}{t.amount < 0 ? "-" : ""}${Math.abs(t.amount).toLocaleString(void 0, { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Right Col: Insights & Upload & Breakdown */}
        <div className="space-y-6">
          {/* AI Insights Card */}
          <div className="bg-[#18181b] border border-[#3b82f6]/30 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.05)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#3b82f6]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#3b82f6]" />
              <h3 className="text-white font-semibold text-[15px]">AI Insights</h3>
            </div>
            <p className="text-[#a1a1aa] text-[13px] leading-relaxed mb-4">
              We detected <span className="text-white font-semibold">3 active subscriptions</span> totaling $45/mo. Your dining expenses are <span className="text-[#ef4444] font-medium">12% higher</span> this month.
            </p>
            <button 
              onClick={() => setIsRecommendationsOpen(true)} 
              className="text-[#3b82f6] hover:text-[#60a5fa] text-[13px] font-semibold transition-colors flex items-center gap-1"
            >
              Review Budget Recommendations <TrendingUp className="w-4 h-4 ml-1" />
            </button>
          </div>

          {/* Upload Area */}
          <div 
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`bg-[#18181b] border-2 border-dashed ${isDragging ? 'border-[#3b82f6] bg-[#3b82f6]/5' : 'border-[#3f3f46]'} rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${isDragging ? 'bg-[#3b82f6]/20' : 'bg-[#27272a]'}`}>
              <UploadCloud className={`w-6 h-6 ${isDragging ? 'text-[#3b82f6]' : 'text-[#a1a1aa]'}`} />
            </div>
            <h3 className="text-white font-semibold text-[15px] mb-1">Upload Statement</h3>
            <p className="text-[#71717a] text-[12px] mb-4 max-w-[200px]">Drag & drop CSV or PDF formats supported</p>
            <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileUpload} />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="bg-[#27272a] hover:bg-[#3f3f46] text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-colors w-full"
            >
              Browse Files
            </button>
          </div>

          {/* Category Breakdown */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6">
            <h3 className="text-white font-semibold text-[15px] mb-4">Category Breakdown</h3>
            <div className="space-y-4">
              {CATEGORY_STATS.map(stat => (
                <div key={stat.name}>
                  <div className="flex justify-between text-[12px] mb-1.5">
                    <span className="text-[#e4e4e7] font-medium">{stat.name}</span>
                    <span className="text-[#71717a] font-mono">${stat.amount.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#27272a] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${stat.percent}%`, backgroundColor: stat.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations Modal */}
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
              
              <div className="flex gap-4 p-5 rounded-xl border border-[#27272a] bg-[#18181b] hover:border-[#3f3f46] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <TrendingDown className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1 text-[15px]">Optimize Subscriptions</h3>
                  <p className="text-[#a1a1aa] text-[13px] leading-relaxed mb-3">
                    You are paying for both Netflix and Hulu but rarely use Hulu. Canceling Hulu could save you <span className="text-white font-semibold">$14.99/mo</span> ($179.88/year).
                  </p>
                  <button className="bg-[#27272a] hover:bg-[#3f3f46] text-white px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors">
                    Review Subscriptions
                  </button>
                </div>
              </div>
              
              <div className="flex gap-4 p-5 rounded-xl border border-[#27272a] bg-[#18181b] hover:border-[#3f3f46] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1 text-[15px]">Dining Out Alert</h3>
                  <p className="text-[#a1a1aa] text-[13px] leading-relaxed mb-3">
                    Dining expenses are trending <span className="text-amber-500 font-medium">12% higher</span> than your historical average. Consider a weekly meal prep plan to reduce weekday lunches.
                  </p>
                  <button className="bg-[#27272a] hover:bg-[#3f3f46] text-white px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors">
                    Set Dining Budget
                  </button>
                </div>
              </div>
              
              <div className="flex gap-4 p-5 rounded-xl border border-[#27272a] bg-[#18181b] hover:border-[#3f3f46] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1 text-[15px]">Savings Opportunity</h3>
                  <p className="text-[#a1a1aa] text-[13px] leading-relaxed mb-3">
                    Your income exceeded expenses by a larger margin this month. Redirecting an extra <span className="text-white font-semibold">$300</span> to your Emergency Fund will reach your goal 2 months faster.
                  </p>
                  <button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors shadow-[0_2px_8px_rgba(59,130,246,0.3)]">
                    Transfer to Savings
                  </button>
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
