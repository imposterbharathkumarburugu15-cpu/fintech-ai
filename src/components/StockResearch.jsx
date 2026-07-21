import { useState } from "react";
import { Search, TrendingUp, TrendingDown, Sparkles, BarChart2, ArrowUpRight, ArrowDownRight, Globe, ShieldAlert, Users } from "lucide-react";

// ─── Stock Database ─────────────────────────────────────────────
const STOCKS = {
  AAPL: {
    name: "Apple Inc.", ticker: "AAPL", exchange: "NASDAQ", sector: "Technology", industry: "Consumer Electronics",
    price: "$214.32", change: "+1.24%", positive: true,
    marketCap: "$3.28T", pe: "32.4", divYield: "0.46%", eps: "$6.62", beta: "1.21",
    revenue: "$391.2B", week52: "$164.08 – $220.20",
    summary: "Apple designs, manufactures, and markets consumer electronics, software, and online services. With over 2 billion active devices worldwide, Apple's ecosystem generates massive recurring revenue through its Services segment — App Store, Apple Music, iCloud, and Apple TV+. The company is aggressively integrating Apple Intelligence across its product line.",
    bull: ["Services revenue growing 14% YoY, expanding high-margin revenue base", "2+ billion active devices driving reliable hardware upgrade cycles", "AI integration (Apple Intelligence) could accelerate iPhone 16 upgrades", "Strong balance sheet with $162B in cash for buybacks and dividends"],
    bear: ["Global regulatory pressure on App Store commissions (EU Digital Markets Act)", "iPhone saturation in mature markets limiting unit growth", "Premium valuation at 32x P/E with modest growth expectations", "Dependence on China manufacturing amid geopolitical tensions"],
    swot: {
      strengths: ["Dominant brand loyalty", "Integrated hardware-software ecosystem", "Record services revenue"],
      weaknesses: ["iPhone revenue concentration risk", "Limited AI differentiation vs competitors", "High product prices exclude emerging markets"],
      opportunities: ["India market expansion", "Vision Pro spatial computing", "Healthcare & fintech entry points"],
      threats: ["Antitrust regulation globally", "Huawei comeback in China", "Slowing consumer spending"],
    },
    competitors: [
      { name: "Samsung", ticker: "005930.KS", price: "₩78,200", pe: "15.2", mktCap: "$450B" },
      { name: "Microsoft", ticker: "MSFT", price: "$420.10", pe: "35.1", mktCap: "$3.12T" },
      { name: "Google", ticker: "GOOGL", price: "$185.40", pe: "24.5", mktCap: "$2.28T" },
    ],
    news: [
      { headline: "Apple unveils Apple Intelligence features at WWDC 2026", time: "2 hours ago" },
      { headline: "EU fines Apple €1.8B over App Store anti-competitive practices", time: "1 day ago" },
      { headline: "Apple Vision Pro 2 reportedly entering production", time: "3 days ago" },
    ],
  },
  NVDA: {
    name: "NVIDIA Corp.", ticker: "NVDA", exchange: "NASDAQ", sector: "Technology", industry: "Semiconductors",
    price: "$875.40", change: "+2.34%", positive: true,
    marketCap: "$2.16T", pe: "68.2", divYield: "0.03%", eps: "$12.84", beta: "1.72",
    revenue: "$60.9B", week52: "$262.19 – $974.00",
    summary: "NVIDIA is the world's leading GPU manufacturer and the backbone of the global AI infrastructure buildout. Its H100 and H200 GPUs power virtually all large-scale AI training — from OpenAI's GPT to Google's Gemini. Data center revenue has exploded from $15B (FY2023) to over $47B (FY2024), reflecting insatiable AI demand.",
    bull: ["AI compute demand growing exponentially — NVIDIA holds 80%+ GPU market share", "Blackwell architecture launching — next-gen GPUs with 2.5x performance leap", "CUDA software moat makes switching costs extremely high for AI developers", "Expanding into automotive AI, healthcare, and robotics"],
    bear: ["Extreme valuation at 68x earnings requires flawless execution", "AMD and Intel aggressively competing in AI chips", "China export restrictions cutting off major growth market", "Cyclical semiconductor risk if AI investment cycle slows"],
    swot: {
      strengths: ["Dominant AI chip market share", "CUDA developer ecosystem lock-in", "Visionary leadership under Jensen Huang"],
      weaknesses: ["Single-product dependency (GPU)", "Highly cyclical semiconductor industry", "Very high valuation"],
      opportunities: ["Sovereign AI data center buildouts globally", "Automotive autonomous driving chips", "AI in healthcare diagnostics"],
      threats: ["US-China export controls", "Custom silicon from Big Tech (TPU, Trainium)", "AMD CDNA competitive pressure"],
    },
    competitors: [
      { name: "AMD", ticker: "AMD", price: "$148.20", pe: "45.6", mktCap: "$240B" },
      { name: "Intel", ticker: "INTC", price: "$28.40", pe: "N/A", mktCap: "$120B" },
      { name: "Broadcom", ticker: "AVGO", price: "$1,680", pe: "38.2", mktCap: "$780B" },
    ],
    news: [
      { headline: "NVIDIA reports Q1 FY2027 earnings — revenue beats estimates by 12%", time: "3 hours ago" },
      { headline: "Jensen Huang hints at Blackwell Ultra launch timeline at GTC", time: "2 days ago" },
      { headline: "NVIDIA stock added to Dow Jones Industrial Average", time: "5 days ago" },
    ],
  },
  TSLA: {
    name: "Tesla Inc.", ticker: "TSLA", exchange: "NASDAQ", sector: "Consumer Discretionary", industry: "Electric Vehicles",
    price: "$248.10", change: "+3.10%", positive: true,
    marketCap: "$789B", pe: "62.8", divYield: "—", eps: "$3.95", beta: "2.30",
    revenue: "$97.7B", week52: "$138.80 – $271.00",
    summary: "Tesla is the global EV leader with a vertically integrated model — manufacturing, software, energy, and autonomous driving all under one roof. FSD (Full Self-Driving) and the Optimus humanoid robot represent Elon Musk's vision for Tesla as an AI and robotics company, not just a car company.",
    bull: ["FSD monetization potential could add $10K+ revenue per vehicle over lifetime", "Cybercab robotaxi launch could transform revenue model", "Energy storage (Megapack) growing rapidly as grid-scale battery demand surges", "Optimus robot could be a multi-trillion dollar opportunity"],
    bear: ["EV market slowing as competition from China (BYD) intensifies globally", "Price wars compressing already thin margins", "Elon Musk distraction risk (X, SpaceX, DOGE)", "Robotaxi regulatory approval timeline highly uncertain"],
    swot: {
      strengths: ["Supercharger network moat", "FSD technology lead", "Vertical integration reducing costs"],
      weaknesses: ["Musk key-man dependency risk", "Declining market share in China", "High valuation relative to auto peers"],
      opportunities: ["Robotaxi network launch", "Energy storage expansion", "Emerging market EV growth"],
      threats: ["BYD price competition in China & globally", "Legacy OEM EV catch-up", "Regulatory delays on autonomous driving"],
    },
    competitors: [
      { name: "BYD", ticker: "1211.HK", price: "HK$238", pe: "18.4", mktCap: "$85B" },
      { name: "Rivian", ticker: "RIVN", price: "$14.20", pe: "N/A", mktCap: "$13B" },
      { name: "Lucid", ticker: "LCID", price: "$2.84", pe: "N/A", mktCap: "$7B" },
    ],
    news: [
      { headline: "Tesla Model Y refresh deliveries begin in North America", time: "1 day ago" },
      { headline: "Elon Musk confirms Cybercab production start date at Austin Gigafactory", time: "3 days ago" },
      { headline: "Tesla Energy posts record Megapack deployments in Q1 2026", time: "4 days ago" },
    ],
  },
  RELIANCE: {
    name: "Reliance Industries", ticker: "RELIANCE", exchange: "NSE / BSE", sector: "Conglomerate", industry: "Oil, Telecom, Retail",
    price: "₹2,890", change: "+0.78%", positive: true,
    marketCap: "₹19.6L Cr", pe: "28.4", divYield: "0.38%", eps: "₹101.8", beta: "0.82",
    revenue: "₹10.1L Cr", week52: "₹2,220 – ₹3,217",
    summary: "Reliance Industries is India's largest company by market cap and revenue. Under Mukesh Ambani, it transformed from a petrochemicals conglomerate into a digital-first tech and retail empire. Jio disrupted Indian telecom with 500M+ subscribers, while JioMart and Reliance Retail are reshaping India's $800B retail market. The company is now investing heavily in green energy (solar, hydrogen) and AI.",
    bull: ["Jio subscriber growth and ARPU (average revenue per user) expansion ahead", "Reliance Retail targeting $100B revenue — fastest growing retail chain in Asia", "New Energy business (solar, hydrogen) positions for India's $500B green transition", "5G monetization in India still in early innings"],
    bear: ["High capital expenditure requirements reducing free cash flow", "Telecom regulatory risk from TRAI pricing interventions", "Oil refining margins under pressure from energy transition", "Family succession dynamics could affect strategic clarity"],
    swot: {
      strengths: ["Unmatched conglomerate scale in India", "Jio's 500M subscriber base", "Political relationships and regulatory access"],
      weaknesses: ["Complex corporate structure reduces transparency", "Heavy debt from 5G and retail expansion", "Refinery segment carbon transition risk"],
      opportunities: ["India's consumer market growing at 7% GDP", "Digital financial services (JioPay, JioInsure)", "Green energy becoming core business"],
      threats: ["Adani Group competition in infrastructure", "Foreign tech giants entering Indian market", "Global oil price volatility"],
    },
    competitors: [
      { name: "TCS", ticker: "TCS.NS", price: "₹3,920", pe: "30.2", mktCap: "₹14.2L Cr" },
      { name: "HDFC Bank", ticker: "HDFCBANK.NS", price: "₹1,780", pe: "18.4", mktCap: "₹13.5L Cr" },
      { name: "Bharti Airtel", ticker: "BHARTIARTL.NS", price: "₹1,620", pe: "52.8", mktCap: "₹9.6L Cr" },
    ],
    news: [
      { headline: "Reliance Jio announces 5G coverage in 1000 Indian cities", time: "1 day ago" },
      { headline: "RIL Q4 results: Net profit up 7% YoY on strong retail and digital performance", time: "2 days ago" },
      { headline: "Mukesh Ambani unveils $10B green energy investment roadmap", time: "1 week ago" },
    ],
  },
  MSFT: {
    name: "Microsoft Corp.", ticker: "MSFT", exchange: "NASDAQ", sector: "Technology", industry: "Cloud & Software",
    price: "$420.10", change: "+0.89%", positive: true,
    marketCap: "$3.12T", pe: "35.1", divYield: "0.72%", eps: "$11.96", beta: "0.90",
    revenue: "$245.1B", week52: "$304.50 – $468.35",
    summary: "Microsoft is a cloud and AI powerhouse. Azure (cloud infrastructure) and Copilot (AI assistant integration across Office 365, Teams, and Windows) form the dual engines of growth. The $69B Activision acquisition adds gaming revenues. Microsoft's partnership with OpenAI gives it exclusive commercial rights to GPT technology, embedding AI across every enterprise product.",
    bull: ["Azure growing 28% YoY — second largest cloud behind AWS, gap narrowing", "Copilot AI adoption across 1B+ Office users at $30/user/month premium", "OpenAI partnership provides structural AI advantage vs competitors", "Gaming segment ($25B/yr post-Activision) adding diversification"],
    bear: ["Premium valuation at 35x P/E limits upside if growth decelerates", "Antitrust scrutiny over OpenAI partnership and gaming consolidation", "Azure market share gains slowing vs Google Cloud acceleration", "Enterprise sales cycles slowing in high-interest-rate environment"],
    swot: {
      strengths: ["Enterprise software distribution moat", "Azure AI infrastructure advantage", "OpenAI exclusive commercial partnership"],
      weaknesses: ["Slower consumer brand vs Apple/Google", "Teams losing to Slack/Zoom in some segments", "Windows PC market saturation"],
      opportunities: ["AI Copilot monetization across 300M+ commercial users", "Security cloud expansion (Microsoft Defender)", "Healthcare AI solutions"],
      threats: ["Google Workspace competitive pressure", "OpenAI independence risk", "EU antitrust investigations"],
    },
    competitors: [
      { name: "Apple", ticker: "AAPL", price: "$214.32", pe: "32.4", mktCap: "$3.28T" },
      { name: "Google", ticker: "GOOGL", price: "$185.40", pe: "24.5", mktCap: "$2.28T" },
      { name: "Amazon", ticker: "AMZN", price: "$198.90", pe: "42.1", mktCap: "$2.10T" },
    ],
    news: [
      { headline: "Microsoft Copilot reaches 50M daily active users in enterprise", time: "6 hours ago" },
      { headline: "Azure AI services revenue doubles year-over-year in Q3", time: "2 days ago" },
      { headline: "Microsoft announces next-gen Copilot+ PCs with neural processing units", time: "4 days ago" },
    ],
  },
};

