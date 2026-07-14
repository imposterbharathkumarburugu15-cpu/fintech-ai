import React, { useState } from "react";
import { FileText, Download, Calendar, Activity, PieChart, X, Loader2, CheckCircle } from "lucide-react";

function ReportCenter() {
  const [activePreview, setActivePreview] = useState(null);
  const [exportingReport, setExportingReport] = useState(null);
  const [exportedReport, setExportedReport] = useState(null);

  const reports = [
    { title: "Monthly Financial Report", date: "June 2026", icon: Calendar, type: "Performance" },
    { title: "Q2 Spending Analysis", date: "Q2 2026", icon: Activity, type: "Expense" },
    { title: "Portfolio Summary", date: "YTD 2026", icon: PieChart, type: "Investment" },
    { title: "Financial Health Score", date: "Current", icon: FileText, type: "Assessment" }
  ];

  const handleExport = (title) => {
    setExportingReport(title);
    setTimeout(() => {
      setExportingReport(null);
      setExportedReport(title);
      setTimeout(() => setExportedReport(null), 3000);
    }, 2000);
  };

  return <div className="max-w-[1000px] mx-auto flex flex-col h-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-[40px] font-semibold text-white tracking-[-0.02em] mb-2 leading-none">AI Report Center</h1>
          <p className="text-[#a1a1aa] text-[16px]">Generate and export comprehensive financial documents.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, i) => <div key={i} className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 flex flex-col hover:border-[#3f3f46] transition-colors group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#27272a] flex items-center justify-center">
                  <report.icon className="w-6 h-6 text-[#a1a1aa]" />
                </div>
                <div>
                  <h3 className="text-white font-medium text-[16px]">{report.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-[#a1a1aa] mt-1">
                    <span>{report.type}</span>
                    <span>•</span>
                    <span>{report.date}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-auto flex gap-3">
              <button onClick={() => setActivePreview(report)} className="flex-1 bg-[#202022] hover:bg-[#27272a] text-white py-2.5 rounded-xl text-sm font-medium transition-colors border border-[#3f3f46]">
                Preview
              </button>
              <button 
                onClick={() => handleExport(report.title)}
                disabled={exportingReport === report.title}
                className={`flex-1 ${exportedReport === report.title ? 'bg-emerald-500 hover:bg-emerald-600 border-emerald-500' : 'bg-[#3b82f6] hover:bg-[#2563eb] border-[#3b82f6]'} text-white py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 border disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {exportingReport === report.title ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Exporting...</>
                ) : exportedReport === report.title ? (
                  <><CheckCircle className="w-4 h-4" /> Exported</>
                ) : (
                  <><Download className="w-4 h-4" /> Export PDF</>
                )}
              </button>
            </div>
          </div>)}
      </div>

      {activePreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#09090b] border border-[#27272a] rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-[#27272a] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#27272a] flex items-center justify-center">
                  <activePreview.icon className="w-5 h-5 text-[#a1a1aa]" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-lg">{activePreview.title}</h2>
                  <p className="text-[#a1a1aa] text-sm">{activePreview.date} • {activePreview.type}</p>
                </div>
              </div>
              <button onClick={() => setActivePreview(null)} className="text-[#71717a] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 space-y-6">
              <div className="h-48 w-full rounded-xl bg-gradient-to-br from-[#27272a]/50 to-[#18181b] border border-[#27272a] flex items-center justify-center mb-6">
                <div className="flex flex-col items-center gap-3 text-[#71717a]">
                  <Activity className="w-8 h-8 opacity-50" />
                  <span>Interactive Visualization Data...</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-white font-medium mb-3 text-lg">Executive Summary</h3>
                <p className="text-[#a1a1aa] text-sm leading-relaxed mb-4">
                  This report provides a comprehensive overview of financial performance, highlighting key metrics, trends, and anomalies observed over the specified period. Analysis indicates stable growth in core areas, with notable changes in expense distribution.
                </p>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#18181b] rounded-xl p-4 border border-[#27272a]">
                    <span className="text-[#a1a1aa] text-xs font-medium uppercase tracking-wider">Total Value</span>
                    <div className="text-white font-semibold text-xl mt-1">$124,500</div>
                  </div>
                  <div className="bg-[#18181b] rounded-xl p-4 border border-[#27272a]">
                    <span className="text-[#a1a1aa] text-xs font-medium uppercase tracking-wider">Growth</span>
                    <div className="text-emerald-500 font-semibold text-xl mt-1">+12.4%</div>
                  </div>
                  <div className="bg-[#18181b] rounded-xl p-4 border border-[#27272a]">
                    <span className="text-[#a1a1aa] text-xs font-medium uppercase tracking-wider">Efficiency</span>
                    <div className="text-[#3b82f6] font-semibold text-xl mt-1">94/100</div>
                  </div>
                </div>
                
                <h3 className="text-white font-medium mb-3 text-lg">Key Insights</h3>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-sm text-[#a1a1aa]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] shrink-0 mt-1.5" />
                    <p>Consistent positive cash flow maintained throughout the reporting period.</p>
                  </li>
                  <li className="flex gap-3 text-sm text-[#a1a1aa]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] shrink-0 mt-1.5" />
                    <p>Investment portfolio outperformed the market benchmark by 2.1%.</p>
                  </li>
                  <li className="flex gap-3 text-sm text-[#a1a1aa]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] shrink-0 mt-1.5" />
                    <p>Opportunities identified for expense optimization in technology and subscription services.</p>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 border-t border-[#27272a] bg-[#18181b] flex justify-end gap-3">
              <button onClick={() => setActivePreview(null)} className="bg-[#202022] hover:bg-[#27272a] text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors border border-[#3f3f46]">
                Close
              </button>
              <button 
                onClick={() => { handleExport(activePreview.title); setActivePreview(null); }}
                className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download Full PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>;
}
export {
  ReportCenter
};
