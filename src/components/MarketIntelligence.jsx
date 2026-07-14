import React, { useState } from "react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { ArrowUpRight, Activity } from "lucide-react";
const sp500Data = [
  { time: "09:30", price: 5410.2 },
  { time: "10:00", price: 5415.5 },
  { time: "11:00", price: 5422.1 },
  { time: "12:00", price: 5418.9 },
  { time: "13:00", price: 5425.4 },
  { time: "14:00", price: 5432.8 },
  { time: "15:00", price: 5440.1 },
  { time: "16:00", price: 5438.5 }
];
const nasdaqData = [
  { time: "09:30", price: 17820.1 },
  { time: "10:00", price: 17845.3 },
  { time: "11:00", price: 17890.2 },
  { time: "12:00", price: 17875.5 },
  { time: "13:00", price: 17910.8 },
  { time: "14:00", price: 17950.4 },
  { time: "15:00", price: 17985.9 },
  { time: "16:00", price: 17970.2 }
];
const btcData = [
  { time: "09:30", price: 65120 },
  { time: "10:00", price: 65450 },
  { time: "11:00", price: 65280 },
  { time: "12:00", price: 64900 },
  { time: "13:00", price: 65150 },
  { time: "14:00", price: 65600 },
  { time: "15:00", price: 65850 },
  { time: "16:00", price: 65920 }
];
function MiniChart({ data, color }) {
  return <div className="h-16 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="price" stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#gradient-${color.replace("#", "")})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>;
}
function MainChart({ data }) {
  return <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="mainGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" axisLine={{ stroke: "#27272a" }} tickLine={false} tick={{ fill: "#71717a", fontSize: 12 }} dy={10} />
        <YAxis domain={["auto", "auto"]} axisLine={false} tickLine={false} tick={{ fill: "#71717a", fontSize: 12 }} tickFormatter={(value) => `$${value.toLocaleString()}`} />
        <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px", color: "#fff" }} itemStyle={{ color: "#fff", fontWeight: 500 }} cursor={{ stroke: "#27272a", strokeWidth: 1, strokeDasharray: "4 4" }} />
        <Area type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#mainGradient)" />
      </AreaChart>
    </ResponsiveContainer>;
}
function MarketIntelligence() {
  const [activeAsset, setActiveAsset] = useState("S&P 500");
  const [activeTimeframe, setActiveTimeframe] = useState("1D");
  const getActiveData = () => {
    switch (activeAsset) {
      case "NASDAQ":
        return nasdaqData;
      case "Bitcoin":
        return btcData;
      case "S&P 500":
      default:
        return sp500Data;
    }
  };
  const getActivePrice = () => {
    const data = getActiveData();
    return data[data.length - 1].price;
  };
  const getActiveChange = () => {
    switch (activeAsset) {
      case "NASDAQ":
        return "+0.85%";
      case "Bitcoin":
        return "+1.20%";
      case "S&P 500":
      default:
        return "+0.52%";
    }
  };
  return <div className="max-w-[1000px] mx-auto flex flex-col h-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-[40px] font-semibold text-white tracking-[-0.02em] mb-2 leading-none">Market Intelligence</h1>
          <p className="text-[#a1a1aa] text-[16px]">Real-time market trends and indices.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
    onClick={() => setActiveAsset("S&P 500")}
    className={`bg-[#18181b] border ${activeAsset === "S&P 500" ? "border-[#3b82f6]" : "border-[#27272a] hover:border-[#3f3f46]"} rounded-2xl p-6 text-left transition-colors`}
  >
          <div className="flex justify-between items-start mb-2">
            <span className="text-white font-medium">S&P 500</span>
            <div className="flex items-center text-[#22c55e] text-sm font-medium">
              <ArrowUpRight className="w-4 h-4 mr-0.5" /> 0.52%
            </div>
          </div>
          <div className="text-[28px] font-semibold text-white tracking-tight">5,438.50</div>
          <MiniChart data={sp500Data} color="#22c55e" />
        </button>

        <button
    onClick={() => setActiveAsset("NASDAQ")}
    className={`bg-[#18181b] border ${activeAsset === "NASDAQ" ? "border-[#3b82f6]" : "border-[#27272a] hover:border-[#3f3f46]"} rounded-2xl p-6 text-left transition-colors`}
  >
          <div className="flex justify-between items-start mb-2">
            <span className="text-white font-medium">NASDAQ</span>
            <div className="flex items-center text-[#22c55e] text-sm font-medium">
              <ArrowUpRight className="w-4 h-4 mr-0.5" /> 0.85%
            </div>
          </div>
          <div className="text-[28px] font-semibold text-white tracking-tight">17,970.20</div>
          <MiniChart data={nasdaqData} color="#22c55e" />
        </button>

        <button
    onClick={() => setActiveAsset("Bitcoin")}
    className={`bg-[#18181b] border ${activeAsset === "Bitcoin" ? "border-[#3b82f6]" : "border-[#27272a] hover:border-[#3f3f46]"} rounded-2xl p-6 text-left transition-colors`}
  >
          <div className="flex justify-between items-start mb-2">
            <span className="text-white font-medium">Bitcoin</span>
            <div className="flex items-center text-[#22c55e] text-sm font-medium">
              <ArrowUpRight className="w-4 h-4 mr-0.5" /> 1.20%
            </div>
          </div>
          <div className="text-[28px] font-semibold text-white tracking-tight">$65,920</div>
          <MiniChart data={btcData} color="#22c55e" />
        </button>
      </div>

      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 flex-1 min-h-[400px]">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-[#3b82f6]" />
            </div>
            <div>
              <h3 className="text-white font-medium text-[20px]">{activeAsset}</h3>
              <div className="flex items-center gap-2">
                <span className="text-[16px] text-white font-medium">${getActivePrice().toLocaleString(void 0, { minimumFractionDigits: activeAsset === "Bitcoin" ? 0 : 2 })}</span>
                <span className="text-[#22c55e] text-sm font-medium">{getActiveChange()} Today</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 bg-[#09090b] p-1 rounded-lg border border-[#27272a]">
            {["1D", "1W", "1M", "3M", "1Y", "ALL"].map((tf) => <button key={tf} onClick={() => setActiveTimeframe(tf)} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${activeTimeframe === tf ? "bg-[#27272a] text-white" : "text-[#71717a] hover:text-white"}`}>
                {tf}
              </button>)}
          </div>
        </div>
        <div className="h-[300px] w-full">
          <MainChart data={getActiveData()} />
        </div>
      </div>
    </div>;
}
export {
  MarketIntelligence
};