const QUICK_SEARCHES = ["AAPL", "NVDA", "TSLA", "MSFT", "RELIANCE"];

function MetricRow({ label, value, last = false }) {
  return (
    <div className={`flex justify-between items-center py-3 ${!last ? "border-b border-[#27272a]" : ""}`}>
      <span className="text-[#71717a] text-[13px]">{label}</span>
      <span className="text-white font-semibold text-[13px] font-mono">{value}</span>
    </div>
  );
}

function NseStat({ label, value, color }) {
  return <div className="border-r border-[#e4e6eb] px-3 last:border-0"><p className="flex items-center gap-2 text-[11px] text-[#737887]"><span className="h-2.5 w-2.5 rounded-full" style={{ background: color }}/>{label}</p><p className="mt-1 font-semibold" style={{ color: label === "Change" ? color : "#1f2430" }}>{value}</p></div>;
}

function NseLikeChart({ positive }) {
  const green = "#0c8a24";
  const red = "#c93b43";
  const color = positive ? green : red;
  const line = positive
    ? "M15 190 L32 188 L43 148 L58 137 L72 121 L86 131 L104 106 L122 115 L140 95 L157 112 L174 90 L190 100 L208 78 L227 102 L244 92 L264 73 L281 86 L298 70 L317 92 L336 74 L354 84 L373 61 L391 78 L410 56 L428 75 L445 43 L463 62 L480 41 L499 56 L516 29 L535 48 L552 35 L570 50 L589 25 L607 42 L625 20"
    : "M15 57 L32 61 L43 83 L58 72 L72 102 L86 91 L104 120 L122 110 L140 135 L157 119 L174 148 L190 132 L208 158 L227 147 L244 174 L264 154 L281 181 L298 166 L317 191 L336 175 L354 197 L373 183 L391 205 L410 191 L428 211 L445 198 L463 219 L480 205 L499 228 L516 213 L535 233 L552 220 L570 239 L589 226 L607 245 L625 230";
  return <div className="mt-4 h-60 w-full"><svg className="h-full w-full" viewBox="0 0 640 250" preserveAspectRatio="none"><defs><linearGradient id="nseStockFill" x1="0" x2="0" y1="0" y2="1"><stop stopColor={positive ? "#61c6e7" : "#ed8c93"} stopOpacity=".78"/><stop offset="1" stopColor={positive ? "#dff7fc" : "#ffe4e6"} stopOpacity=".4"/></linearGradient></defs>{[35,75,115,155,195,235].map(y => <path key={y} d={`M15 ${y} H625`} stroke="#e6e9ee"/>)}<path d={`${line} L625 235 L15 235 Z`} fill="url(#nseStockFill)"/><path d={line} fill="none" stroke={color} strokeWidth="3" vectorEffect="non-scaling-stroke"/><path d="M15 235 H625" stroke="#252a33" strokeWidth="1.3"/></svg><div className="mt-1 flex justify-between text-[10px] text-[#737887]"><span>09:15</span><span>10:30</span><span>12:00</span><span>13:30</span><span>15:30</span></div></div>;
}

