import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
// AI Chat Endpoint (Standard — with conversation history)
// ===============================
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    if (!process.env.OPENAI_API_KEY) {
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

    if (!process.env.OPENAI_API_KEY) {
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