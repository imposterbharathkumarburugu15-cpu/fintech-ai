import { useCallback, useEffect, useMemo, useState } from "react";
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
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

export function MarketIntelligence() {
  const [quotes, setQuotes] = useState([]);
  const [news, setNews] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

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
        <button className="rounded-lg border border-violet-500/70 px-5 py-2.5 text-xs font-semibold text-violet-300 hover:bg-violet-500/10">Customize</button>
      </div>
    </div>

    <main className="p-5 lg:p-7">
      <h1 className="text-2xl font-semibold tracking-tight">Market Analysis</h1><p className="mt-1 text-sm text-[#a0aabd]">Real-time market overview & performance</p>
      {error && <p className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-200">{error}</p>}
      {query && <SearchResult items={searchResults} />}

      <section className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-12">
        <SentimentCard />
        <IndexChart />
        <AdvanceDecline />
        <BreadthChart />
      </section>
      <section className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        <MoverCard title="Top Gainers" icon={<Rocket />} rows={movers.gainers} type="gainers" />
        <MoverCard title="Top Losers" icon={<TrendingDown />} rows={movers.losers} type="losers" />
        <MoverCard title="Most Active" icon={<Sparkles />} rows={movers.active} type="active" />
        <SectorCard />
        <NewsCard items={news.length ? news : fallbackNews} />
      </section>
    </main>
  </div>;
}

function TickerItem({ name, price, change }) { return <div className="min-w-0 px-3 xl:first:pl-0"><p className="text-[10px] font-semibold text-[#c4ccd9]">{name}</p><div className="mt-1 flex items-end gap-2"><span className="text-xs font-semibold">{price}</span><span className="text-[10px] font-semibold text-emerald-400">{change}</span></div><div className="mt-1 h-[2px] w-10 bg-gradient-to-r from-emerald-500/20 via-emerald-400 to-emerald-500/20" /></div> }
function Panel({ children, className = "" }) { return <section className={`rounded-xl border border-[#293443] bg-gradient-to-br from-[#0c1219] to-[#080d13] p-4 shadow-[0_12px_28px_rgba(0,0,0,.15)] ${className}`}>{children}</section>; }
function PanelTitle({ children, icon }) { return <h2 className="flex items-center gap-2 text-sm font-semibold text-[#f1f5fb]">{icon}{children}<Info className="h-3.5 w-3.5 text-[#78869b]" /></h2>; }

function SentimentCard() { return <Panel className="xl:col-span-3"><PanelTitle>Market Sentiment</PanelTitle><p className="mt-3 text-2xl font-semibold text-emerald-400">Bullish</p><div className="relative mx-auto mt-1 h-32 w-48 overflow-hidden"><div className="absolute bottom-0 left-1/2 h-40 w-40 -translate-x-1/2 rounded-t-full border-[11px] border-b-0 border-emerald-400" style={{ clipPath: "inset(0 0 0 50%)" }} /><div className="absolute bottom-0 left-1/2 h-40 w-40 -translate-x-1/2 rounded-t-full border-[11px] border-b-0 border-amber-300" style={{ clipPath: "inset(0 47% 0 23%)" }} /><div className="absolute bottom-0 left-1/2 h-40 w-40 -translate-x-1/2 rounded-t-full border-[11px] border-b-0 border-rose-500" style={{ clipPath: "inset(0 50% 0 0)" }} /><div className="absolute bottom-1 left-1/2 h-16 w-1 origin-bottom -translate-x-1/2 rotate-45 bg-[#b9d9ff]" /><div className="absolute bottom-0 left-0 right-0 text-center"><b className="block text-3xl">72</b><span className="text-xs text-[#aab5c7]">out of 100</span></div></div><p className="mt-2 text-center text-xs text-[#d2d8e4]">Strong buying momentum in the market</p><div className="mt-5 flex justify-between border-t border-[#25303e] pt-3 text-xs text-[#9aa7ba]"><span>Fear & Greed Index</span><span className="font-semibold text-[#8794ff]">View Details <ArrowRight className="inline h-3 w-3" /></span></div></Panel> }
function IndexChart() { return <Panel className="xl:col-span-4"><div className="flex gap-5 text-xs font-medium text-[#aeb8c9]"><span className="rounded-md bg-violet-500/25 px-2.5 py-1.5 text-white">NIFTY 50</span><span className="py-1.5">SENSEX</span><span className="py-1.5">BANK NIFTY</span><span className="py-1.5">NIFTY IT</span></div><div className="mt-4 flex items-center gap-3"><span className="text-2xl font-medium">22,302.50</span><span className="text-sm font-semibold text-emerald-400">+234.50 (1.05%)</span></div><div className="h-32"><ResponsiveContainer><AreaChart data={chartData}><defs><linearGradient id="indexGlow" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#20d878" stopOpacity=".35" /><stop offset="1" stopColor="#20d878" stopOpacity="0" /></linearGradient></defs><Tooltip contentStyle={{ background: "#0d131d", border: "1px solid #334155" }} /><Area type="monotone" dataKey="value" stroke="#25e282" strokeWidth={2} fill="url(#indexGlow)" /></AreaChart></ResponsiveContainer></div><div className="mt-2 flex items-center justify-between border-t border-[#25303e] pt-3 text-xs text-[#b9c3d3]"><div className="flex gap-5"><b className="rounded-md bg-indigo-600 px-3 py-1.5 text-white">1D</b><span>1W</span><span>1M</span><span>6M</span><span>1Y</span><span>5Y</span><span>Max</span></div><Expand className="h-4 w-4" /></div></Panel> }
function AdvanceDecline() { return <Panel className="xl:col-span-3"><PanelTitle>Advance / Decline</PanelTitle><div className="mt-5 flex items-center gap-6"><div className="h-36 w-36 shrink-0"><ResponsiveContainer><PieChart><Pie data={breadth} dataKey="value" innerRadius={38} outerRadius={62} stroke="none">{breadth.map(item => <Cell key={item.name} fill={item.color} />)}</Pie></PieChart></ResponsiveContainer></div><div className="space-y-4 text-xs">{breadth.map(item => <div key={item.name} className="flex w-36 items-center justify-between gap-4"><span className="flex items-center gap-2 text-[#d0d7e3]"><i className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />{item.name}</span><b>{item.value}</b></div>)}</div></div><div className="mt-2 flex h-3 overflow-hidden rounded bg-[#61708a]"><i className="bg-emerald-500" style={{ width: "58%" }} /><i className="bg-rose-500" style={{ width: "40%" }} /></div><div className="mt-2 flex justify-between text-xs font-semibold"><span className="text-emerald-400">58%</span><span className="text-rose-400">40%</span><span className="text-[#aab4c4]">2%</span></div></Panel> }
function BreadthChart() { return <Panel className="xl:col-span-2"><PanelTitle>Market Breadth <span className="font-normal text-[#9da9ba]">(NIFTY 500)</span></PanelTitle><div className="mt-4 h-28"><ResponsiveContainer><AreaChart data={breadthData}><defs><linearGradient id="breadthGlow" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#6d5cfb" stopOpacity=".3" /><stop offset="1" stopColor="#6d5cfb" stopOpacity="0" /></linearGradient></defs><Area type="monotone" dataKey="value" stroke="#7163ff" fill="url(#breadthGlow)" strokeWidth={2} /></AreaChart></ResponsiveContainer></div><div className="mt-3 grid grid-cols-3 gap-2 text-center"><MiniStat label="Highs" value="156" color="text-emerald-400" /><MiniStat label="Lows" value="42" color="text-rose-400" /><MiniStat label="Unchanged" value="302" color="text-[#c4cfdf]" /></div></Panel> }
function MiniStat({ label, value, color }) { return <div className="rounded-lg border border-[#283342] bg-[#0b1017] p-2"><p className="text-[10px] text-[#a2adbd]">{label}</p><p className={`mt-1 text-lg font-semibold ${color}`}>{value}</p></div> }

function MoverCard({ title, icon, rows, type }) { const active = type === "active"; const positive = type !== "losers"; return <Panel><PanelTitle icon={<span className={positive ? "text-emerald-400" : "text-rose-400"}>{icon}</span>}>{title}</PanelTitle><div className="mt-5 grid grid-cols-[1.45fr_1fr_.9fr_.8fr] gap-2 text-[10px] text-[#96a2b4]"><span>Name</span><span>Price</span><span>{active ? "Volume" : "Change"}</span><span>% Change</span></div><div className="mt-2 space-y-3">{rows.map(([name, price, change, percent]) => <div key={name} className="grid grid-cols-[1.45fr_1fr_.9fr_.8fr] items-center gap-2 text-[11px]"><span className="truncate font-medium text-[#d9e1ed]">{name}</span><span>{price}</span><span className={change.startsWith("-") ? "text-rose-400" : active ? "text-[#cbd5e1]" : "text-emerald-400"}>{change}</span><span className={percent.startsWith("-") ? "text-rose-400" : "text-emerald-400"}>{percent}</span></div>)}</div><p className="mt-6 text-right text-xs font-medium text-[#8f91ff]">View All <ArrowRight className="inline h-3.5 w-3.5" /></p></Panel> }
function SectorCard() { return <Panel><PanelTitle>Sector Performance</PanelTitle><div className="mt-4 grid grid-cols-4 gap-1">{sectors.map(([name, change]) => { const positive = change.startsWith("+"); return <div key={name} className={`rounded-sm border p-2 text-center ${positive ? "border-emerald-500/45 bg-emerald-500/20" : "border-rose-500/45 bg-rose-500/20"}`}><p className="text-[10px] font-semibold">{name}</p><p className={`mt-1 text-[10px] ${positive ? "text-emerald-300" : "text-rose-300"}`}>{change}%</p></div> })}</div><p className="mt-5 text-right text-xs font-medium text-[#8f91ff]">View All Sectors <ArrowRight className="inline h-3.5 w-3.5" /></p></Panel> }
function NewsCard({ items }) { return <Panel><div className="flex items-center justify-between"><PanelTitle>Market News</PanelTitle><span className="text-xs text-[#8f91ff]">View All <ArrowRight className="inline h-3.5 w-3.5" /></span></div><div className="mt-4 space-y-3">{items.map((item, index) => { const story = typeof item === "string" ? { headline: item } : item; return <div className="flex gap-2" key={story.id || story.headline}><div className={`mt-0.5 h-7 w-7 shrink-0 rounded bg-gradient-to-br ${index % 2 ? "from-amber-400/70 to-rose-500/70" : "from-blue-500/70 to-violet-500/70"}`} /><div className="min-w-0"><p className="line-clamp-2 text-[11px] leading-4 text-[#d6deea]">{story.headline}</p><span className="text-[10px] text-[#8896aa]">{index * 12 + 5}m ago</span></div></div> })}</div></Panel> }
function SearchResult({ items }) { return <div className="mt-3 rounded-lg border border-[#2a3544] bg-[#0b1119] p-3 text-sm text-[#aab6c8]">{items.length ? `Matching live quotes: ${items.map(item => `${item.symbol} ${item.c}`).join(" · ")}` : "No matching live quotes."}</div> }
