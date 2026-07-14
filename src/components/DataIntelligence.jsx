import { useState, useRef } from "react";
import { UploadCloud, FileSpreadsheet, Loader2, Database, BarChart3, X } from "lucide-react";
import Markdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
function DataIntelligence() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [previewData, setPreviewData] = useState({ columns: [], rows: [] });
  const fileInputRef = useRef(null);
  const parseAndAnalyze = async (uploadedFile) => {
    setFile(uploadedFile);
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const text = await uploadedFile.text();
      const lines = text.split("\n").filter((l) => l.trim() !== "");
      let columns = [];
      let rows = [];
      if (lines.length > 0) {
        columns = lines[0].split(",").map((c) => c.trim().replace(/['"]/g, ""));
        rows = lines.slice(1, 15).map((line) => {
          const values = line.split(",");
          return columns.reduce((obj, col, i) => {
            obj[col] = values[i]?.trim().replace(/['"]/g, "");
            return obj;
          }, {});
        });
      }
      setPreviewData({ columns, rows });
      const prompt = `I am providing a financial dataset in CSV format named "${uploadedFile.name}". Here is a sample of the raw data:

${text.substring(0, 3e3)}

Please provide a highly professional, executive-level financial analysis of this data. Identify obvious trends, potential anomalies, and key metrics. Keep it concise, structured, and use markdown. Tone: Senior Financial Analyst at a top tier firm.`;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalysis(data.text);
    } catch (err) {
      setAnalysis(`**Error analyzing data:** ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      parseAndAnalyze(e.dataTransfer.files[0]);
    }
  };
  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      parseAndAnalyze(e.target.files[0]);
    }
  };
  return <div className="max-w-[1000px] mx-auto flex flex-col h-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-[40px] font-semibold text-white tracking-[-0.02em] mb-2 leading-none">Data Intelligence</h1>
          <p className="text-[#a1a1aa] text-[16px]">Upload CSV datasets for instant AI-driven financial analysis.</p>
        </div>
      </div>

      {!file && !isAnalyzing && !analysis ? <div
    className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-colors ${isDragging ? "border-[#3b82f6] bg-[#3b82f6]/5" : "border-[#27272a] bg-[#18181b] hover:border-[#3f3f46]"}`}
    onDragOver={(e) => {
      e.preventDefault();
      setIsDragging(true);
    }}
    onDragLeave={() => setIsDragging(false)}
    onDrop={handleDrop}
  >
          <div className="w-16 h-16 rounded-2xl bg-[#27272a] flex items-center justify-center mb-6">
            <UploadCloud className="w-8 h-8 text-[#a1a1aa]" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">Drop your dataset here</h3>
          <p className="text-[#71717a] mb-6 text-center max-w-md">Upload CSV files containing transaction logs, market data, or portfolio holdings. FinPilot AI will automatically parse and generate executive insights.</p>
          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileInput} />
          <button onClick={() => fileInputRef.current?.click()} className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            Browse Files
          </button>
        </div> : <AnimatePresence mode="wait">
          <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col gap-6 flex-1 min-h-0"
  >
            {
    /* Header with file info and clear button */
  }
            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-[#3b82f6]/10 text-[#3b82f6] flex items-center justify-center">
                   <FileSpreadsheet className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="text-white font-medium text-[16px]">{file?.name}</h3>
                   <p className="text-[#a1a1aa] text-[14px]">{file?.size ? (file.size / 1024).toFixed(1) : 0} KB • CSV Dataset</p>
                 </div>
              </div>
              <button onClick={() => {
    setFile(null);
    setAnalysis(null);
  }} className="text-[#71717a] hover:text-white p-2 rounded-lg hover:bg-[#27272a] transition-colors border border-transparent hover:border-[#3f3f46]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
               {
    /* Left: Preview Data */
  }
               <div className="bg-[#18181b] border border-[#27272a] rounded-2xl flex flex-col overflow-hidden">
                 <div className="p-6 border-b border-[#27272a] flex items-center gap-3 shrink-0">
                   <Database className="w-5 h-5 text-[#a1a1aa]" />
                   <h3 className="text-white font-medium text-[16px]">Data Preview</h3>
                 </div>
                 <div className="flex-1 overflow-auto p-0">
                   {previewData.columns.length > 0 ? <table className="w-full text-left text-sm text-[#a1a1aa]">
                       <thead className="bg-[#202022] sticky top-0 shadow-sm">
                         <tr>
                           {previewData.columns.map((col, i) => <th key={i} className="px-6 py-3 font-medium text-[#e4e4e7] truncate max-w-[150px] whitespace-nowrap">{col}</th>)}
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-[#27272a]">
                         {previewData.rows.map((row, i) => <tr key={i} className="hover:bg-[#202022]/50 transition-colors">
                             {previewData.columns.map((col, j) => <td key={j} className="px-6 py-3 truncate max-w-[150px]">{row[col]}</td>)}
                           </tr>)}
                       </tbody>
                     </table> : <div className="flex items-center justify-center h-full text-[#71717a]">No data to preview</div>}
                 </div>
               </div>

               {
    /* Right: AI Analysis */
  }
               <div className="bg-[#18181b] border border-[#27272a] rounded-2xl flex flex-col overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-[#3b82f6]/10 rounded-full blur-3xl pointer-events-none" />
                 <div className="p-6 border-b border-[#27272a] flex items-center gap-3 z-10 shrink-0">
                   <BarChart3 className="w-5 h-5 text-[#3b82f6]" />
                   <h3 className="text-white font-medium text-[16px]">AI Executive Summary</h3>
                 </div>
                 <div className="flex-1 overflow-auto p-6 z-10">
                   {isAnalyzing ? <div className="flex flex-col items-center justify-center h-full text-[#a1a1aa] space-y-4">
                       <Loader2 className="w-8 h-8 text-[#3b82f6] animate-spin" />
                       <p>Processing dataset and generating insights...</p>
                     </div> : analysis ? <div className="text-[#e4e4e7] text-[14px] leading-relaxed markdown-body">
                       <Markdown>{analysis}</Markdown>
                     </div> : null}
                 </div>
               </div>
            </div>
          </motion.div>
        </AnimatePresence>}
    </div>;
}
export {
  DataIntelligence
};
