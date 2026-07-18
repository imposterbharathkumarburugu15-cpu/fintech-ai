import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Clock3,
  ExternalLink,
  Globe2,
  Newspaper,
  RefreshCw,
  Search,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";

const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_API_KEY;

const WATCHLIST = [
  { symbol: "AAPL", name: "Apple" },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "NVDA", name: "NVIDIA" },
  { symbol: "AMZN", name: "Amazon" },
  { symbol: "GOOGL", name: "Alphabet" },
  { symbol: "TSLA", name: "Tesla" },
];

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

function MarketIntelligence() {
  const [quotes, setQuotes] = useState([]);
  const [news, setNews] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadMarketData = useCallback(async ({ manual = false } = {}) => {
    if (!FINNHUB_KEY) {
      setError("Add VITE_FINNHUB_API_KEY to your .env file to enable live market data.");
      setLoading(false);
      return;
    }

    manual ? setRefreshing(true) : setLoading(true);
    setError("");

    try {
      const quoteRequests = WATCHLIST.map(async (stock) => {
        const response = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${stock.symbol}&token=${FINNHUB_KEY}`
        );
        if (!response.ok) throw new Error("Unable to load live quotes.");
        return { ...stock, ...(await response.json()) };
      });

      const newsRequest = fetch(
        `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_KEY}`
      ).then((response) => {
        if (!response.ok) throw new Error("Unable to load market news.");
        return response.json();
      });

      const [nextQuotes, nextNews] = await Promise.all([
        Promise.all(quoteRequests),
        newsRequest,
      ]);

      setQuotes(nextQuotes.filter((quote) => Number.isFinite(quote.c) && quote.c > 0));
      setNews(Array.isArray(nextNews) ? nextNews.slice(0, 4) : []);
      setLastUpdated(new Date());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Market data is temporarily unavailable.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMarketData();
    const refreshInterval = window.setInterval(() => loadMarketData(), 60_000);
    return () => window.clearInterval(refreshInterval);
  }, [loadMarketData]);

  const displayedQuotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return quotes;
    return quotes.filter((quote) =>
      `${quote.symbol} ${quote.name}`.toLowerCase().includes(normalizedQuery)
    );
  }, [query, quotes]);

  const advancing = quotes.filter((quote) => quote.dp >= 0).length;
  const averageMove = quotes.length
    ? quotes.reduce((total, quote) => total + (Number(quote.dp) || 0), 0) / quotes.length
    : 0;

  return (
    <div className="min-h-full bg-[#09090b] px-5 py-6 text-white sm:px-8 sm:py-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
              <Globe2 className="h-4 w-4" /> Live market terminal
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Market Intelligence</h1>
            <p className="mt-2 text-sm text-[#a1a1aa]">Monitor your watchlist, price momentum, and the news moving markets.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71717a]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter watchlist"
                className="input-base h-11 w-full pl-10 pr-4 sm:w-60"
              />
            </label>
            <button
              type="button"
              onClick={() => loadMarketData({ manual: true })}
              disabled={refreshing || !FINNHUB_KEY}
              className="btn-secondary flex h-11 items-center justify-center gap-2 px-4 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        <section className="relative mb-7 overflow-hidden rounded-3xl border border-blue-400/20 bg-gradient-to-br from-[#172554] via-[#111827] to-[#17102e] p-6 shadow-[0_20px_60px_rgba(30,64,175,0.18)] sm:p-8">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-56 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="relative grid gap-7 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-blue-200"><TrendingUp className="h-4 w-4" /> Market pulse</div>
              <h2 className="max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">A clearer view of what is moving your portfolio.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100/70">Real-time quotes and curated headlines from Finnhub, refreshed automatically every minute.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:min-w-80">
              <PulseMetric label="Advancing" value={quotes.length ? `${advancing}/${quotes.length}` : "—"} tone="text-emerald-300" />
              <PulseMetric label="Average move" value={quotes.length ? `${averageMove >= 0 ? "+" : ""}${averageMove.toFixed(2)}%` : "—"} tone={averageMove >= 0 ? "text-emerald-300" : "text-rose-300"} />
            </div>
          </div>
        </section>

        {error && <div className="mb-6 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">{error}</div>}

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Watchlist</h2>
          <span className="flex items-center gap-1.5 text-xs text-[#71717a]"><Clock3 className="h-3.5 w-3.5" />{lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Waiting for data"}</span>
        </div>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading ? Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-48 animate-shimmer rounded-2xl border border-[#27272a]" />) : displayedQuotes.map((quote, index) => <QuoteCard key={quote.symbol} quote={quote} index={index} />)}
        </section>

        {!loading && !error && displayedQuotes.length === 0 && <div className="rounded-2xl border border-dashed border-[#3f3f46] px-6 py-12 text-center text-sm text-[#a1a1aa]">No matching stocks in this watchlist.</div>}

        <div className="mt-10 mb-4 flex items-center gap-2"><Newspaper className="h-5 w-5 text-violet-400" /><h2 className="text-lg font-semibold">Market headlines</h2></div>
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {loading ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-40 animate-shimmer rounded-2xl border border-[#27272a]" />) : news.map((story, index) => <NewsCard key={story.id || story.url || index} story={story} />)}
        </section>
      </div>
    </div>
  );
}

function PulseMetric({ label, value, tone }) {
  return <div className="rounded-2xl border border-white/10 bg-black/10 p-4 backdrop-blur-sm"><p className="text-xs font-medium uppercase tracking-wider text-blue-100/60">{label}</p><p className={`mt-1 text-2xl font-semibold ${tone}`}>{value}</p></div>;
}

function QuoteCard({ quote, index }) {
  const positive = Number(quote.dp) >= 0;
  const change = Number(quote.d) || 0;
  const percent = Number(quote.dp) || 0;
  return <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} whileHover={{ y: -3 }} className="group rounded-2xl border border-[#27272a] bg-[#121214] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.18)] transition-colors hover:border-[#3f3f46]">
    <div className="flex items-start justify-between gap-4"><div><p className="text-base font-semibold">{quote.name}</p><p className="mt-0.5 font-mono text-xs text-[#71717a]">{quote.symbol}</p></div><div className={`flex h-9 w-9 items-center justify-center rounded-xl ${positive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>{positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}</div></div>
    <div className="mt-6 flex items-end justify-between"><p className="font-mono text-2xl font-semibold tracking-tight">{money.format(quote.c)}</p><p className={`rounded-lg px-2 py-1 font-mono text-xs font-semibold ${positive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>{positive ? "+" : ""}{percent.toFixed(2)}%</p></div>
    <div className="mt-5 grid grid-cols-3 border-t border-white/5 pt-4 text-xs"><Metric label="Open" value={money.format(quote.o)} /><Metric label="Day high" value={money.format(quote.h)} /><Metric label="Change" value={`${change >= 0 ? "+" : ""}${number.format(change)}`} align="right" /></div>
  </motion.article>;
}

function Metric({ label, value, align = "left" }) {
  return <div className={`min-w-0 ${align === "right" ? "text-right" : ""}`}><p className="text-[#71717a]">{label}</p><p className="mt-1 truncate font-mono text-[#d4d4d8]">{value}</p></div>;
}

function NewsCard({ story }) {
  const published = story.datetime ? new Date(story.datetime * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Latest";
  return <article className="group rounded-2xl border border-[#27272a] bg-[#121214] p-5 transition-colors hover:border-[#3f3f46]"><div className="flex items-center justify-between gap-4 text-xs"><span className="font-medium text-violet-300">{story.source || "Market news"}</span><span className="text-[#71717a]">{published}</span></div><h3 className="mt-3 line-clamp-2 text-base font-semibold leading-6 text-[#f4f4f5]">{story.headline}</h3>{story.summary && <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#a1a1aa]">{story.summary}</p>}{story.url && <a href={story.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 hover:text-blue-300">Read story <ExternalLink className="h-3.5 w-3.5" /></a>}</article>;
}

export { MarketIntelligence };