function StockResearch() {
  const [query, setQuery] = useState(() => {
    const selectedFromMarket = window.sessionStorage.getItem("finpilot-selected-stock");
    return STOCKS[selectedFromMarket] ? selectedFromMarket : "RELIANCE";
  });
  const [inputVal, setInputVal] = useState("");

  const stock = STOCKS[query.toUpperCase()] || STOCKS["AAPL"];

  const handleSearch = (e) => {
    e.preventDefault();
    const key = inputVal.toUpperCase().trim();
    if (STOCKS[key]) { setQuery(key); setInputVal(""); }
  };

  return (
    <div className="max-w-[1080px] mx-auto flex flex-col h-full">

      {/* Header */}
      <div className="flex justify-between items-end mb-6 animate-fade-in-up">
        <div>
          <p className="text-[#3b82f6] text-[11px] font-bold tracking-[0.12em] mb-2 uppercase">Research</p>
          <h1 className="text-[38px] font-semibold text-white tracking-[-0.025em] mb-2 leading-none">Stock Research Hub</h1>
          <p className="text-[#71717a] text-[15px]">AI-powered company analysis — US & Indian markets.</p>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-[#71717a]">
          <Globe className="w-4 h-4" />
          <span>NYSE · NASDAQ · NSE · BSE</span>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-2 animate-fade-in-up stagger-1">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Search — AAPL, NVDA, TSLA, MSFT, RELIANCE..."
            className="w-full bg-[#18181b] border border-[#27272a] rounded-xl pl-11 pr-32 py-3.5 text-[14px] text-white placeholder:text-[#52525b] focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] text-white text-[13px] font-semibold transition-all">
            Search
          </button>
        </div>
      </form>

      {/* Quick switches */}
      <div className="flex gap-2 mb-6 animate-fade-in-up stagger-1">
        {QUICK_SEARCHES.map((sym) => (
          <button
            key={sym}
            onClick={() => setQuery(sym)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${
              query === sym
                ? "bg-[#3b82f6]/10 border-[#3b82f6]/40 text-[#60a5fa]"
                : "bg-[#18181b] border-[#27272a] text-[#71717a] hover:text-white hover:border-[#3f3f46]"
            }`}
          >
            {sym}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in-up stagger-2">

        {/* Main Panel */}
        <div className="lg:col-span-2 space-y-4">

          {/* NSE-style live market chart — opened when a Market Intelligence stock is selected */}
          <div className="rounded-2xl border border-[#dadde5] bg-[#fbfcfe] p-5 text-[#161827] shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e7e9ef] pb-4">
              <div><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#138b32]"/><b className="text-base">{stock.ticker} • NSE market view</b><span className="rounded bg-[#eaf8ee] px-2 py-0.5 text-[9px] font-bold text-[#168542]">LIVE</span></div><p className="mt-1 text-xs text-[#707585]">Open, high, low and intraday price action</p></div>
              <div className="flex rounded-lg bg-[#eeecf8] p-1">{["1D", "1M", "3M", "6M", "1Y"].map((range, index) => <button key={range} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${index === 0 ? "bg-[#49368c] text-white" : "text-[#5e5970]"}`}>{range}</button>)}</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-y-3 text-sm sm:grid-cols-4"><NseStat label="Open" value={stock.price} color="#49368c"/><NseStat label="High" value={stock.price} color="#138b32"/><NseStat label="Low" value={stock.price} color="#ca3b43"/><NseStat label="Change" value={stock.change} color={stock.positive ? "#098a28" : "#c73737"}/></div>
            <NseLikeChart positive={stock.positive}/>
          </div>

          {/* Company Header */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6">
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3b82f6]/20 to-[#8b5cf6]/20 border border-[#3b82f6]/20 flex items-center justify-center text-xl font-black text-white">
                  {stock.ticker.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white leading-tight">{stock.name}</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="badge badge-blue">{stock.exchange}</span>
                    <span className="text-[12px] text-[#71717a]">{stock.sector}</span>
                    <span className="text-[#27272a]">·</span>
                    <span className="text-[12px] text-[#71717a]">{stock.industry}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{stock.price}</div>
                <div className={`flex items-center justify-end gap-1 mt-1 text-[13px] font-semibold ${stock.positive ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                  {stock.positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {stock.change} Today
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <div className="bg-[#0f0f11] rounded-xl p-4 border border-[#27272a]">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
                <span className="text-[12px] font-semibold text-[#8b5cf6] uppercase tracking-wider">AI Company Summary</span>
              </div>
              <p className="text-[13px] text-[#a1a1aa] leading-relaxed">{stock.summary}</p>
            </div>
          </div>

          {/* Bull / Bear */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 alert-success">
              <h4 className="text-[#22c55e] font-semibold mb-3 flex items-center gap-2 text-[14px]">
                <TrendingUp className="w-4 h-4" /> Bull Case
              </h4>
              <ul className="space-y-2">
                {stock.bull.map((pt, i) => (
                  <li key={i} className="flex gap-2 text-[13px] text-[#a1a1aa] leading-relaxed">
                    <span className="w-1 h-1 rounded-full bg-[#22c55e] shrink-0 mt-2" />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 alert-urgent">
              <h4 className="text-[#ef4444] font-semibold mb-3 flex items-center gap-2 text-[14px]">
                <TrendingDown className="w-4 h-4" /> Bear Case
              </h4>
              <ul className="space-y-2">
                {stock.bear.map((pt, i) => (
                  <li key={i} className="flex gap-2 text-[13px] text-[#a1a1aa] leading-relaxed">
                    <span className="w-1 h-1 rounded-full bg-[#ef4444] shrink-0 mt-2" />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* SWOT */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-4 h-4 text-[#f59e0b]" />
              <h3 className="text-white font-semibold text-[14px]">SWOT Analysis</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Strengths", items: stock.swot.strengths, color: "#22c55e", bg: "rgba(34,197,94,0.06)" },
                { label: "Weaknesses", items: stock.swot.weaknesses, color: "#ef4444", bg: "rgba(239,68,68,0.06)" },
                { label: "Opportunities", items: stock.swot.opportunities, color: "#3b82f6", bg: "rgba(59,130,246,0.06)" },
                { label: "Threats", items: stock.swot.threats, color: "#f59e0b", bg: "rgba(245,158,11,0.06)" },
              ].map(({ label, items, color, bg }) => (
                <div key={label} className="rounded-xl p-3 border border-[#27272a]" style={{ background: bg }}>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color }}>{label}</p>
                  <ul className="space-y-1.5">
                    {items.map((item, i) => (
                      <li key={i} className="text-[12px] text-[#a1a1aa] flex gap-1.5">
                        <span className="w-1 h-1 rounded-full shrink-0 mt-1.5" style={{ background: color }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Competitor Comparison */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-[#3b82f6]" />
              <h3 className="text-white font-semibold text-[14px]">Competitor Comparison</h3>
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#27272a]">
                  <th className="text-left text-[11px] text-[#52525b] font-semibold uppercase tracking-wider pb-2">Company</th>
                  <th className="text-right text-[11px] text-[#52525b] font-semibold uppercase tracking-wider pb-2">Price</th>
                  <th className="text-right text-[11px] text-[#52525b] font-semibold uppercase tracking-wider pb-2">P/E</th>
                  <th className="text-right text-[11px] text-[#52525b] font-semibold uppercase tracking-wider pb-2">Mkt Cap</th>
                </tr>
              </thead>
              <tbody>
                {/* Current stock highlighted */}
                <tr className="border-b border-[#27272a] bg-[#3b82f6]/5">
                  <td className="py-3 font-semibold text-white">{stock.ticker} <span className="text-[10px] text-[#3b82f6] ml-1 font-normal">(selected)</span></td>
                  <td className="py-3 text-right text-white font-mono">{stock.price}</td>
                  <td className="py-3 text-right text-white font-mono">{stock.pe}x</td>
                  <td className="py-3 text-right text-white font-mono">{stock.marketCap}</td>
                </tr>
                {stock.competitors.map((c) => (
                  <tr key={c.ticker} className="border-b border-[#27272a] last:border-0 hover:bg-[#1a1a1d] transition-colors">
                    <td className="py-3 text-[#a1a1aa]">{c.name} <span className="text-[#52525b] text-[11px]">{c.ticker}</span></td>
                    <td className="py-3 text-right text-[#a1a1aa] font-mono">{c.price}</td>
                    <td className="py-3 text-right text-[#a1a1aa] font-mono">{c.pe}x</td>
                    <td className="py-3 text-right text-[#a1a1aa] font-mono">{c.mktCap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Panel */}
        <div className="space-y-4">
          {/* Financial Metrics */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="w-4 h-4 text-[#71717a]" />
              <h3 className="text-white font-semibold text-[14px]">Financial Metrics</h3>
            </div>
            <div>
              <MetricRow label="Market Cap" value={stock.marketCap} />
              <MetricRow label="P/E Ratio" value={`${stock.pe}x`} />
              <MetricRow label="EPS (TTM)" value={stock.eps} />
              <MetricRow label="Revenue" value={stock.revenue} />
              <MetricRow label="Div Yield" value={stock.divYield} />
              <MetricRow label="Beta" value={stock.beta} />
              <MetricRow label="52W Range" value={stock.week52} last />
            </div>
          </div>

          {/* Latest News */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5">
            <h3 className="text-white font-semibold text-[14px] mb-3">Latest News</h3>
            <div className="space-y-3">
              {stock.news.map((n, i) => (
                <div key={i} className="flex gap-3 pb-3 border-b border-[#27272a] last:border-0 last:pb-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] shrink-0 mt-1.5" />
                  <div>
                    <p className="text-[13px] text-[#e4e4e7] leading-snug">{n.headline}</p>
                    <p className="text-[11px] text-[#52525b] mt-1">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Rating */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5">
            <h3 className="text-white font-semibold text-[14px] mb-3">Risk Profile</h3>
            {[
              { label: "Volatility", value: parseFloat(stock.beta) > 1.5 ? 80 : parseFloat(stock.beta) > 1.0 ? 55 : 35, color: "#f59e0b" },
              { label: "Valuation Risk", value: parseFloat(stock.pe) > 50 ? 80 : parseFloat(stock.pe) > 30 ? 55 : 35, color: "#ef4444" },
              { label: "Growth Score", value: parseFloat(stock.beta) > 1.5 ? 85 : 68, color: "#22c55e" },
            ].map(({ label, value, color }) => (
              <div key={label} className="mb-3 last:mb-0">
                <div className="flex justify-between mb-1">
                  <span className="text-[12px] text-[#71717a]">{label}</span>
                  <span className="text-[12px] font-semibold" style={{ color }}>{value}/100</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${value}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export { StockResearch };
