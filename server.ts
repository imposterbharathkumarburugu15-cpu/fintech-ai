import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import { YahooFinance } from "yahoo-finance2";
import { GoogleGenAI } from "@google/genai";

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

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "PLACEHOLDER",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
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

## STRICT BOUNDARIES (CRITICAL)
You are strictly a financial agent. If the user asks about ANYTHING other than finance, investing, money, markets, or economics (e.g., coding, cooking recipes, general chatting, sports scores, creative writing, etc.), you MUST decline and respond exactly with:
"I am a specialized financial agent. I can only assist with financial questions. What financial topics would you like to explore?"

Do NOT provide any information on non-financial topics.

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

## Tone
Professional, trustworthy, and educational. Never condescending. Treat the user as a financially curious adult.`;

// ===============================
// Rule-based Custom Demo Responses
// ===============================
function getDemoResponse(userMessage: string): string {
  const query = userMessage.trim().toLowerCase();

  if (query.includes("spend") || query.includes("expense") || query.includes("category")) {
    return `### 📊 Expense & Spending Analysis

Based on your transaction data, you have spent a total of **$4,250** so far this month, which is **12% lower** than this time last month! Great job optimizing your budget!

#### 🍕 Top Expense Categories:
| Category | Monthly Spend | Budget Limit | Status |
| :--- | :--- | :--- | :--- |
| **Housing (Rent)** | $2,100 | $2,100 | 🟢 On Track |
| **Dining Out** | $450 | $600 | 🟢 Saved $150 (⬇️ 28% decrease) |
| **Groceries** | $320 | $400 | 🟢 On Track |
| **Utilities** | $280 | $300 | 🟢 On Track |
| **Shopping** | $540 | $400 | 🔴 Over budget by $140 |

#### 💡 Insight and Recommendations:
- **Dining Out Saving**: By reducing restaurant dining, you saved **$150**! Consider routing this directly to your Emergency Fund or systematic investment plan.
- **Shopping Alert**: Shopping is **35% over budget**. Let's review non-essential subscription or impulse buys.

What would you like to explore next? Click an option below or type a custom question!`;
  }

  if (query.includes("nvidia") || query.includes("nvda") || query.includes("stock") || query.includes("market")) {
    return `### 📈 Stock Intelligence & NVIDIA (NVDA) Report

**NVIDIA Corporation (NASDAQ: NVDA)** continues to demonstrate incredible financial strength, driven primarily by the sustained global demand for enterprise artificial intelligence chipsets and advanced GPU architectures.

#### 🔍 Key Stock Metrics:
| Metric | Value | Detail / Comparison |
| :--- | :--- | :--- |
| **Current Price** | **$125.50** | Trading within the 52-week range of $75.00 - $140.76 |
| **PE Ratio (TTM)** | **~70.4** | Reflects premium growth expectations relative to sector average (~32.0) |
| **YTD Return** | **+148.3%** | Significantly outperforming the S&P 500 (+14.2%) |
| **Next Earnings** | **Next Week** | Expected revenue growth consensus of +112% YoY |

#### 🚀 Primary Growth Drivers:
1. **AI & Data Center Dominance**: Blackwell architecture demand remains supply-constrained, ensuring high pricing power and fat gross margins (~75%).
2. **Hyperscaler CAPEX**: Major cloud providers (Google, Microsoft, AWS, Meta) continue to expand AI infrastructure budgets.
3. **Software Moat**: CUDA software platform creates high switching costs, locking enterprise customers into the NVIDIA ecosystem.

#### ⚠️ Relevant Investment Risks:
- **Valuation Risk**: High multiple leaves little margin for error on earnings reports.
- **Geopolitical & Supply Chain**: Production concentration at TSMC in Taiwan poses risk.
- **Competition**: Emerging threats from custom ASICs (Google TPU, Amazon Trainium) and AMD's MI300 series.

Would you like me to analyze technical indicators or look at other tech stocks?`;
  }

  if (query.includes("portfolio") || query.includes("asset") || query.includes("allocation")) {
    return `### 💼 Portfolio Intelligence & Risk Assessment

Your aggregate investment portfolio is valued at **$185,000**, split across major asset classes to balance wealth generation and capital preservation.

