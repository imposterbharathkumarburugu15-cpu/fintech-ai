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
// AI Chat Endpoint
// ===============================
app.post("/api/chat", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required.",
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is missing.",
      });
    }

    const systemInstruction = `
You are FinPilot AI, an intelligent financial copilot.

Your responsibilities:
- Analyze expenses
- Explain stocks
- Compare companies
- Help users understand financial concepts
- Generate financial insights
- Suggest budgeting improvements
- Explain investment risks

Rules:
- Never guarantee investment returns.
- Never recommend illegal financial activity.
- Be concise and professional.
- Use bullet points whenever possible.
- Explain financial terms in simple language.
`;

    const response = await openai.responses.create({
      model: "gpt-4.1", // Change to gpt-5.6 if your account has access
      instructions: systemInstruction,
      input: prompt,
    });

    return res.json({
      text: response.output_text,
    });
  } catch (error: any) {
    console.error("OpenAI Error:", error);

    return res.status(500).json({
      error: error?.message || "Internal Server Error",
    });
  }
});

// ===============================
// Start Server
// ===============================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
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