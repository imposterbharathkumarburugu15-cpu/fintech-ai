import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, X, RotateCcw, Copy, Check, BarChart2, Briefcase, TrendingUp, Shield, Activity, PieChart, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { cn } from "../lib/utils";

const SUGGESTED_PROMPTS = [
  { label: "Analyze my monthly expenses", icon: <BarChart2 className="w-4 h-4" /> },
  { label: "Build a monthly budget", icon: <PieChart className="w-4 h-4" /> },
  { label: "Research NVIDIA", icon: <TrendingUp className="w-4 h-4" /> },
  { label: "Compare Apple vs Microsoft", icon: <Activity className="w-4 h-4" /> },
  { label: "Review my portfolio", icon: <Briefcase className="w-4 h-4" /> },
  { label: "Generate my financial report", icon: <FileText className="w-4 h-4" /> },
  { label: "Explain mutual funds", icon: <Bot className="w-4 h-4" /> },
  { label: "Create an emergency fund plan", icon: <Shield className="w-4 h-4" /> },
];

const THINKING_MESSAGES = [
  "Analyzing your financial information...",
  "Reviewing spending patterns...",
  "Researching market information...",
  "Evaluating investment opportunities...",
  "Preparing personalized recommendations...",
  "Calculating financial insights...",
  "Understanding your portfolio...",
];