#### 📊 Current Asset Allocation:
- **Equities (65%)**: $120,250
- **Bonds (20%)**: $37,000
- **Crypto (10%)**: $18,500
- **Cash & Equivalents (5%)**: $9,250

#### 🩺 Portfolio Diagnostics:
| Check | Status | Rating & Detail |
| :--- | :--- | :--- |
| **Sector Concentration** | ⚠️ Moderate Alert | **35% Tech sector concentration** (high correlation with NVDA/AAPL growth). |
| **Portfolio Beta** | 🟡 1.18 | Slightly more volatile than the broad S&P 500 index (Beta = 1.00). |
| **Sharpe Ratio** | 🟢 2.14 | Exceptional risk-adjusted return metric, driven by strong equity performance. |
| **Diversification Score**| 🟡 Medium | High concentration in Large-Cap US Growth. Underweight in International and Small-Cap. |

#### 🛡️ Actionable Rebalancing Plan:
1. **Lock-In Tech Profits**: Consider trimming 5% from high-flying Tech equities and reallocating to defensive sectors (Consumer Staples or Utilities).
2. **Boost Bond Allocation**: Interest rates are high; lock in yields with intermediate-term treasury or corporate bonds.
3. **Increase SIP**: Maintain systematic purchasing of diversified low-cost broad index funds (e.g., S&P 500 ETF) rather than individual picks.

Select an option below to simulate rebalancing, review cash allocations, or analyze stock research!`;
  }

  if (query.includes("budget") || query.includes("build") || query.includes("income")) {
    return `### 🪙 Custom Budget Builder & Savings Planner

Let's organize your finances using the popular **50/30/20 Budgeting Rule**. Based on a monthly net income of **$8,000**, here is your optimized financial framework:

#### 📊 The 50/30/20 Plan:
- **50% Needs ($4,000)**: Essential living expenses (Rent, utilities, insurance, groceries).
- **30% Wants ($2,400)**: Lifestyle expenses (Dining out, travel, entertainment, subscriptions).
- **20% Savings ($1,600)**: Wealth-building (SIP, emergency fund, stock investments, debt paydown).

#### 🗂️ Zero-Based Allocation Model:
| Category | Recommended Allocation | Current Status | Recommendation |
| :--- | :--- | :--- | :--- |
| **Needs (Essential)** | **$4,000** | $4,120 | 🟢 Optimal (2% over, acceptable) |
| **Wants (Lifestyle)** | **$2,400** | $2,530 | 🟡 Trim $130 from shopping & leisure |
| **Savings (SIP)** | **$1,600** | $1,350 | 🔴 Underfunded. Increase monthly SIP by ₹20,000 ($250) |

#### 💸 Step-by-Step Action Items:
1. **Automate Savings**: Set up an auto-debit on the 1st of every month to route $1,600 directly to investments before you spend.
2. **Subscription Audit**: Save $45/month immediately by cancelling inactive streaming plans.
3. **Emergency Fund Buffer**: Ensure you have **$24,000** (6 months of needs) in a High-Yield Savings Account (HYSA).

Click an option below or ask me how to pay down debt or adjust this plan for your specific income!`;
  }

  if (query.includes("tax") || query.includes("80c") || query.includes("indian") || query.includes("ppf") || query.includes("elss") || query.includes("sip")) {
    return `### 🇮🇳 Indian Tax Saving & Mutual Fund Guide (FY 2026-27)

Under the Indian Income Tax Act, Section 80C offers substantial tax-saving avenues of up to **₹1,50,000 per annum**. Let's review options to optimize your tax liabilities.

#### 🛡️ Section 80C Tax-Saving Options:
| Scheme | Lock-in Period | Historic Returns | Risk Profile | Best Suited For |
| :--- | :--- | :--- | :--- | :--- |
| **ELSS (Mutual Funds)** | **3 Years** (Shortest) | **12% - 15%** | High (Equity) | Wealth generation with tax benefit |
| **PPF (Govt Scheme)** | **15 Years** | **7.1%** (Tax-Free) | Risk-Free | Long-term risk-free compounding |
| **NPS (Pension System)** | **Till Age 60** | **9% - 11%** | Moderate | Retirement & extra ₹50k tax deduction (80CCD) |
| **SSY (Sukanya Samriddhi)**| **Till Age 21** | **8.2%** (Tax-Free) | Risk-Free | Long-term savings for daughter |

