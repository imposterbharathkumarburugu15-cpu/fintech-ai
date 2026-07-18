import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, ChevronRight, CircleDollarSign, Clock3, ExternalLink, Flame, LineChart, Plus, RefreshCw, Search, Star, TrendingDown, TrendingUp, Zap } from "lucide-react";

const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const marketSymbols = {
  india: ["^NSEI", "^BSESN", "^NSEBANK", "NIFTY_FIN_SERVICE", "INDIAVIX"],
  usa: ["QQQ", "SPY", "DIA", "IWM", "VIXY"],
  global: ["EWJ", "EWU", "EWG", "EWH", "EWQ"],
};
const publisherFallbacks = {
  india: ["https://www.reuters.com/world/india/", "https://www.moneycontrol.com/news/business/markets/", "https://www.livemint.com/market"],
  usa: ["https://www.reuters.com/markets/us/", "https://www.cnbc.com/markets/", "https://www.bloomberg.com/markets"],
  global: ["https://www.reuters.com/markets/", "https://www.ft.com/markets", "https://www.bloomberg.com/markets"],
};

const marketData = {
  india: {
    title: "Indian markets", subtitle: "NSE & BSE • Session in progress",
    indices: [["NIFTY 50", "24,812.40", "+1.24%", true], ["SENSEX", "81,904.70", "+0.98%", true], ["BANK NIFTY", "53,481.80", "+1.56%", true], ["FINNIFTY", "24,086.55", "+0.74%", true], ["INDIA VIX", "12.84", "−4.28%", true]],
    movers: [["WIPRO", "₹482.50", "+4.28%", "WIT"], ["TATA MOTORS", "₹976.15", "+3.41%", "TM"], ["HCLTECH", "₹1,698.40", "+2.96%", "HC"], ["ADANI PORTS", "₹1,392.20", "−2.86%", "AP"], ["JSWSTEEL", "₹917.45", "−2.12%", "JS"]],
    news: ["RBI signals steady policy path as growth momentum holds", "India’s technology leaders power a broad-based market rally", "Foreign investors return to financials ahead of earnings season"],
    sectors: [["Technology", "+2.8", "green"], ["Finance", "+1.7", "green"], ["Healthcare", "+0.9", "green"], ["Energy", "−0.6", "red"], ["IT", "+2.3", "green"], ["Automobile", "+1.2", "green"], ["FMCG", "−0.2", "red"], ["Metal", "−1.1", "red"]],
  },
  usa: {
    title: "US markets", subtitle: "NYSE & NASDAQ • Pre-market live",
    indices: [["NASDAQ", "18,509.34", "+0.86%", true], ["S&P 500", "6,029.15", "+0.54%", true], ["DOW JONES", "43,275.91", "+0.31%", true], ["RUSSELL 2000", "2,231.50", "−0.18%", false], ["CBOE VIX", "15.72", "−2.61%", true]],
    movers: [["NVIDIA", "$141.20", "+5.19%", "NV"], ["PALANTIR", "$71.44", "+4.11%", "PL"], ["TESLA", "$349.98", "+3.76%", "TS"], ["BOEING", "$168.22", "−2.41%", "BA"], ["INTEL", "$20.40", "−1.87%", "IN"]],
    news: ["Wall Street futures rise as chipmakers extend their advance", "Investors focus on Fed commentary ahead of policy minutes", "Earnings optimism broadens beyond mega-cap technology"],
    sectors: [["Technology", "+2.2", "green"], ["Financials", "+0.8", "green"], ["Healthcare", "+0.3", "green"], ["Energy", "−0.8", "red"], ["Consumer", "+1.0", "green"], ["Industrials", "+0.4", "green"], ["Utilities", "−0.3", "red"], ["Real Estate", "−0.7", "red"]],
  },
  global: {
    title: "Global markets", subtitle: "A consolidated view across time zones",
    indices: [["NIKKEI 225", "39,569.68", "+1.18%", true], ["FTSE 100", "8,317.59", "+0.34%", true], ["DAX", "20,340.57", "+0.67%", true], ["HANG SENG", "19,742.12", "−0.49%", false], ["CAC 40", "7,464.31", "+0.23%", true]],
    movers: [["GOLD", "$2,643.70", "+1.14%", "AU"], ["BITCOIN", "$98,240", "+2.87%", "₿"], ["CRUDE OIL", "$70.21", "+1.32%", "CL"], ["ETHEREUM", "$3,442", "−0.96%", "Ξ"], ["NATURAL GAS", "$3.06", "−1.41%", "NG"]],
    news: ["Asian equities advance as the yen softens against the dollar", "Oil climbs on supply headlines while gold renews its bid", "European markets gain as investors rotate into cyclical names"],
    sectors: [["Asia Pacific", "+1.2", "green"], ["Europe", "+0.6", "green"], ["Americas", "+0.5", "green"], ["Commodities", "+1.1", "green"], ["Crypto", "+2.3", "green"], ["Forex", "−0.2", "red"], ["Energy", "+0.8", "green"], ["Metals", "+1.4", "green"]],
  }
};

