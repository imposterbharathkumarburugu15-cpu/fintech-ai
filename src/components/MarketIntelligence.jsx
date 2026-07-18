import { useCallback, useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import {
  ArrowRight,
  CircleHelp,
  Expand,
  Info,
  Rocket,
  Search,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_API_KEY;

const WATCHLIST = [
  { symbol: "AAPL", name: "Apple" }, { symbol: "MSFT", name: "Microsoft" },
  { symbol: "NVDA", name: "NVIDIA" }, { symbol: "AMZN", name: "Amazon" },
  { symbol: "GOOGL", name: "Alphabet" }, { symbol: "TSLA", name: "Tesla" },
];

const ticker = [
  ["NIFTY 50", "22,302.50", "+1.05%"], ["SENSEX", "73,664.81", "+1.10%"],
  ["S&P 500", "5,307.01", "+0.46%"], ["NASDAQ", "16,742.39", "+0.65%"],
  ["DOW JONES", "39,869.38", "+0.35%"], ["BITCOIN", "$66,525.00", "+1.45%"],
  ["GOLD (MCX)", "₹72,150", "+0.35%"],
];

const chartData = [21820, 21860, 21945, 21920, 22015, 21935, 22010, 22035, 22020, 22065, 22120, 22170, 22155, 22210, 22235, 22280, 22215, 22190, 22230, 22185, 22225].map((value, index) => ({ value, time: ["09:15", "", "10:00", "", "11:00", "", "", "12:00", "", "", "13:00", "", "", "14:00", "", "", "15:30"][index] || "" }));
const breadthData = [32, 44, 49, 43, 52, 51, 55, 56, 54, 58, 57, 62, 58, 61, 55, 59].map((value, index) => ({ value, time: ["09:15", "", "11:00", "", "13:00", "", "15:30"][index] || "" }));
const breadth = [{ name: "Advances", value: 1832, color: "#28d878" }, { name: "Declines", value: 1286, color: "#f44e5c" }, { name: "Unchanged", value: 210, color: "#8291ae" }];

const movers = {
  gainers: [["WIPRO", "₹484.35", "+15.45", "+3.29%"], ["TECH MAHINDRA", "₹1,486.10", "+42.30", "+2.93%"], ["HCL TECH", "₹1,423.55", "+38.55", "+2.79%"], ["TATA MOTORS", "₹958.30", "+24.15", "+2.59%"], ["LT", "₹3,562.25", "+86.45", "+2.49%"]],
  losers: [["ADANI PORTS", "₹1,387.45", "-51.85", "-3.62%"], ["JSW STEEL", "₹892.20", "-28.30", "-3.08%"], ["TATA STEEL", "₹152.45", "-4.23", "-2.71%"], ["NTPC", "₹321.65", "-5.89", "-1.80%"], ["POWER GRID", "₹287.30", "-4.65", "-1.59%"]],
  active: [["RELIANCE", "₹2,915.40", "1.25 Cr", "+1.25%"], ["TCS", "₹3,987.15", "85.20 L", "+0.85%"], ["HDFCBANK", "₹1,672.30", "71.15 L", "-0.35%"], ["INFY", "₹1,455.80", "68.40 L", "+0.65%"], ["ICICIBANK", "₹1,098.60", "55.30 L", "-0.15%"]],
};
const sectors = [["IT", "+2.35"], ["BANKING", "+1.45"], ["PHARMA", "+0.92"], ["AUTO", "+0.74"], ["FMCG", "+0.58"], ["ENERGY", "+0.33"], ["METAL", "-0.15"], ["REALTY", "-0.32"], ["MEDIA", "-0.45"], ["TELECOM", "-0.62"], ["PSU BANK", "-0.75"], ["INFRA", "-0.18"]];
const fallbackNews = ["RBI keeps repo rate unchanged at 6.50%", "IT stocks lead rally as global tech outlook improves", "FII inflows continue for fifth consecutive session", "Gold prices rise ahead of US inflation data", "US markets rally as inflation cools more than expected"];
const fallbackNewsLinks = [
  [fallbackNews[0], "https://www.rbi.org.in/"], [fallbackNews[1], "https://www.moneycontrol.com/news/business/markets/"],
  [fallbackNews[2], "https://www.nseindia.com/"], [fallbackNews[3], "https://www.reuters.com/markets/commodities/"],
  [fallbackNews[4], "https://www.reuters.com/markets/"],
];
const indexOptions = {
  "NIFTY 50": ["22,302.50", "+234.50 (1.05%)", chartData],
  "SENSEX": ["73,664.81", "+798.10 (1.10%)", chartData.map((point, index) => ({ ...point, value: point.value * 3.3 + (index % 3) * 90 }))],
  "BANK NIFTY": ["48,122.35", "+418.20 (0.88%)", chartData.map((point, index) => ({ ...point, value: point.value * 2.17 - (index % 5) * 70 }))],
  "NIFTY IT": ["36,452.70", "+720.55 (2.02%)", chartData.map((point, index) => ({ ...point, value: point.value * 1.63 + (index % 4) * 45 }))],
};

export function MarketIntelligence() {
  const [quotes, setQuotes] = useState([]);
  const [news, setNews] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState("NIFTY 50");
  const [timeframe, setTimeframe] = useState("1D");
  const [customizing, setCustomizing] = useState(false);
  const [expanded, setExpanded] = useState("");

  const loadMarketData = useCallback(async () => {
    if (!FINNHUB_KEY) return;
    try {
      const [quoteData, newsData] = await Promise.all([
        Promise.all(WATCHLIST.map(async (stock) => {
          const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${FINNHUB_KEY}`);
          if (!response.ok) throw new Error("Live market data is temporarily unavailable.");
          return { ...stock, ...(await response.json()) };
        })),
        fetch(`https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_KEY}`).then(response => response.ok ? response.json() : []),
      ]);
      setQuotes(quoteData.filter(item => item.c > 0));
      setNews(Array.isArray(newsData) ? newsData.slice(0, 5) : []);
      setError("");
    } catch (requestError) { setError(requestError.message); }
  }, []);

  useEffect(() => { loadMarketData(); const timer = window.setInterval(loadMarketData, 60_000); return () => window.clearInterval(timer); }, [loadMarketData]);
  const searchResults = useMemo(() => quotes.filter(item => `${item.name} ${item.symbol}`.toLowerCase().includes(query.toLowerCase())), [quotes, query]);

  return <div className="min-h-full bg-[#030609] text-[#eef2ff]">
    <div className="border-y border-[#17202d] bg-[#080d14]/95 px-5 py-6 lg:px-7">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
        <label className="relative block xl:w-[385px]"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#91a0b9]" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search indices, stocks, sectors, assets..." className="h-12 w-full rounded-xl border border-[#334155] bg-[#090e15] pl-11 pr-4 text-sm outline-none placeholder:text-[#8b97ac] focus:border-violet-400" /></label>
        <div className="flex items-center gap-2 text-xs text-[#9ba7ba]"><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#22c55e]" /><div><b className="block text-sm font-medium text-[#dbe6f7]">Market Open</b><span>17 May 2025 11:21 AM IST</span></div></div>
        <div className="grid flex-1 grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-4 xl:grid-cols-7 xl:divide-x xl:divide-[#273244] xl:gap-0">{ticker.map(([name, price, change]) => <TickerItem key={name} name={name} price={price} change={change} />)}</div>
        <button onClick={() => setCustomizing(true)} className="rounded-lg border border-violet-500/70 px-5 py-2.5 text-xs font-semibold text-violet-300 hover:bg-violet-500/10">Customize</button>
      </div>
    </div>

    <main className="p-5 lg:p-7">
      <h1 className="text-2xl font-semibold tracking-tight">Market Analysis</h1><p className="mt-1 text-sm text-[#a0aabd]">Real-time market overview & performance</p>
      {error && <p className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-200">{error}</p>}
      {query && <SearchResult items={searchResults} />}

      <section className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-12">
        <SentimentCard onView={() => setExpanded("Market Sentiment")} />
        <IndexChart selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex} timeframe={timeframe} setTimeframe={setTimeframe} />
        <AdvanceDecline />
        <BreadthChart />
      </section>
      <section className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        <MoverCard title="Top Gainers" icon={<Rocket />} rows={movers.gainers} type="gainers" onView={() => setExpanded("Top Gainers")} />
        <MoverCard title="Top Losers" icon={<TrendingDown />} rows={movers.losers} type="losers" onView={() => setExpanded("Top Losers")} />
        <MoverCard title="Most Active" icon={<Sparkles />} rows={movers.active} type="active" onView={() => setExpanded("Most Active")} />
        <SectorCard onView={() => setExpanded("Sector Performance")} />
        <NewsCard items={news.length ? news : fallbackNewsLinks} onView={() => setExpanded("Market News")} />
      </section>
    </main>
    {customizing && <CustomizeModal onClose={() => setCustomizing(false)} />}
    {expanded && <DetailModal title={expanded} onClose={() => setExpanded("")} />}
  </div>;
}

function TickerItem({ name, price, change }) { return <div className="min-w-0 px-3 xl:first:pl-0"><p className="text-[10px] font-semibold text-[#c4ccd9]">{name}</p><div className="mt-1 flex items-end gap-2"><span className="text-xs font-semibold">{price}</span><span className="text-[10px] font-semibold text-emerald-400">{change}</span></div><div className="mt-1 h-[2px] w-10 bg-gradient-to-r from-emerald-500/20 via-emerald-400 to-emerald-500/20" /></div> }
function Panel({ children, className = "" }) { return <section className={`rounded-xl border border-[#293443] bg-gradient-to-br from-[#0c1219] to-[#080d13] p-4 shadow-[0_12px_28px_rgba(0,0,0,.15)] ${className}`}>{children}</section>; }
function PanelTitle({ children, icon }) { return <h2 className="flex items-center gap-2 text-sm font-semibold text-[#f1f5fb]">{icon}{children}<Info className="h-3.5 w-3.5 text-[#78869b]" /></h2>; }

function SentimentCard({ onView }) { return <Panel className="xl:col-span-3"><PanelTitle>Market Sentiment</PanelTitle><p className="mt-3 text-2xl font-semibold text-emerald-400">Bullish</p><div className="relative mx-auto mt-1 h-32 w-48 overflow-hidden"><div className="absolute bottom-0 left-1/2 h-40 w-40 -translate-x-1/2 rounded-t-full border-[11px] border-b-0 border-emerald-400" style={{ clipPath: "inset(0 0 0 50%)" }} /><div className="absolute bottom-0 left-1/2 h-40 w-40 -translate-x-1/2 rounded-t-full border-[11px] border-b-0 border-amber-300" style={{ clipPath: "inset(0 47% 0 23%)" }} /><div className="absolute bottom-0 left-1/2 h-40 w-40 -translate-x-1/2 rounded-t-full border-[11px] border-rose-500" style={{ clipPath: "inset(0 50% 0 0)" }} /><div className="absolute bottom-1 left-1/2 h-16 w-1 origin-bottom -translate-x-1/2 rotate-45 bg-[#b9d9ff]" /><div className="absolute bottom-0 left-0 right-0 text-center"><b className="block text-3xl">72</b><span className="text-xs text-[#aab5c7]">out of 100</span></div></div><p className="mt-2 text-center text-xs text-[#d2d8e4]">Strong buying momentum in the market</p><div className="mt-5 flex justify-between border-t border-[#25303e] pt-3 text-xs text-[#9aa7ba]"><span>Fear & Greed Index</span><button onClick={onView} className="font-semibold text-[#8794ff] hover:text-[#b1aeff]">View Details <ArrowRight className="inline h-3 w-3" /></button></div></Panel> }
function IndexChart({ selectedIndex, setSelectedIndex, timeframe, setTimeframe }) { const [price, change, data] = indexOptions[selectedIndex]; const chart = timeframe === "1D" ? data : data.map((point, index) => ({ ...point, value: point.value + Math.sin(index * 1.7) * (timeframe === "1W" ? 220 : 450) - index * (timeframe === "Max" ? 20 : 0) })); return <Panel className="xl:col-span-4"><div className="flex flex-wrap gap-2 text-xs font-medium text-[#aeb8c9]">{Object.keys(indexOptions).map(name => <button key={name} onClick={() => setSelectedIndex(name)} className={`rounded-md px-2.5 py-1.5 transition ${name === selectedIndex ? "bg-violet-500/25 text-white" : "hover:bg-white/5"}`}>{name}</button>)}</div><div className="mt-4 flex items-center gap-3"><span className="text-2xl font-medium">{price}</span><span className="text-sm font-semibold text-emerald-400">{change}</span></div><MarketCurve data={chart} color="#25e282" /><div className="mt-2 flex items-center justify-between border-t border-[#25303e] pt-3 text-xs text-[#b9c3d3]"><div className="flex flex-wrap gap-2">{["1D", "1W", "1M", "6M", "1Y", "5Y", "Max"].map(range => <button key={range} onClick={() => setTimeframe(range)} className={`rounded-md px-3 py-1.5 ${timeframe === range ? "bg-indigo-600 text-white" : "hover:bg-white/5"}`}>{range}</button>)}</div><button aria-label="Expand chart" onClick={() => window.open(`https://www.google.com/finance/quote/${selectedIndex.replace(" ", ":")}`, "_blank", "noopener,noreferrer")}><Expand className="h-4 w-4" /></button></div></Panel> }
function AdvanceDecline() { return <Panel className="xl:col-span-3"><PanelTitle>Advance / Decline</PanelTitle><div className="mt-5 flex items-center gap-6"><div className="h-36 w-36 shrink-0"><ResponsiveContainer><PieChart><Pie data={breadth} dataKey="value" innerRadius={38} outerRadius={62} stroke="none">{breadth.map(item => <Cell key={item.name} fill={item.color} />)}</Pie></PieChart></ResponsiveContainer></div><div className="space-y-4 text-xs">{breadth.map(item => <div key={item.name} className="flex w-36 items-center justify-between gap-4"><span className="flex items-center gap-2 text-[#d0d7e3]"><i className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />{item.name}</span><b>{item.value}</b></div>)}</div></div><div className="mt-2 flex h-3 overflow-hidden rounded bg-[#61708a]"><i className="bg-emerald-500" style={{ width: "58%" }} /><i className="bg-rose-500" style={{ width: "40%" }} /></div><div className="mt-2 flex justify-between text-xs font-semibold"><span className="text-emerald-400">58%</span><span className="text-rose-400">40%</span><span className="text-[#aab4c4]">2%</span></div></Panel> }
function BreadthChart() { return <Panel className="xl:col-span-2"><PanelTitle>Market Breadth <span className="font-normal text-[#9da9ba]">(NIFTY 500)</span></PanelTitle><MarketCurve data={breadthData} color="#7968ff" compact /><div className="mt-3 grid grid-cols-3 gap-2 text-center"><MiniStat label="Highs" value="156" color="text-emerald-400" /><MiniStat label="Lows" value="42" color="text-rose-400" /><MiniStat label="Unchanged" value="302" color="text-[#c4cfdf]" /></div></Panel> }
function MiniStat({ label, value, color }) { return <div className="rounded-lg border border-[#283342] bg-[#0b1017] p-2"><p className="text-[10px] text-[#a2adbd]">{label}</p><p className={`mt-1 text-lg font-semibold ${color}`}>{value}</p></div> }

function MoverCard({ title, icon, rows, type, onView }) { const active = type === "active"; const positive = type !== "losers"; return <Panel><PanelTitle icon={<span className={positive ? "text-emerald-400" : "text-rose-400"}>{icon}</span>}>{title}</PanelTitle><div className="mt-5 grid grid-cols-[1.45fr_1fr_.9fr_.8fr] gap-2 text-[10px] text-[#96a2b4]"><span>Name</span><span>Price</span><span>{active ? "Volume" : "Change"}</span><span>% Change</span></div><div className="mt-2 space-y-3">{rows.map(([name, price, change, percent]) => <button onClick={onView} key={name} className="grid w-full grid-cols-[1.45fr_1fr_.9fr_.8fr] items-center gap-2 text-left text-[11px] hover:brightness-125"><span className="truncate font-medium text-[#d9e1ed]">{name}</span><span>{price}</span><span className={change.startsWith("-") ? "text-rose-400" : active ? "text-[#cbd5e1]" : "text-emerald-400"}>{change}</span><span className={percent.startsWith("-") ? "text-rose-400" : "text-emerald-400"}>{percent}</span></button>)}</div><button onClick={onView} className="mt-6 w-full text-right text-xs font-medium text-[#8f91ff]">View All <ArrowRight className="inline h-3.5 w-3.5" /></button></Panel> }
function SectorCard({ onView }) { return <Panel><PanelTitle>Sector Performance</PanelTitle><div className="mt-4 grid grid-cols-4 gap-1">{sectors.map(([name, change]) => { const positive = change.startsWith("+"); return <button onClick={onView} key={name} className={`rounded-sm border p-2 text-center transition hover:brightness-125 ${positive ? "border-emerald-500/45 bg-emerald-500/20" : "border-rose-500/45 bg-rose-500/20"}`}><p className="text-[10px] font-semibold">{name}</p><p className={`mt-1 text-[10px] ${positive ? "text-emerald-300" : "text-rose-300"}`}>{change}%</p></button> })}</div><button onClick={onView} className="mt-5 w-full text-right text-xs font-medium text-[#8f91ff]">View All Sectors <ArrowRight className="inline h-3.5 w-3.5" /></button></Panel> }
function NewsCard({ items, onView }) { return <Panel><div className="flex items-center justify-between"><PanelTitle>Market News</PanelTitle><button onClick={onView} className="text-xs text-[#8f91ff]">View All <ArrowRight className="inline h-3.5 w-3.5" /></button></div><div className="mt-4 space-y-3">{items.map((item, index) => { const story = Array.isArray(item) ? { headline: item[0], url: item[1] } : item; return <a href={story.url || "https://www.google.com/search?q=" + encodeURIComponent(story.headline)} target="_blank" rel="noreferrer" className="flex gap-2 rounded-md p-1 transition hover:bg-white/5" key={story.id || story.headline}><div className={`mt-0.5 h-7 w-7 shrink-0 rounded bg-gradient-to-br ${index % 2 ? "from-amber-400/70 to-rose-500/70" : "from-blue-500/70 to-violet-500/70"}`} /><div className="min-w-0"><p className="line-clamp-2 text-[11px] leading-4 text-[#d6deea]">{story.headline}</p><span className="text-[10px] text-[#8896aa]">{index * 12 + 5}m ago</span></div></a> })}</div></Panel> }
function MarketCurve({ data, color, compact = false }) { const width = 640; const height = compact ? 112 : 150; const values = data.map(point => point.value); const min = Math.min(...values); const max = Math.max(...values); const spread = Math.max(max - min, 1); const points = values.map((value, index) => [index * (width / (values.length - 1)), height - 18 - ((value - min) / spread) * (height - 42)]); const line = points.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" "); const fill = `${line} L ${width} ${height} L 0 ${height} Z`; return <div className={`mt-3 w-full ${compact ? "h-28" : "h-36"}`}><svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-full w-full overflow-visible" role="img" aria-label="Market performance curve"><defs><linearGradient id={`curveFill-${color.slice(1)}`} x1="0" x2="0" y1="0" y2="1"><stop stopColor={color} stopOpacity=".34" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs><path d={fill} fill={`url(#curveFill-${color.slice(1)})`} /><path d={line} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />{points.filter((_, index) => index % 4 === 0).map(([x], index) => <line key={index} x1={x} x2={x} y1="8" y2={height} stroke="#64748b" strokeOpacity=".16" strokeDasharray="2 4" />)}</svg></div> }
function CustomizeModal({ onClose }) { const [showCrypto, setShowCrypto] = useState(true); const [showGlobal, setShowGlobal] = useState(true); return <Modal title="Customize market ticker" onClose={onClose}><p className="text-sm text-[#aab6c8]">Choose what appears in your ticker. Your choices apply for this browser session.</p><label className="mt-5 flex items-center justify-between rounded-lg border border-[#2b3646] p-3 text-sm"><span>Global indices</span><input checked={showGlobal} onChange={event => setShowGlobal(event.target.checked)} type="checkbox" className="accent-violet-500" /></label><label className="mt-3 flex items-center justify-between rounded-lg border border-[#2b3646] p-3 text-sm"><span>Crypto assets</span><input checked={showCrypto} onChange={event => setShowCrypto(event.target.checked)} type="checkbox" className="accent-violet-500" /></label><div className="mt-6 flex justify-end gap-3"><button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-[#aab6c8]">Cancel</button><button onClick={onClose} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white">Save settings</button></div></Modal> }
function DetailModal({ title, onClose }) { return <Modal title={title} onClose={onClose}><p className="text-sm leading-6 text-[#aab6c8]">This detailed view is ready for a connected market-data feed. Use the live rows and charts on the dashboard to monitor the current market session.</p><button onClick={onClose} className="mt-6 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white">Back to dashboard</button></Modal> }
function Modal({ title, children, onClose }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm" onMouseDown={onClose}><div role="dialog" aria-modal="true" aria-label={title} onMouseDown={event => event.stopPropagation()} className="w-full max-w-md rounded-2xl border border-[#344154] bg-[#0b1119] p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">{title}</h2><button onClick={onClose} aria-label="Close" className="rounded p-1 text-xl text-[#aab6c8] hover:bg-white/10">×</button></div><div className="mt-4">{children}</div></div></div> }
function SearchResult({ items }) { return <div className="mt-3 rounded-lg border border-[#2a3544] bg-[#0b1119] p-3 text-sm text-[#aab6c8]">{items.length ? `Matching live quotes: ${items.map(item => `${item.symbol} ${item.c}`).join(" · ")}` : "No matching live quotes."}</div> }