#### 📈 Systematic Investment Plan (SIP) Compounding Projections:
If you start a monthly SIP of **₹10,000** with an expected annual return of **12%**, here is your projected growth:
- **5 Years**: Invested ₹6,00,000 ➡️ Future Value: **₹8,24,863** (Gain: ₹2.24 Lakhs)
- **10 Years**: Invested ₹12,00,000 ➡️ Future Value: **₹23,23,390** (Gain: ₹11.23 Lakhs)
- **15 Years**: Invested ₹18,00,000 ➡️ Future Value: **₹50,45,760** (Gain: ₹32.45 Lakhs)

#### 📝 Capital Gains Taxation:
- **Short-Term Capital Gains (STCG)**: 20% on equity sold within 1 year.
- **Long-Term Capital Gains (LTCG)**: 12.5% on equity profits exceeding ₹1.25 Lakhs per year.

Click an option below or ask me to calculate a custom SIP projection for your goals!`;
  }

  return `### 🧭 Welcome to FinPilot AI

I am your intelligent financial copilot here to help you navigate and optimize your financial journey.

Here are some popular, deep-dive financial topics and reports I can generate instantly. Click any option below or ask a specific question:

- **Analyze Spending Trends**: Get a complete category breakdown, subscription audit, and savings tips.
- **Explain NVIDIA's Growth**: See valuation metrics, market drivers, risk profiles, and competitive analysis.
- **Review Portfolio Performance**: Review sector concentrations, asset split, risk betas, and Sharpe ratios.
- **Build a Monthly Budget**: Establish a 50/30/20 plan, auto-debit strategies, and emergency fund recommendations.
- **Tax Planning & Indian Finance**: Learn about Section 80C tax-saving schemes, SIP projections, and capital gains rules.

*What financial topic would you like to explore today?*`;
}

// ===============================
// AI Chat Endpoint (Standard — supports Demo, Ollama, Gemini, and Groq)
// ===============================
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, mode = "demo", ollamaHost = "http://127.0.0.1:11434", ollamaModel = "llama3" } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const lastMessageObj = messages[messages.length - 1];
    const userMessage = lastMessageObj?.content?.toLowerCase() || "";

    // 1. DEMO MODE
    if (mode === "demo") {
      const demoText = getDemoResponse(userMessage);
      return res.json({ text: demoText });
    }

    // 2. OLLAMA MODE
    if (mode === "ollama") {
      try {
        const ollamaResponse = await fetch(`${ollamaHost}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: ollamaModel,
            messages: messages.map((m: any) => ({
              role: m.role === "assistant" ? "assistant" : "user",
              content: m.content
            })),
            stream: false,
          }),
        });

        if (!ollamaResponse.ok) {
          throw new Error(`Ollama responded with status: ${ollamaResponse.status}`);
        }

        const data = await ollamaResponse.json() as any;
        const text = data?.message?.content || "No response received from Ollama.";
        return res.json({ text });
      } catch (ollamaErr: any) {
        console.warn("Ollama connection failed, falling back silently:", ollamaErr.message);
        const demoText = getDemoResponse(userMessage);
        return res.json({ text: demoText });
      }
    }

    // 3. GROQ MODE (Fallback / Direct usage checking)
    if (mode === "groq") {
      if (!process.env.GROQ_API_KEY) {
        return res.status(500).json({ error: "GROQ_API_KEY is missing." });
      }
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        max_tokens: 1500,
        temperature: 0.7,
      });
      const text = response.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";
      return res.json({ text });
    }

    // 4. GEMINI MODE
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "PLACEHOLDER") {
      const demoText = getDemoResponse(userMessage);
      return res.json({ text: demoText });
    }

    const systemMessages = messages.filter((m: any) => m.role === "system").map((m: any) => m.content).join("\n\n");
    const combinedSystemPrompt = systemMessages ? `${SYSTEM_PROMPT}\n\n${systemMessages}` : SYSTEM_PROMPT;

    const formattedMessages = messages
      .filter((m: any) => m.role !== "system")
      .map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    try {
      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: formattedMessages,
          config: {
            systemInstruction: combinedSystemPrompt,
            temperature: 0.7,
          },
        });
      } catch (firstTryError: any) {
        response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: formattedMessages,
          config: {
            systemInstruction: combinedSystemPrompt,
            temperature: 0.7,
          },
        });
      }

      const text = response.text || "I couldn't generate a response. Please try again.";
      return res.json({ text });
    } catch (geminiError: any) {
      const demoText = getDemoResponse(userMessage);
      return res.json({ text: demoText });
    }
  } catch (error: any) {
    console.error("Express /api/chat Error:", error);
    return res.status(500).json({ error: error?.message || "Internal Server Error" });
  }
});

