import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import YahooFinance from "yahoo-finance2";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

const yahooFinance = new YahooFinance();

// Initialize Groq Client (using the OpenAI SDK wrapper)
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

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
// AI Chat Endpoint (Standard — using the updated groq reference)
// ===============================
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "GROQ_API_KEY is missing." });
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const text =
      response.choices[0]?.message?.content ||
      "I couldn't generate a response. Please try again.";

    return res.json({ text });
  } catch (error: any) {
    console.error("Groq Chat Error:", error);
    return res
      .status(500)
      .json({ error: error?.message || "Internal Server Error" });
  }
});

// ===============================
// AI Chat Streaming Endpoint (SSE — using the updated groq reference)
// ===============================
app.post("/api/chat/stream", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "GROQ_API_KEY is missing." });
    }

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
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
    console.error("Groq Streaming Error:", error);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ error: error?.message || "Internal Server Error" });
    } else {
      res.write(`data: ${JSON.stringify({ error: error?.message })}\n\n`);
      res.end();
    }
  }
});

// ===============================
// Stock Data Intelligence Endpoint
// ===============================
app.get("/api/stock/:ticker", async (req, res) => {
  try {
    const ticker = req.params.ticker.toUpperCase();

    // 1. Fetch live market data & news from Yahoo Finance
    const quote = await yahooFinance.quote(ticker);
    const searchResults = await yahooFinance.search(ticker);

    if (!quote) {
      return res.status(404).json({ error: "Stock ticker not found" });
    }

    // Clean timestamp processing logic to prevent year distortions
    const cleanNews = (searchResults.news || []).slice(0, 3).map((n: any) => {
      let displayTime = "Recent";
      if (n.providerPublishTime) {
        const timestamp =
          n.providerPublishTime < 1e11
            ? n.providerPublishTime * 1000
            : n.providerPublishTime;
        const diffMs = Date.now() - timestamp;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours < 1) displayTime = "Just now";
        else if (diffHours < 24) displayTime = `${diffHours} hours ago`;
        else displayTime = new Date(timestamp).toLocaleDateString();
      }
      return { headline: n.title, time: displayTime };
    });

    // Extract metrics out safely
    const marketData = {
      name: quote.longName || quote.shortName || ticker,
      ticker: ticker,
      exchange: quote.fullExchangeName || "Unknown",
      sector: quote.sector || "Technology",
      industry: quote.industry || "Consumer Software",
      price: quote.regularMarketPrice || 0,
      change: quote.regularMarketChangePercent || 0,
      positive: (quote.regularMarketChangePercent || 0) >= 0,
      marketCap: quote.marketCap
        ? `${(quote.marketCap / 1e9).toFixed(2)}B`
        : "N/A",
      pe: quote.trailingPE ? quote.trailingPE.toFixed(2) : "N/A",
      divYield: quote.dividendYield
        ? `${(quote.dividendYield * 100).toFixed(2)}%`
        : "0.00%",
      eps: quote.trailingEps ? quote.trailingEps.toFixed(2) : "N/A",
      beta: quote.beta ? quote.beta.toFixed(2) : "N/A",
      revenue: quote.totalRevenue
        ? `${(quote.totalRevenue / 1e9).toFixed(2)}B`
        : "N/A",
      week52: `${quote.fiftyTwoWeekLow || 0} -${quote.fiftyTwoWeekHigh || 0}`,
    };

    // 2. Draft the highly structured AI prompt providing only real facts
    const uniqueSystemPrompt = `You are an elite financial analyst for FinPilot AI. 
Analyze the provided company financial metrics and news context. 
You MUST respond with a single, valid JSON object matching this structure exactly. Do not include markdown code block syntax (like \`\`\`json) in your final output, return raw JSON string text only.

{
  "summary": "A concise 2-3 sentence strategic summary of the business trajectory and market positioning.",
  "sector": "If the provided sector is generic, deduce the true classification. Otherwise use it.",
  "industry": "If the provided industry is generic, deduce the true classification. Otherwise use it.",
  "bull": ["Reason 1", "Reason 2", "Reason 3", "Reason 4"],
  "bear": ["Reason 1", "Reason 2", "Reason 3", "Reason 4"],
  "swot": {
    "strengths": ["Item 1", "Item 2"],
    "weaknesses": ["Item 1", "Item 2"],
    "opportunities": ["Item 1", "Item 2"],
    "threats": ["Item 1", "Item 2"]
  },
  "competitors": [
    {"name": "Competitor 1 Name", "ticker": "TICKER1"},
    {"name": "Competitor 2 Name", "ticker": "TICKER2"},
    {"name": "Competitor 3 Name", "ticker": "TICKER3"}
  ]
}`;

    const userPrompt = `Company: ${marketData.name} (${marketData.ticker})
Sector: ${marketData.sector} | Industry: ${marketData.industry}
Key Metrics: P/E: ${marketData.pe}, Beta: ${marketData.beta}, Market Cap: ${marketData.marketCap}, EPS: ${marketData.eps}
Recent News Context: ${JSON.stringify(cleanNews)}`;

    // 3. Request Llama 3.3 to analyze the numbers via Groq
    const aiCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: uniqueSystemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    let rawContent = aiCompletion.choices[0].message.content || "{}";

    if (rawContent.startsWith("```")) {
      rawContent = rawContent
        .replace(/^```json\s*/i, "")
        .replace(/```$/, "")
        .trim();
    }

    const aiAnalysis = JSON.parse(rawContent);

    // 4. Concurrently fetch basic structural metrics for the 3 competitors suggested by AI
    const enrichmentPromises = (aiAnalysis.competitors || []).map(
      async (comp: any) => {
        try {
          const compQuote = await yahooFinance.quote(comp.ticker);
          return {
            name: comp.name,
            ticker: comp.ticker,
            price: compQuote?.regularMarketPrice || "N/A",
            pe: compQuote?.trailingPE ? compQuote.trailingPE.toFixed(1) : "N/A",
            mktCap: compQuote?.marketCap
              ? `${(compQuote.marketCap / 1e9).toFixed(1)}B`
              : "N/A",
          };
        } catch {
          return { ...comp, price: "N/A", pe: "N/A", mktCap: "N/A" };
        }
      },
    );

    const enrichedCompetitors = await Promise.all(enrichmentPromises);

    // 5. Package all modules into the precise shape required by StockResearch.jsx
    const finalPayload = {
      ...marketData,
      sector: aiAnalysis.sector || marketData.sector,
      industry: aiAnalysis.industry || marketData.industry,
      summary: aiAnalysis.summary || "Analysis unavailable.",
      bull: aiAnalysis.bull || [],
      bear: aiAnalysis.bear || [],
      swot: aiAnalysis.swot || {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
      },
      competitors: enrichedCompetitors,
      news: cleanNews,
    };

    res.json(finalPayload);
  } catch (error: any) {
    console.error("Stock Pipeline Failure:", error);
    res
      .status(500)
      .json({
        error:
          error?.message || "Failed processing financial intelligence asset.",
      });
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
