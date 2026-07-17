import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

type AlertSeverity = "urgent" | "warning" | "info" | "success";

type MarketAlert = {
  id: string;
  category: "Portfolio" | "Market" | "Risk" | "Savings" | "Budget";
  severity: AlertSeverity;
  icon: "zap" | "chart" | "globe" | "target" | "dollar" | "shield" | "trendDown" | "trendUp";
  title: string;
  subtitle: string;
  what: string;
  why: string;
  action: string;
  actionColor: string;
  time: string;
  badgeLabel: string;
  ticker?: string;
  sourceName?: string;
  sourceUrl?: string;
  confidence?: number;
  whyYouSeeThis?: string;
};

type Holding = { symbol: string; name: string; quantity: number; weight: number };

const alertPalette: Record<AlertSeverity, string> = {
  urgent: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
  success: "#22c55e",
};

function severityFromNews(headline: string, sentiment: number): AlertSeverity {
  const text = headline.toLowerCase();
  const highImpactTerms = /lawsuit|investigation|fraud|guidance cut|cuts guidance|misses estimates|recall|bankruptcy|sanction/;
  const riskTerms = /downgrade|warning|decline|falls|drops|weak|risk|probe|slows/;
  if (highImpactTerms.test(text) && sentiment < -0.15) return "urgent";
  if (riskTerms.test(text) || sentiment < -0.25) return "warning";
  return "info";
}

function parseHoldings(value: unknown): Holding[] {
  if (typeof value !== "string") return [];
  try {
    const raw = JSON.parse(value);
    if (!Array.isArray(raw)) return [];
    const holdings = raw.slice(0, 20).flatMap((item) => {
      const symbol = String(item?.symbol || "").trim().toUpperCase();
      const name = String(item?.name || symbol).trim().slice(0, 80);
      const quantity = Number(item?.quantity);
      if (!/^[A-Z0-9._-]{1,20}$/.test(symbol) || !Number.isFinite(quantity) || quantity <= 0) return [];
      return [{ symbol, name, quantity, weight: 0 }];
    });
    const totalQuantity = holdings.reduce((sum, holding) => sum + holding.quantity, 0);
    return holdings.map((holding) => ({ ...holding, weight: Number(((holding.quantity / totalQuantity) * 100).toFixed(1)) }));
  } catch {
    return [];
  }
}

function getHoldingsContext(symbol: string, holdings: Holding[]) {
  return holdings.find((holding) => holding.symbol === symbol || holding.symbol.split(".")[0] === symbol);
}

function buildPortfolioAlerts(holdings: Holding[]): MarketAlert[] {
  return holdings.slice(0, 5).map((holding) => ({
    id: `portfolio-${holding.symbol}`, category: "Portfolio", severity: "info", icon: "target",
    title: `${holding.name} is being monitored`, subtitle: `${holding.quantity} shares · ${holding.symbol}`,
    what: "FinPilot will match market news and risk signals to this holding as new information becomes available.",
    why: `You added ${holding.symbol} to your manual portfolio. It represents ${holding.weight}% of the tracked share count.`,
    action: "Review holding", actionColor: alertPalette.info, time: "Updated now", badgeLabel: "Monitoring", ticker: holding.symbol,
    sourceName: "Your manual portfolio", confidence: 1, whyYouSeeThis: `You own ${holding.quantity} ${holding.symbol} shares.`,
  }));
}

async function getAlphaVantageAlerts(holdings: Holding[]): Promise<MarketAlert[]> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) return [];

  // Alpha Vantage's news endpoint rejects dot-form exchange symbols. Skip those
  // symbols here so an unsupported exchange format cannot break the whole feed.
  const tickers = holdings
    .map((holding) => holding.symbol)
    .filter((symbol) => /^[A-Za-z0-9_-]+$/.test(symbol))
    .join(",");
  if (!tickers) return [];
  const params = new URLSearchParams({ function: "NEWS_SENTIMENT", tickers, limit: "20", apikey: apiKey });
  const response = await fetch(`https://www.alphavantage.co/query?${params}`);
  if (!response.ok) throw new Error(`News provider returned ${response.status}`);
  const payload = await response.json() as { feed?: Array<Record<string, any>>; Note?: string; Information?: string; "Error Message"?: string };
  if (payload.Note || payload.Information || payload["Error Message"]) {
    throw new Error(payload.Note || payload.Information || "News provider request failed");
  }

  return (payload.feed || []).flatMap((article) => {
    const relatedTicker = (article.ticker_sentiment || [])
      .map((entry: Record<string, string>) => entry.ticker)
      .find((ticker: string) => getHoldingsContext(ticker, holdings));
    const holding = relatedTicker ? getHoldingsContext(relatedTicker, holdings) : undefined;
    if (!holding) return [];

    const tickerData = (article.ticker_sentiment || []).find((entry: Record<string, string>) => entry.ticker === relatedTicker);
    const sentiment = Number(tickerData?.ticker_sentiment_score ?? article.overall_sentiment_score ?? 0);
    const severity = severityFromNews(String(article.title || ""), sentiment);
    const confidence = Math.min(0.95, Math.max(0.45, Math.abs(sentiment) + 0.55));
    const category: MarketAlert["category"] = severity === "warning" || severity === "urgent" ? "Risk" : "Market";
    const icon: MarketAlert["icon"] = severity === "urgent" ? "zap" : severity === "warning" ? "chart" : "globe";
    return [{
      id: `news-${article.url || article.time_published || article.title}`,
      category, severity, icon,
      title: article.title || `${holding.name} market update`,
      subtitle: `${holding.symbol} · ${article.source || "Market news"}`,
      what: article.summary || "A market news item matched one of your holdings.",
      why: `This item was matched to ${holding.symbol} and assessed using article sentiment and your portfolio exposure.`,
      action: "Read source", actionColor: alertPalette[severity], time: "Recent", badgeLabel: severity === "urgent" ? "Urgent risk" : severity === "warning" ? "Risk signal" : "Market news",
      ticker: holding.symbol, sourceName: article.source || "Market news", sourceUrl: article.url,
      confidence, whyYouSeeThis: `You own ${holding.quantity} ${holding.symbol} shares (${holding.weight}% of portfolio).`,
    }];
  }).slice(0, 12);
}