// ===============================
// AI Chat Streaming Endpoint (SSE — supports Demo, Ollama, Gemini, and Groq)
// ===============================
app.post("/api/chat/stream", async (req, res) => {
  try {
    const { messages, mode = "demo", ollamaHost = "http://127.0.0.1:11434", ollamaModel = "llama3" } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    const lastMessageObj = messages[messages.length - 1];
    const userMessage = lastMessageObj?.content?.toLowerCase() || "";

    // 1. DEMO MODE STREAMING
    if (mode === "demo") {
      const demoText = getDemoResponse(userMessage);
      const words = demoText.split(/(?=\s)/);
      for (const word of words) {
        await new Promise((resolve) => setTimeout(resolve, 8));
        res.write(`data: ${JSON.stringify({ delta: word })}\n\n`);
      }
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

    // 2. OLLAMA MODE STREAMING
    if (mode === "ollama") {
      try {
        const ollamaResponse = await fetch(`${ollamaHost}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: ollamaModel,
            messages: messages.map((m: any) => ({
              role: m.role === "assistant" ? "assistant" : "user",
              content: m.content
            })),
            stream: true,
          }),
        });

        if (!ollamaResponse.ok) {
          throw new Error(`Ollama responded with status: ${ollamaResponse.status}`);
        }

        const reader = ollamaResponse.body;
        if (!reader) {
          throw new Error("Ollama stream body is not readable.");
        }

        const webReader = (reader as any).getReader();
        const decoder = new TextDecoder("utf-8");
        while (true) {
          const { done, value } = await webReader.read();
          if (done) break;
          const text = decoder.decode(value);
          const lines = text.split("\n").filter((l) => l.trim());
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              const textChunk = parsed?.message?.content || "";
              if (textChunk) {
                res.write(`data: ${JSON.stringify({ delta: textChunk })}\n\n`);
              }
            } catch (e) {
              // Ignore partial JSON parsing issues
            }
          }
        }
        res.write("data: [DONE]\n\n");
        res.end();
        return;
      } catch (ollamaErr: any) {
        console.warn("Ollama stream failed, falling back silently:", ollamaErr.message);
        const demoText = getDemoResponse(userMessage);
        const words = demoText.split(/(?=\s)/);
        for (const word of words) {
          await new Promise((resolve) => setTimeout(resolve, 8));
          res.write(`data: ${JSON.stringify({ delta: word })}\n\n`);
        }
        res.write("data: [DONE]\n\n");
        res.end();
        return;
      }
    }

    // 3. GROQ MODE STREAMING
    if (mode === "groq") {
      if (!process.env.GROQ_API_KEY) {
        res.write(`data: ${JSON.stringify({ error: "GROQ_API_KEY is missing." })}\n\n`);
        res.end();
        return;
      }
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
      return;
    }

    // 4. GEMINI MODE STREAMING
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "PLACEHOLDER") {
      const demoText = getDemoResponse(userMessage);
      const words = demoText.split(/(?=\s)/);
      for (const word of words) {
        await new Promise((resolve) => setTimeout(resolve, 8));
        res.write(`data: ${JSON.stringify({ delta: word })}\n\n`);
      }
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

    const systemMessages = messages.filter((m: any) => m.role === "system").map((m: any) => m.content).join("\n\n");
    const combinedSystemPrompt = systemMessages ? `${SYSTEM_PROMPT}\n\n${systemMessages}` : SYSTEM_PROMPT;

    const formattedMessages = messages
      .filter((m: any) => m.role !== "system")
      .map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    try {
      let stream;
      try {
        stream = await ai.models.generateContentStream({
          model: "gemini-3.5-flash",
          contents: formattedMessages,
          config: {
            systemInstruction: combinedSystemPrompt,
            temperature: 0.7,
          },
        });
      } catch (firstStreamError: any) {
        stream = await ai.models.generateContentStream({
          model: "gemini-3.1-flash-lite",
          contents: formattedMessages,
          config: {
            systemInstruction: combinedSystemPrompt,
            temperature: 0.7,
          },
        });
      }

      for await (const chunk of stream) {
        const delta = chunk.text;
        if (delta) {
          res.write(`data: ${JSON.stringify({ delta })}\n\n`);
        }
      }
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (geminiError: any) {
      const demoText = getDemoResponse(userMessage);
      const words = demoText.split(/(?=\s)/);
      for (const word of words) {
        await new Promise((resolve) => setTimeout(resolve, 8));
        res.write(`data: ${JSON.stringify({ delta: word })}\n\n`);
      }
      res.write("data: [DONE]\n\n");
      res.end();
    }
  } catch (error: any) {
    console.error("Streaming Pipeline Error:", error);
    const errorMessage = error?.message || "Internal Server Error";
    if (!res.headersSent) {
      res.status(500).json({ error: errorMessage });
    } else {
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
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

    const cleanNews = (searchResults.news || []).slice(0, 3).map((n: any) => {
      let displayTime = "Recent";
      if (n.providerPublishTime) {
        const timestamp = n.providerPublishTime < 1e11 ? n.providerPublishTime * 1000 : n.providerPublishTime;
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
      marketCap: quote.marketCap ? `${(quote.marketCap / 1e9).toFixed(2)}B` : "N/A",
      pe: quote.trailingPE ? quote.trailingPE.toFixed(2) : "N/A",
      divYield: quote.dividendYield ? `${(quote.dividendYield * 100).toFixed(2)}%` : "0.00%",
      eps: quote.trailingEps ? quote.trailingEps.toFixed(2) : "N/A",
      beta: quote.beta ? quote.beta.toFixed(2) : "N/A",
      revenue: quote.totalRevenue ? `${(quote.totalRevenue / 1e9).toFixed(2)}B` : "N/A",
      week52: `${quote.fiftyTwoWeekLow \vert{}\vert{} 0} -${quote.fiftyTwoWeekHigh || 0}`,
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
      rawContent = rawContent.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    const aiAnalysis = JSON.parse(rawContent);

    // 4. Concurrently fetch basic structural metrics for the 3 competitors suggested by AI
    const enrichmentPromises = (aiAnalysis.competitors || []).map(async (comp: any) => {
      try {
        const compQuote = await yahooFinance.quote(comp.ticker);
        return {
          name: comp.name,
          ticker: comp.ticker,
          price: compQuote?.regularMarketPrice || "N/A",
          pe: compQuote?.trailingPE ? compQuote.trailingPE.toFixed(1) : "N/A",
          mktCap: compQuote?.marketCap ? `${(compQuote.marketCap / 1e9).toFixed(1)}B` : "N/A",
        };
      } catch {
        return { ...comp, price: "N/A", pe: "N/A", mktCap: "N/A" };
      }
    });

    const enrichedCompetitors = await Promise.all(enrichmentPromises);

    // 5. Package all modules into the precise shape required by StockResearch.jsx
    const finalPayload = {
      ...marketData,
      sector: aiAnalysis.sector || marketData.sector,
      industry: aiAnalysis.industry || marketData.industry,
      summary: aiAnalysis.summary || "Analysis unavailable.",
      bull: aiAnalysis.bull || [],
      bear: aiAnalysis.bear || [],
      swot: aiAnalysis.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] },
      competitors: enrichedCompetitors,
      news: cleanNews,
    };

    res.json(finalPayload);
  } catch (error: any) {
    console.error("Stock Pipeline Failure:", error);
    res.status(500).json({ error: error?.message || "Failed processing financial intelligence asset." });
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