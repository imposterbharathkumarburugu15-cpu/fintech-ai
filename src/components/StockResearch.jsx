import { useState } from "react";
import { Search, TrendingUp, TrendingDown, Info, BarChart2 } from "lucide-react";
function StockResearch() {
  const [query, setQuery] = useState("");
  return <div className="max-w-[1000px] mx-auto flex flex-col h-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-[40px] font-semibold text-white tracking-[-0.02em] mb-2 leading-none">Stock Research Hub</h1>
          <p className="text-[#a1a1aa] text-[16px]">AI-driven company summaries and competitor comparisons.</p>
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
        <input
    type="text"
    placeholder="Search any stock symbol or company name (e.g. AAPL, Tesla)..."
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    className="w-full bg-[#18181b] border border-[#27272a] rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-[#71717a] focus:outline-none focus:border-[#3b82f6] transition-colors"
  />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Apple Inc. (AAPL)</h2>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-[#a1a1aa]">Technology</span>
                  <span className="text-[#27272a]">|</span>
                  <span className="text-[#a1a1aa]">Consumer Electronics</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">$214.32</div>
                <div className="flex items-center justify-end text-[#22c55e] text-sm font-medium mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" /> +1.24%
                </div>
              </div>
            </div>
            
            <div className="prose prose-invert max-w-none">
              <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2"><Info className="w-4 h-4 text-[#3b82f6]" /> AI Company Summary</h3>
              <p className="text-[#a1a1aa] text-sm leading-relaxed mb-4">
                Apple designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company is currently focusing heavily on expanding its services revenue and integrating "Apple Intelligence" across its ecosystem.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-[#202022] rounded-xl p-4 border border-[#27272a]">
                  <h4 className="text-[#22c55e] font-medium mb-2 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Bull Case</h4>
                  <ul className="text-sm text-[#a1a1aa] space-y-2 list-disc pl-4">
                    <li>Strong services growth (App Store, Apple Music, iCloud).</li>
                    <li>Massive installed base driving hardware upgrade cycles.</li>
                    <li>High margin AI integration incoming.</li>
                  </ul>
                </div>
                <div className="bg-[#202022] rounded-xl p-4 border border-[#27272a]">
                  <h4 className="text-[#ef4444] font-medium mb-2 flex items-center gap-2"><TrendingDown className="w-4 h-4" /> Bear Case</h4>
                  <ul className="text-sm text-[#a1a1aa] space-y-2 list-disc pl-4">
                    <li>Regulatory scrutiny globally (App Store policies).</li>
                    <li>Slowing iPhone demand in key emerging markets.</li>
                    <li>High valuation relative to historical averages.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-[#a1a1aa]" /> Financial Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#27272a]">
                <span className="text-[#a1a1aa] text-sm">Market Cap</span>
                <span className="text-white font-medium text-sm">3.28T</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#27272a]">
                <span className="text-[#a1a1aa] text-sm">P/E Ratio</span>
                <span className="text-white font-medium text-sm">32.4</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#27272a]">
                <span className="text-[#a1a1aa] text-sm">Div Yield</span>
                <span className="text-white font-medium text-sm">0.46%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#a1a1aa] text-sm">52W Range</span>
                <span className="text-white font-medium text-sm">164.08 - 220.20</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
}
export {
  StockResearch
};