// ===============================
// Personalized Market Alerts
// ===============================
app.get("/api/alerts", async (req, res) => {
  const holdings = parseHoldings(req.query.holdings);
  try {
    const liveAlerts = await getAlphaVantageAlerts(holdings);
    const alerts = [...liveAlerts, ...buildPortfolioAlerts(holdings)];
    return res.json({ alerts, source: liveAlerts.length ? "live" : "manual", updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Market alert provider error:", error);
    return res.json({ alerts: buildPortfolioAlerts(holdings), source: "manual", updatedAt: new Date().toISOString() });
  }
});

// Initialize OpenAI
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// ===============================
// Finance-Specialized System Prompt
// ===============================
const SYSTEM_PROMPT = `You are FinPilot AI — an elite AI Financial Copilot built for investors, traders, and everyday users who want to master their financial life.

## Your Expertise
You are a specialist in:
- **Personal Finance**: Budgeting, savings strategies, emergency funds, debt management, net worth tracking
- **Expense Analysis**: Spending patterns, category breakdowns, optimization opportunities, subscription audits
- **Stock Markets**: US markets (NYSE, NASDAQ), Indian markets (NSE, BSE), technical analysis, fundamental analysis
- **Investing**: Mutual funds, ETFs, index funds, SIPs, portfolio allocation, diversification strategies
- **Portfolio Analysis**: Risk assessment, Sharpe ratio, beta, sector concentration, rebalancing
- **Financial Planning**: Retirement planning, tax-efficient investing, insurance, estate planning
- **Crypto**: Bitcoin, Ethereum, major cryptocurrencies, DeFi basics, risk considerations
- **Market Intelligence**: Earnings analysis, macroeconomic indicators, sector trends, geopolitical impact
- **Indian Finance**: SEBI regulations, ELSS funds, PPF, NPS, gold bonds, FD rates, UPI, ITR filing tips

## Response Style
- Be concise, clear, and professional — like a Bloomberg analyst meets a trusted advisor
- Use **bold** for key numbers, percentages, and important terms
- Use bullet points for lists and comparisons
- Use markdown tables for comparisons (e.g., stock A vs stock B)
- Format currency clearly: use $ for USD, ₹ for INR
- Always explain financial jargon in plain language
- When discussing investments, always mention relevant risks
- Never guarantee returns or give specific buy/sell signals
- Never recommend illegal financial activities

## Boundaries
If a user asks about something completely unrelated to finance (cooking recipes, sports scores, creative writing, etc.), respond:
"I'm specialized in finance and investing! I'm happy to help with budgeting, stocks, portfolio analysis, or any financial planning topics. What would you like to explore?"

## Tone
Professional, trustworthy, and educational. Never condescending. Treat the user as a financially curious adult.`;

// ===============================
// AI Chat Endpoint (Standard — with conversation history)
// ===============================
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    if (!openai) {
      return res.status(500).json({ error: "OPENAI_API_KEY is missing." });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const text = response.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";

    return res.json({ text });
  } catch (error: any) {
    console.error("OpenAI Error:", error);
    return res.status(500).json({ error: error?.message || "Internal Server Error" });
  }
});

// ===============================
// AI Chat Streaming Endpoint (SSE)
// ===============================
app.post("/api/chat/stream", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    if (!openai) {
      return res.status(500).json({ error: "OPENAI_API_KEY is missing." });
    }

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    const stream = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 1500,
      temperature: 0.7,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        res.write(`data: ${JSON.stringify({ delta })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    console.error("OpenAI Streaming Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error?.message || "Internal Server Error" });
    } else {
      res.write(`data: ${JSON.stringify({ error: error?.message })}\n\n`);
      res.end();
    }
  }
});

// ===============================
// Start Server
// ===============================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FinPilot AI running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
