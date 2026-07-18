import express from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT) || 3000;

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing.");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const SYSTEM_PROMPT = `
You are Nexus AI, a finance-only AI assistant.

Answer only finance, investing, banking, taxation, budgeting,
portfolio analysis, stocks, mutual funds, ETFs and crypto.

If a user asks a non-financial question, reply:
"I am Nexus AI, a specialized financial assistant. I can only answer finance-related questions."
`;

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    const contents = messages
      .filter((m:any) => m.role !== "system")
      .map((m:any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (err:any) {
    res.status(500).json({ error: err.message });
  }
});

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const dist = path.join(process.cwd(), "dist");
    app.use(express.static(dist));
    app.get("*", (_, res) =>
      res.sendFile(path.join(dist, "index.html"))
    );
  }

  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
}

start();
