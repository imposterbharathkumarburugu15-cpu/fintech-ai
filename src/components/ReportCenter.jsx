import React, { useState } from "react";
import { FileText, Download, Calendar, Activity, PieChart, X, Loader2, CheckCircle, Sparkles, Send } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";

const mockChartData = [
  { name: "Jan", val: 4000 },
  { name: "Feb", val: 3000 },
  { name: "Mar", val: 2000 },
  { name: "Apr", val: 2780 },
  { name: "May", val: 1890 },
  { name: "Jun", val: 2390 },
  { name: "Jul", val: 3490 },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-xl px-3 py-2 shadow-xl">
      <p className="text-[11px] text-[#71717a] mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-white">${payload[0].value?.toLocaleString()}</p>
    </div>
  );
}

function ReportCenter() {
  const [activePreview, setActivePreview] = useState(null);
  const [exportingReport, setExportingReport] = useState(null);
  const [exportedReport, setExportedReport] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [reports, setReports] = useState([
    { id: 1, title: "Monthly Financial Report", date: "June 2026", icon: Calendar, type: "Performance", score: 92 },
    { id: 2, title: "Q2 Spending Analysis", date: "Q2 2026", icon: Activity, type: "Expense", score: 85 },
    { id: 3, title: "Portfolio Summary", date: "YTD 2026", icon: PieChart, type: "Investment", score: 88 },
  ]);

  const handleExport = (title) => {
    setExportingReport(title);
    setTimeout(() => {
      setExportingReport(null);
      setExportedReport(title);
      setTimeout(() => setExportedReport(null), 3000);
    }, 2000);
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      setReports([{
        id: Date.now(),
        title: "Custom AI Report",
        date: "Just now",
        icon: FileText,
        type: "AI Generated",
        score: 95
      }, ...reports]);
      setIsGenerating(false);
      setPrompt("");
    }, 2500);
  };

  return (
    <div className="max-w-[1080px] mx-auto flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-end mb-8 animate-fade-in-up">
        <div>
          <p className="text-[#3b82f6] text-[11px] font-bold tracking-[0.12em] mb-2 uppercase">Documents</p>
          <h1 className="text-[38px] font-semibold text-white tracking-[-0.025em] mb-2 leading-none">AI Report Center</h1>
          <p className="text-[#71717a] text-[15px]">Generate and export comprehensive financial documents.</p>
        </div>
      </div>

      {/* AI Generator Box */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 mb-8 animate-fade-in-up stagger-1 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#3b82f6]/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#3b82f6]" />
          <h2 className="text-white font-semibold text-[16px]">Generate Report with AI</h2>
        </div>
        
        <form onSubmit={handleGenerate} className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            placeholder="e.g. Generate my monthly expense report and highlight where I can save money..."
            className="w-full bg-[#0f0f11] border border-[#27272a] text-[14px] text-white rounded-xl pl-4 pr-32 py-4 focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all placeholder:text-[#52525b]"
          />
          <button 
            type="submit" 
            disabled={!prompt.trim() || isGenerating}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] text-white text-[13px] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {isGenerating ? "Generating..." : "Generate"}
          </button>
        </form>

        <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
          {["Generate my Q2 spending analysis", "Create a portfolio summary", "Financial health score report"].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setPrompt(suggestion)}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-[#202022] border border-[#27272a] hover:border-[#3f3f46] text-[12px] text-[#a1a1aa] hover:text-white transition-all"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Grid */}
      <h3 className="text-white font-semibold text-[16px] mb-4 animate-fade-in-up stagger-2">Recent Reports</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in-up stagger-2">
        {reports.map((report, i) => (
          <div key={report.id} className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 flex flex-col hover:border-[#3f3f46] transition-all group">
            <div className="flex justify-between items-start mb-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#27272a] to-[#1e1e22] border border-[#3f3f46] flex items-center justify-center">
                <report.icon className="w-5 h-5 text-[#a1a1aa] group-hover:text-white transition-colors" />
              </div>
              <span className="badge badge-blue">{report.type}</span>
            </div>
            
            <h3 className="text-white font-semibold text-[15px] mb-1">{report.title}</h3>
            <p className="text-[13px] text-[#71717a] mb-5">{report.date}</p>
            
            <div className="mt-auto flex gap-2">
              <button 
                onClick={() => setActivePreview(report)} 
                className="flex-1 bg-[#202022] hover:bg-[#27272a] text-white py-2 rounded-xl text-[13px] font-semibold transition-colors border border-[#3f3f46]"
              >
                Preview
              </button>
              <button 
                onClick={() => handleExport(report.title)}
                disabled={exportingReport === report.title}
                className={`flex-1 ${exportedReport === report.title ? 'bg-[#22c55e] hover:bg-[#16a34a] border-[#22c55e]' : 'bg-[#3b82f6] hover:bg-[#2563eb] border-[#3b82f6]'} text-white py-2 rounded-xl text-[13px] font-semibold transition-all flex items-center justify-center gap-1.5 border disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {exportingReport === report.title ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : exportedReport === report.title ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                {exportingReport === report.title ? 'Exporting...' : exportedReport === report.title ? 'Exported' : 'PDF'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {activePreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#09090b] border border-[#27272a] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[#27272a] flex items-center justify-between shrink-0 bg-[#09090b] rounded-t-2xl z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3b82f6]/20 to-[#8b5cf6]/20 border border-[#3b82f6]/20 flex items-center justify-center">
                  <activePreview.icon className="w-5 h-5 text-[#3b82f6]" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-xl">{activePreview.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge badge-blue">{activePreview.type}</span>
                    <span className="text-[#a1a1aa] text-sm">• {activePreview.date}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setActivePreview(null)} className="p-2 text-[#71717a] hover:text-white hover:bg-[#18181b] rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-8 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
              
              {/* Executive Summary & Score */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#3b82f6]" /> Executive Summary
                  </h3>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-[#a1a1aa] text-[14px] leading-relaxed">
                      This report provides a comprehensive overview of your financial performance for the period. Our AI analysis indicates stable growth in core areas, with notable opportunities identified for expense optimization in technology and subscription services. Your portfolio has slightly outperformed the benchmark, primarily driven by strong tech sector performance.
                    </p>
                  </div>
                </div>
                <div className="bg-[#18181b] rounded-xl p-5 border border-[#27272a] flex flex-col items-center justify-center text-center">
                   <div className="relative w-20 h-20 mb-3">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
                      <circle cx="44" cy="44" r="36" stroke="#27272a" strokeWidth="6" fill="none" />
                      <circle
                        cx="44" cy="44" r="36"
                        stroke="#22c55e"
                        strokeWidth="6"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${(activePreview.score / 100) * 2 * Math.PI * 36} ${2 * Math.PI * 36}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-white">{activePreview.score}</span>
                    </div>
                  </div>
                  <span className="text-[12px] font-semibold text-[#a1a1aa] uppercase tracking-wider">Health Score</span>
                </div>
              </div>

              {/* Chart Visualization */}
              <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
                 <h3 className="text-white font-semibold mb-4 text-[15px]">Performance Trend</h3>
                 <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" axisLine={{ stroke: "#27272a" }} tickLine={false} tick={{ fill: "#71717a", fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                        <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: "#27272a", strokeWidth: 1, strokeDasharray: "4 4" }} />
                        <Area type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorVal)" />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>
              
              {/* Key Insights */}
              <div>
                <h3 className="text-white font-semibold mb-4 text-[15px]">Key Insights & Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-[#18181b] rounded-xl p-4 border border-[#27272a]">
                     <h4 className="text-emerald-500 font-semibold text-[13px] mb-2 uppercase tracking-wider">Strengths</h4>
                     <ul className="space-y-2">
                       <li className="flex gap-2 text-[13px] text-[#a1a1aa]">
                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                         Consistent positive cash flow maintained throughout the period.
                       </li>
                       <li className="flex gap-2 text-[13px] text-[#a1a1aa]">
                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                         Investment portfolio outperformed benchmark by 2.1%.
                       </li>
                     </ul>
                   </div>
                   <div className="bg-[#18181b] rounded-xl p-4 border border-[#27272a]">
                     <h4 className="text-amber-500 font-semibold text-[13px] mb-2 uppercase tracking-wider">Opportunities</h4>
                     <ul className="space-y-2">
                       <li className="flex gap-2 text-[13px] text-[#a1a1aa]">
                         <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                         Dining expenses are trending 12% higher than average.
                       </li>
                       <li className="flex gap-2 text-[13px] text-[#a1a1aa]">
                         <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                         Cash drag: $15,000 sitting in low-yield checking account.
                       </li>
                     </ul>
                   </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-[#27272a] bg-[#09090b] flex justify-end gap-3 shrink-0 rounded-b-2xl">
              <button onClick={() => setActivePreview(null)} className="bg-[#18181b] hover:bg-[#27272a] text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-colors border border-[#3f3f46]">
                Close
              </button>
              <button 
                onClick={() => { handleExport(activePreview.title); setActivePreview(null); }}
                className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-6 py-2.5 rounded-xl text-[13px] font-semibold transition-all flex items-center gap-2 shadow-[0_4px_12px_rgba(59,130,246,0.3)]"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { ReportCenter };