const tabs = [{ id: "india", icon: "🇮🇳", label: "India" }, { id: "usa", icon: "🇺🇸", label: "USA" }, { id: "global", icon: "🌐", label: "Global" }, { id: "watchlist", icon: "★", label: "Watchlist" }];
const watchStocks = [["RELIANCE", "₹2,916.50", "+1.42%", "R"], ["AAPL", "$221.54", "+0.84%", "A"], ["NVDA", "$141.20", "+5.19%", "N"], ["BTC", "$98,240", "+2.87%", "₿"]];

export function MarketIntelligence() {
  const [market, setMarket] = useState("india");
  const [refreshing, setRefreshing] = useState(false);
  const [pinned, setPinned] = useState(["RELIANCE", "AAPL", "NVDA"]);
  const [query, setQuery] = useState("");
  const [liveQuotes, setLiveQuotes] = useState({});
  const [liveNews, setLiveNews] = useState([]);
  const [candleData, setCandleData] = useState([]);
  const [apiStatus, setApiStatus] = useState(FINNHUB_KEY ? "Connecting live feed…" : "Add a Finnhub key for live data");
  const data = marketData[market === "watchlist" ? "india" : market];
  const displayStocks = market === "watchlist" ? watchStocks.filter(([name]) => pinned.includes(name)) : data.movers;
  const filtered = useMemo(() => displayStocks.filter(s => s[0].toLowerCase().includes(query.toLowerCase())), [displayStocks, query]);
  const loadLiveData = useCallback(async () => {
    if (!FINNHUB_KEY) return;
    const activeMarket = market === "watchlist" ? "india" : market;
    setRefreshing(true);
    try {
      const symbols = marketSymbols[activeMarket];
      const primarySymbol = symbols[0];
      const to = Math.floor(Date.now() / 1000);
      const from = to - 60 * 60 * 24 * 7;
      const [quoteResponses, newsResponse, candleResponse] = await Promise.all([
        Promise.all(symbols.map(async symbol => {
          const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_KEY}`);
          if (!response.ok) throw new Error("Quote request failed");
          return [symbol, await response.json()];
        })),
        fetch(`https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_KEY}`),
        fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(primarySymbol)}&resolution=60&from=${from}&to=${to}&token=${FINNHUB_KEY}`),
      ]);
      setLiveQuotes(Object.fromEntries(quoteResponses));
      const articles = newsResponse.ok ? await newsResponse.json() : [];
      setLiveNews(Array.isArray(articles) ? articles.filter(article => article.headline && article.url).slice(0, 3) : []);
      const candles = candleResponse.ok ? await candleResponse.json() : null;
      setCandleData(candles?.s === "ok" && Array.isArray(candles.c) ? candles.c.slice(-42) : []);
      setApiStatus("Live market feed • refreshed just now");
    } catch {
      setApiStatus("Live feed is unavailable — showing the latest saved market snapshot");
    } finally { setRefreshing(false); }
  }, [market]);
  useEffect(() => { loadLiveData(); }, [loadLiveData]);
  const refresh = loadLiveData;
  const indices = data.indices.map((item, index) => {
    const quote = liveQuotes[marketSymbols[market === "watchlist" ? "india" : market][index]];
    if (!quote?.c) return item;
    const decimals = quote.c >= 100 ? 2 : 3;
    const pct = Number(quote.dp || 0);
    return [item[0], Number(quote.c).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }), `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`, pct >= 0];
  });
  const articles = liveNews.length ? liveNews.map(article => ({ headline: article.headline, url: article.url, source: article.source || "Market wire", time: article.datetime ? new Date(article.datetime * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Now" })) : data.news.map((headline, index) => ({ headline, url: publisherFallbacks[market === "watchlist" ? "india" : market][index], source: ["Reuters", "Market Desk", "Financial Times"][index], time: `${index * 14 + 6} min ago` }));

  return <div className="market-shell min-h-full overflow-hidden text-white">
    <div className="market-orb market-orb-one" /><div className="market-orb market-orb-two" />
    <main className="relative mx-auto max-w-[1680px] px-4 py-5 sm:px-7 lg:px-10 lg:py-8">
      <header className="flex flex-col gap-5 border-b border-white/[.07] pb-6 xl:flex-row xl:items-center xl:justify-between">
        <div><div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.2em] text-violet-300"><span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] shadow-[0_0_12px_#22c55e]" />Global intelligence network</div><h1 className="text-3xl font-semibold tracking-[-.045em] sm:text-4xl">Market <span className="market-shimmer">Analysis</span></h1><p className="mt-2 text-sm text-zinc-400">Real-time global financial markets, engineered for clarity.</p></div>
        <div className="flex flex-wrap items-center gap-2.5"><div className="market-search"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search an instrument" /><kbd>⌘ K</kbd></div><button onClick={refresh} className="market-icon-btn" aria-label="Refresh markets"><RefreshCw size={17} className={refreshing ? "animate-spin" : ""}/></button><button className="market-icon-btn relative" aria-label="Notifications"><Bell size={17}/><i /></button><div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[.045] py-1.5 pl-2 pr-3"><div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-[10px] font-bold">AS</div><span className="text-xs font-medium text-zinc-300">Aarav</span></div></div>
      </header>

      <section className="mt-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="market-tabs">{tabs.map(tab => <button key={tab.id} onClick={() => setMarket(tab.id)} className={market === tab.id ? "active" : ""}><span>{tab.icon}</span>{tab.label}</button>)}</div>
        <div title={apiStatus} className="flex items-center gap-2 self-start rounded-full border border-emerald-400/15 bg-emerald-400/[.07] px-3 py-2 text-[11px] font-semibold text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE MARKET <span className="ml-1 hidden font-normal text-emerald-200/60 sm:inline">• {apiStatus}</span></div>
      </section>

      <section key={market} className="market-enter mt-7">
        <div className="mb-4 flex items-end justify-between"><div><h2 className="text-lg font-semibold tracking-tight">{market === "watchlist" ? "Your watchlist" : data.title}</h2><p className="mt-1 text-xs text-zinc-500">{market === "watchlist" ? "Your highest-conviction instruments, all in one place." : data.subtitle}</p></div><button className="hidden items-center gap-1 text-xs font-medium text-violet-300 hover:text-white sm:flex">Explore markets <ChevronRight size={15}/></button></div>
        {market !== "watchlist" && <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{indices.map((item, i) => <IndexCard key={item[0]} item={item} index={i}/>)}</div>}
        {market === "watchlist" && <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{watchStocks.map(stock => <WatchCard key={stock[0]} stock={stock} pinned={pinned.includes(stock[0])} toggle={() => setPinned(p => p.includes(stock[0]) ? p.filter(x => x !== stock[0]) : [...p, stock[0]])}/>)}</div>}
      </section>

      <section className="mt-5 grid gap-5 2xl:grid-cols-[1.1fr_.9fr]">
        <div className="market-card p-5 sm:p-6"><div className="flex items-center justify-between"><div><p className="market-eyebrow">Market pulse</p><h2 className="mt-1 text-xl font-semibold">{indices[0][0]} performance</h2></div><button className="rounded-lg bg-white/[.06] px-3 py-2 text-xs text-zinc-300 hover:bg-white/10">1H candles</button></div><div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end"><div className="min-w-[168px]"><p className="text-3xl font-semibold tracking-tight">{indices[0][1]}</p><p className={`mt-1 flex items-center gap-1 text-sm font-medium ${indices[0][3] ? "text-emerald-400" : "text-rose-400"}`}>{indices[0][3] ? <TrendingUp size={15}/> : <TrendingDown size={15}/>} {indices[0][2]} <span className="text-zinc-500">today</span></p></div><PulseChart values={candleData} positive={indices[0][3]} /></div><div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/[.06] pt-4 text-[11px]"><span className="text-zinc-500">Source <b className="ml-1 text-zinc-300">{candleData.length ? "Finnhub live candles" : "Market snapshot"}</b></span><span className="text-zinc-500">Resolution <b className="ml-1 text-zinc-300">1 hour</b></span><span className="text-zinc-500">Points <b className="ml-1 text-zinc-300">{candleData.length || 42}</b></span></div></div>
        <Sentiment />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-3">
        <StockColumn title={market === "watchlist" ? "Pinned instruments" : "Top gainers"} icon={<TrendingUp size={16}/>} stocks={filtered.slice(0, 3)} positive />
        <StockColumn title={market === "watchlist" ? "Recently viewed" : "Top losers"} icon={<TrendingDown size={16}/>} stocks={market === "watchlist" ? watchStocks.slice(1) : data.movers.filter(s => s[2].includes("−"))} />
        <StockColumn title="Most active" icon={<Zap size={16}/>} stocks={market === "watchlist" ? watchStocks.slice(0, 3) : data.movers.slice(1, 4)} positive active />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <div className="market-card p-5 sm:p-6"><div className="flex items-center justify-between"><div><p className="market-eyebrow">Breadth & rotation</p><h2 className="mt-1 text-lg font-semibold">Sector heatmap</h2></div><span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">63% POSITIVE</span></div><div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">{data.sectors.map(([name, change, tone], i) => <div key={name} className={`heat heat-${tone}`} style={{ opacity: .66 + (i % 3) * .14 }}><span>{name}</span><b>{change}%</b><small>{tone === "green" ? "Outperforming" : "Under pressure"}</small></div>)}</div></div>
        <FiiCard />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <div className="market-card overflow-hidden p-5 sm:p-6"><div className="flex items-center justify-between"><div><p className="market-eyebrow">Signal desk</p><h2 className="mt-1 text-lg font-semibold">{market === "watchlist" ? "Latest financial news" : `${data.title} news`}</h2></div><a href={market === "india" ? "https://www.reuters.com/world/india/" : "https://www.reuters.com/markets/"} target="_blank" rel="noreferrer" className="text-xs font-medium text-violet-300">View all</a></div><div className="mt-4 divide-y divide-white/[.06]">{articles.map((article, i) => <a href={article.url} target="_blank" rel="noreferrer" aria-label={`Read: ${article.headline}`} className="group flex gap-4 py-4 first:pt-0" key={article.url}><div className={`news-art news-art-${i}`}><LineChart size={23}/></div><div className="flex min-w-0 flex-1 flex-col justify-center"><div className="mb-1 flex gap-2 text-[10px] font-semibold uppercase tracking-widest text-violet-300"><span>{["Markets", "Equities", "Macro"][i]}</span><span className="text-zinc-600">•</span><span className="text-zinc-500">{article.time}</span></div><h3 className="text-sm font-medium leading-5 text-zinc-200 group-hover:text-white">{article.headline}</h3><span className="mt-1.5 text-[11px] text-zinc-500">{article.source}</span></div><ExternalLink className="mt-4 h-4 w-4 shrink-0 text-zinc-600 group-hover:text-white" /></a>)}</div></div>
        <IpoCard />
      </section>
    </main>
  </div>;
}

function IndexCard({ item: [name, price, change, up], index }) { return <article className="market-card index-card group"><div className="flex items-start justify-between"><span className="text-[11px] font-semibold tracking-wide text-zinc-400">{name}</span><span className="live-dot" /></div><p className="mt-5 text-xl font-semibold tracking-[-.035em]">{price}</p><div className={`mt-1.5 flex items-center gap-1 text-xs font-semibold ${up ? "text-emerald-400" : "text-rose-400"}`}>{up ? <TrendingUp size={13}/> : <TrendingDown size={13}/>} {change}</div><Spark index={index} up={up}/></article> }
function Spark({ index, up }) { const paths = ["M0 25 C18 17 23 29 38 23 S61 4 80 17 S100 5 122 11 S150 2 170 8", "M0 28 C20 28 27 9 44 18 S72 22 90 12 S112 10 127 5 S152 18 170 4", "M0 21 C20 5 36 25 52 14 S76 29 93 16 S123 3 142 15 S154 9 170 5", "M0 8 C19 23 34 11 48 24 S78 16 95 27 S123 15 142 25 S160 28 170 18", "M0 11 C17 18 28 9 47 16 S65 28 89 18 S105 30 123 17 S153 24 170 12"]; return <svg className="mt-5 h-9 w-full overflow-visible" viewBox="0 0 170 36" preserveAspectRatio="none"><path d={paths[index]} fill="none" stroke={up ? "#22c55e" : "#ef4444"} strokeWidth="1.8" strokeLinecap="round"/><path d={paths[index] + " L170 36 L0 36Z"} fill={up ? "url(#greenfade)" : "url(#redfade)"}/><defs><linearGradient id="greenfade" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#22c55e" stopOpacity=".18"/><stop offset="1" stopColor="#22c55e" stopOpacity="0"/></linearGradient><linearGradient id="redfade" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#ef4444" stopOpacity=".18"/><stop offset="1" stopColor="#ef4444" stopOpacity="0"/></linearGradient></defs></svg> }
function PulseChart({ values = [], positive = true }) { const fallback = [100, 95, 103, 99, 108, 106, 112, 109, 117, 115, 120, 118, 124, 122, 128, 126, 133, 130, 138, 136, 143, 148]; const series = values.length > 2 ? values : fallback; const min = Math.min(...series); const span = Math.max(Math.max(...series) - min, 1); const points = series.map((value, index) => `${(index / (series.length - 1)) * 700},${144 - ((value - min) / span) * 118}`); const line = `M${points.join(" L")}`; const color = positive ? "#8b7cff" : "#ef6b82"; return <div className="h-40 min-w-0 flex-1"><svg className="h-full w-full" viewBox="0 0 700 170" preserveAspectRatio="none"><defs><linearGradient id="pulsefill" x1="0" x2="0" y1="0" y2="1"><stop stopColor={color} stopOpacity=".34"/><stop offset="1" stopColor={color} stopOpacity="0"/></linearGradient></defs>{[30,70,110,150].map(y => <path key={y} d={`M0 ${y} H700`} stroke="white" strokeOpacity=".07" strokeDasharray="3 8"/>)}<path d={`${line} L700 170 L0 170Z`} fill="url(#pulsefill)"/><path d={line} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/><circle cx="700" cy={points.at(-1).split(",")[1]} r="5" fill={color} className="animate-pulse"/></svg></div> }
function Sentiment() { return <div className="market-card sentiment-card p-5 sm:p-6"><div className="flex items-center justify-between"><div><p className="market-eyebrow">Market sentiment</p><h2 className="mt-1 text-lg font-semibold">Fear & greed</h2></div><Flame size={20} className="text-amber-300"/></div><div className="gauge"><div className="gauge-fill"/><div className="gauge-needle"/><div className="gauge-value"><b>72</b><span>Greed</span></div></div><div className="mt-2 grid grid-cols-3 border-t border-white/[.06] pt-4 text-center"><div><p className="text-[10px] text-zinc-500">Bullish</p><b className="text-sm text-emerald-400">68%</b></div><div className="border-x border-white/[.06]"><p className="text-[10px] text-zinc-500">Neutral</p><b className="text-sm">19%</b></div><div><p className="text-[10px] text-zinc-500">Bearish</p><b className="text-sm text-rose-400">13%</b></div></div></div> }
function StockColumn({ title, icon, stocks, positive, active }) { return <div className="market-card p-5"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-sm font-semibold"><span className={positive ? "text-emerald-400" : "text-rose-400"}>{icon}</span>{title}</h2><button className="text-[11px] text-zinc-500 hover:text-white">View all</button></div><div className="mt-4 space-y-2">{stocks.length ? stocks.map(([name, price, change, mark]) => <div className="stock-row" key={name}><span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-white/10 to-white/[.03] text-[10px] font-bold text-zinc-300">{mark}</span><div className="min-w-0 flex-1"><b>{name}</b><small>{active ? "High volume today" : price}</small></div><div className="text-right"><b>{active ? price : change}</b><small className={change.includes("−") ? "text-rose-400" : "text-emerald-400"}>{active ? change : "Today"}</small></div></div>) : <p className="py-5 text-center text-xs text-zinc-500">No matching instruments</p>}</div></div> }
function FiiCard() { return <div className="market-card p-5 sm:p-6"><div className="flex items-start justify-between"><div><p className="market-eyebrow">Institutional flow</p><h2 className="mt-1 text-lg font-semibold">FII / DII activity</h2></div><CircleDollarSign size={20} className="text-violet-300"/></div><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[.06] p-4"><p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300/70">FII net flow</p><p className="mt-2 text-xl font-semibold text-emerald-400">+₹1,482 Cr</p><p className="mt-1 text-[11px] text-zinc-500">Third day of inflows</p></div><div className="rounded-2xl border border-violet-400/10 bg-violet-400/[.06] p-4"><p className="text-[10px] font-semibold uppercase tracking-wider text-violet-300/70">DII net flow</p><p className="mt-2 text-xl font-semibold text-violet-300">+₹892 Cr</p><p className="mt-1 text-[11px] text-zinc-500">Domestic support</p></div></div><div className="mt-5 flex h-2 overflow-hidden rounded-full bg-white/5"><span className="w-[62%] bg-gradient-to-r from-emerald-500 to-emerald-300"/><span className="w-[38%] bg-gradient-to-r from-violet-500 to-violet-300"/></div></div> }
function IpoCard() { return <div className="market-card p-5 sm:p-6"><div className="flex items-center justify-between"><div><p className="market-eyebrow">Primary market</p><h2 className="mt-1 text-lg font-semibold">IPO calendar</h2></div><button className="text-xs text-violet-300">Full calendar</button></div><div className="mt-4 space-y-3"><Ipo name="HDB Financial Services" date="Aug 04" size="₹12,500 Cr" status="Upcoming"/><Ipo name="Ather Energy" date="Aug 08" size="₹3,100 Cr" status="Opens soon"/><Ipo name="NSDL" date="Aug 12" size="₹4,012 Cr" status="Upcoming"/></div></div> }
function Ipo({ name, date, size, status }) { return <div className="flex items-center gap-3 rounded-xl bg-white/[.035] p-3"><div className="grid h-9 w-9 place-items-center rounded-lg bg-violet-500/15 text-xs font-bold text-violet-300">IPO</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{name}</p><p className="mt-0.5 text-[10px] text-zinc-500">{size} issue size</p></div><div className="text-right"><p className="text-xs font-medium">{date}</p><p className="mt-0.5 text-[10px] text-emerald-400">{status}</p></div></div> }
function WatchCard({ stock, pinned, toggle }) { const [name, price, change, mark] = stock; return <article className="market-card index-card"><div className="flex items-center justify-between"><span className="grid h-8 w-8 place-items-center rounded-lg bg-white/[.07] text-xs font-bold">{mark}</span><button onClick={toggle} className={pinned ? "text-amber-300" : "text-zinc-600"}><Star size={17} fill={pinned ? "currentColor" : "none"}/></button></div><p className="mt-5 text-xs font-medium text-zinc-400">{name}</p><p className="mt-1 text-xl font-semibold">{price}</p><p className="mt-1 text-xs font-semibold text-emerald-400">{change}</p></article> }