function PremiumTypingIndicator() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % THINKING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-4 max-w-[85%] animate-fade-in-up">
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#18181b] to-[#09090b] border border-[#27272a] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.05)] mt-1">
        <Bot className="w-5 h-5 text-white" />
      </div>
      <div className="px-5 py-4 rounded-3xl rounded-tl-sm bg-[#18181b]/80 backdrop-blur-md border border-[#27272a] flex items-center gap-3 min-h-[52px]">
        <div className="flex items-center gap-1.5">
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }} className="w-1.5 h-1.5 rounded-full bg-white/70" />
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut", delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-white/70" />
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut", delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-white/70" />
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={msgIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="text-[14px] text-[#a1a1aa] font-medium"
          >
            {THINKING_MESSAGES[msgIndex]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-[#27272a] text-[#71717a] hover:text-white"
      title="Copy message"
    >
      {copied ? <Check className="w-4 h-4 text-[#22c55e]" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

function WelcomeScreen({ onPromptClick, userName }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col flex-1 px-8 pb-8 pt-6"
    >
      <div className="mb-8">
        <div className="relative mb-6 group inline-block">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#18181b] to-[#09090b] border border-[#27272a] flex items-center justify-center shadow-2xl relative z-10 group-hover:border-white/20 transition-colors duration-500">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <div className="absolute inset-0 rounded-3xl bg-white blur-xl opacity-5 group-hover:opacity-10 transition-opacity duration-500 z-0" />
        </div>

        <h2 className="text-white font-semibold text-[32px] tracking-[-0.03em] leading-tight mb-4">
          Hi {userName},<br />
          I'm Nexus AI.<br />
          <span className="text-[#a1a1aa]">Your AI Financial Copilot.</span>
        </h2>
        
        <p className="text-[#a1a1aa] text-[16px] leading-relaxed max-w-[400px]">
          I help you understand your money, manage expenses, analyze investments, build smarter budgets, improve savings, research stocks, understand markets, and make better financial decisions.
        </p>
        <p className="text-white font-medium text-[16px] mt-6">
          How can I help you today?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-auto">
        {SUGGESTED_PROMPTS.map((p, i) => (
          <motion.button
            key={p.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onPromptClick(p.label)}
            className="text-left flex items-center gap-3 px-5 py-4 rounded-2xl bg-[#0f0f11] border border-[#27272a] hover:border-[#3f3f46] hover:bg-[#18181b] transition-all group shadow-sm hover:shadow-md"
          >
            <div className="text-[#71717a] group-hover:text-white transition-colors">
              {p.icon}
            </div>
            <span className="text-[14px] font-medium text-[#a1a1aa] group-hover:text-white transition-colors">{p.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function NexusAI({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Mocking profile name retrieval
  const userProfileName = "Sarah";

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, streamingText, scrollToBottom]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userContent = input.trim();
    const userMsg = { id: Date.now().toString(), role: "user", content: userContent };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setStreamingText("");

    const systemPrompt = {
      role: "system",
      content:`
You are Nexus AI, the AI Financial Intelligence Engine powering FinPilot AI.

ROLE
You are a specialized AI Financial Copilot that ONLY provides guidance on finance-related topics.

SUPPORTED TOPICS
Personal Finance, Budgeting, Expenses, Savings, Banking, Credit Cards, Loans, Taxes, Insurance, Retirement Planning, Investing, Stocks, ETFs, Mutual Funds, Bonds, Cryptocurrency, Portfolio Analysis, Asset Allocation, Risk Management, Wealth Management, Financial Planning, Business Finance, Corporate Finance, Market Analysis, Company Financials, Financial Ratios, Cash Flow, Inflation, Interest Rates, Financial Reports, and related economic concepts.

OUT-OF-SCOPE
If a request is unrelated to finance, reply ONLY with:

"I'm Nexus AI, your AI Financial Copilot.

I'm designed exclusively to help with finance-related topics including budgeting, investing, stock research, expenses, savings, portfolio analysis, financial planning, banking, taxation, and market intelligence.

Please ask me a finance-related question and I'll be happy to help."

RESPONSE STYLE
- Use Markdown.
- When appropriate, organize responses into:
  ## Summary
  ## Analysis
  ## Key Insights
  ## Recommendations
  ## Next Steps
- Use bullet points.
- Keep responses concise, professional, and easy to understand.
- Explain financial concepts in simple language.

RULES
- Never fabricate financial data, stock prices, or news.
- If live data is unavailable, clearly state that.
- Mention assumptions when information is incomplete.
- Present both opportunities and risks.
- Never guarantee profits or investment returns.
- Always identify yourself as Nexus AI.
`
    };

    const history = [systemPrompt, ...messages, userMsg].map(({ role, content }) => ({ role, content }));

    try {
      const API_URL = import.meta.env.VITE_API_URL || "";
      abortControllerRef.current = new AbortController();

      const res = await fetch(`${API_URL}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Request failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      setIsLoading(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.delta) {
              accumulated += parsed.delta;
              setStreamingText(accumulated);
            }
          } catch {}
        }
      }

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: accumulated },
      ]);
      setStreamingText("");
    } catch (err) {
      if (err.name === "AbortError") return;
      try {
        const API_URL = import.meta.env.VITE_API_URL || "";
        const res = await fetch(`${API_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });
        const data = await res.json();
        if (data.text) {
          setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: data.text }]);
        } else {
          throw new Error(data.error || "Failed");
        }
      } catch (fallbackErr) {
        setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: `Error: ${fallbackErr.message}` }]);
      }
    } finally {
      setIsLoading(false);
      setStreamingText("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClear = () => {
    abortControllerRef.current?.abort();
    setMessages([]);
    setStreamingText("");
    setIsLoading(false);
    setInput("");
  };

  const hasMessages = messages.length > 0 || !!streamingText;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Minimalist Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
          />

          {/* Premium Chat Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0, scale: 0.98 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: "100%", opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", damping: 35, stiffness: 350, mass: 0.8 }}
            className="fixed top-4 bottom-4 right-4 w-full max-w-[560px] bg-[#09090b] border border-[#27272a] rounded-[32px] shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col z-50 overflow-hidden"
          >
            {/* Elegant Header */}
            <div className="px-8 py-5 border-b border-[#27272a]/50 flex items-center justify-between bg-[#09090b]/80 backdrop-blur-xl shrink-0 z-10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-[16px] bg-[#121214] border border-[#27272a] flex items-center justify-center shadow-inner">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#22c55e] border-[3px] border-[#09090b] animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-[17px] font-semibold text-white tracking-tight leading-none">Nexus AI</h3>
                    <span className="px-1.5 py-0.5 rounded-md bg-[#18181b] border border-[#27272a] text-[10px] font-bold text-[#71717a] tracking-widest uppercase">
                      Powered by GPT-5.6
                    </span>
                  </div>
                  <p className="text-[13px] text-[#a1a1aa] font-medium">AI Financial Copilot</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasMessages && (
                  <button
                    onClick={handleClear}
                    className="p-2.5 text-[#71717a] hover:text-white transition-colors rounded-xl hover:bg-[#18181b]"
                    title="Clear conversation"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2.5 text-[#71717a] hover:text-white transition-colors rounded-xl hover:bg-[#18181b] bg-[#121214] border border-[#27272a]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conversation Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col relative bg-[#09090b]">
              {!hasMessages ? (
                <WelcomeScreen userName={userProfileName} onPromptClick={(p) => { setInput(p); setTimeout(handleSubmit, 50); }} />
              ) : (
                <div className="px-8 py-8 space-y-8">
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", damping: 25, stiffness: 400 }}
                        className={cn(
                          "flex gap-4",
                          msg.role === "user" ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        {msg.role === "assistant" && (
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#18181b] to-[#09090b] border border-[#27272a] flex items-center justify-center shrink-0 mt-1 shadow-sm">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                        )}

                        <div className={cn("relative group max-w-[85%]", msg.role === "user" ? "items-end" : "items-start")}>
                          <div
                            className={cn(
                              "px-6 py-4 rounded-3xl text-[15px] leading-relaxed",
                              msg.role === "user"
                                ? "bg-white text-black rounded-tr-sm font-medium shadow-sm"
                                : "bg-[#121214] border border-[#27272a] text-[#e4e4e7] rounded-tl-sm markdown-body"
                            )}
                          >
                            {msg.role === "user" ? msg.content : <Markdown>{msg.content}</Markdown>}
                          </div>
                          {msg.role === "assistant" && (
                            <div className="flex mt-2 pl-2">
                              <CopyButton text={msg.content} />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}

                    {streamingText && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#18181b] to-[#09090b] border border-[#27272a] flex items-center justify-center shrink-0 mt-1 shadow-sm">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="max-w-[85%]">
                          <div className="px-6 py-4 rounded-3xl bg-[#121214] border border-[#27272a] text-[#e4e4e7] rounded-tl-sm markdown-body text-[15px] leading-relaxed shadow-sm">
                            <Markdown>{streamingText}</Markdown>
                            <span className="inline-block w-2 h-4 bg-white ml-1 animate-pulse align-middle rounded-[2px]" />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {isLoading && !streamingText && <PremiumTypingIndicator />}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="px-8 pb-6 pt-2 bg-[#09090b] shrink-0">
              <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#27272a] to-[#27272a] rounded-[28px] blur opacity-20 group-hover:opacity-40 transition duration-500" />
                <div className="relative bg-[#121214] border border-[#27272a] rounded-[24px] shadow-sm transition-all focus-within:border-white/20 focus-within:ring-4 focus-within:ring-white/5 flex items-end">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Nexus AI anything about your finances..."
                    rows={1}
                    className="w-full bg-transparent text-[15px] text-white pl-6 pr-4 py-5 focus:outline-none placeholder:text-[#52525b] resize-none leading-relaxed custom-scrollbar max-h-[200px]"
                  />
                  <div className="p-3 shrink-0">
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="w-10 h-10 flex items-center justify-center bg-white text-black rounded-xl hover:bg-[#e4e4e7] disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
                    >
                      <Send className="w-5 h-5 ml-0.5" />
                    </button>
                  </div>
                </div>
              </form>
              <p className="text-[12px] text-[#52525b] mt-4 text-center font-medium tracking-wide">
                Nexus AI provides educational financial insights and should not be considered professional financial advice.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export { NexusAI as CopilotChat };
