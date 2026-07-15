import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, X, Sparkles, RotateCcw, Copy, Check, BarChart2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { cn } from "../lib/utils";

const SUGGESTED_PROMPTS = [
  { label: "Analyze my expenses", icon: <BarChart2 className="w-4 h-4" /> },
  { label: "How to build an emergency fund?", icon: <Sparkles className="w-4 h-4" /> },
  { label: "Compare Apple vs Microsoft stock", icon: <BarChart2 className="w-4 h-4" /> },
];

function PremiumTypingIndicator() {
  return (
    <div className="flex gap-4 max-w-[85%] animate-fade-in-up">
      <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.15)] mt-1">
        <Bot className="w-5 h-5 text-[#3b82f6]" />
      </div>
      <div className="px-5 py-4 rounded-3xl rounded-tl-sm bg-[#18181b]/80 backdrop-blur-md border border-[#27272a] flex items-center gap-1.5 min-h-[48px]">
        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }} className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut", delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut", delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
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

function WelcomeScreen({ onPromptClick }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center flex-1 px-6 pb-8"
    >
      <div className="relative mb-6 group">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#18181b] to-[#09090b] border border-[#27272a] flex items-center justify-center shadow-2xl relative z-10 group-hover:border-[#3b82f6]/50 transition-colors duration-500">
          <Bot className="w-10 h-10 text-white" />
        </div>
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 z-0" />
      </div>

      <h2 className="text-white font-bold text-2xl mb-2 tracking-tight text-center">Hi Bharath, I'm FinPilot.</h2>
      <p className="text-[#a1a1aa] text-[15px] text-center mb-8 max-w-[260px] leading-relaxed">
        Your dedicated AI financial strategist. How can I help you optimize your money today?
      </p>

      <div className="w-full space-y-3">
        {SUGGESTED_PROMPTS.map((p, i) => (
          <motion.button
            key={p.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onPromptClick(p.label)}
            className="w-full text-left flex items-center justify-between px-5 py-4 rounded-2xl bg-[#121214] border border-[#27272a] hover:border-[#3b82f6]/40 hover:bg-[#18181b] transition-all group shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="text-[#71717a] group-hover:text-[#3b82f6] transition-colors">
                {p.icon}
              </div>
              <span className="text-[14px] font-medium text-[#a1a1aa] group-hover:text-white transition-colors">{p.label}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#52525b] group-hover:text-white transition-colors opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 duration-300" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function CopilotChat({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);

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
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + "px";
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

    const history = [...messages, userMsg].map(({ role, content }) => ({ role, content }));

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
        const history = [...messages, userMsg].map(({ role, content }) => ({ role, content }));
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Chat Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: "100%", opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
            className="absolute top-4 bottom-4 right-4 w-full max-w-[480px] bg-[#09090b]/95 backdrop-blur-2xl border border-[#27272a] rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#27272a]/50 flex items-center justify-between bg-[#09090b]/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                    <Bot className="w-5 h-5 text-[#3b82f6]" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#22c55e] border-2 border-[#09090b]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-white tracking-tight leading-tight">FinPilot AI</h3>
                  <p className="text-[12px] text-[#a1a1aa] font-medium">Finance Specialist · GPT-4o</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasMessages && (
                  <button
                    onClick={handleClear}
                    className="p-2 text-[#71717a] hover:text-white transition-colors rounded-xl hover:bg-[#18181b]"
                    title="Clear conversation"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-[#71717a] hover:text-white transition-colors rounded-xl hover:bg-[#18181b] bg-[#121214] border border-[#27272a]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col relative bg-gradient-to-b from-[#09090b] to-[#121214]">
              {!hasMessages ? (
                <WelcomeScreen onPromptClick={(p) => { setInput(p); setTimeout(handleSubmit, 50); }} />
              ) : (
                <div className="p-6 space-y-6">
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
                          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-1 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                            <Bot className="w-5 h-5 text-[#3b82f6]" />
                          </div>
                        )}

                        <div className={cn("relative group max-w-[85%]", msg.role === "user" ? "items-end" : "items-start")}>
                          <div
                            className={cn(
                              "px-5 py-4 rounded-3xl text-[14px] leading-relaxed shadow-sm",
                              msg.role === "user"
                                ? "bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white rounded-tr-sm font-medium shadow-[0_4px_20px_rgba(59,130,246,0.25)]"
                                : "bg-[#18181b]/90 backdrop-blur-md border border-[#27272a] text-[#e4e4e7] rounded-tl-sm markdown-body"
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
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-1 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                          <Bot className="w-5 h-5 text-[#3b82f6]" />
                        </div>
                        <div className="max-w-[85%]">
                          <div className="px-5 py-4 rounded-3xl bg-[#18181b]/90 backdrop-blur-md border border-[#3b82f6]/40 text-[#e4e4e7] rounded-tl-sm markdown-body text-[14px] leading-relaxed shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                            <Markdown>{streamingText}</Markdown>
                            <span className="inline-block w-1.5 h-4 bg-[#3b82f6] ml-1 animate-pulse align-middle rounded-full" />
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
            <div className="p-5 border-t border-[#27272a]/50 bg-[#09090b]/90 backdrop-blur-xl shrink-0">
              <form onSubmit={handleSubmit} className="relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask FinPilot a question..."
                  rows={1}
                  className="w-full bg-[#18181b] border border-[#27272a] text-[14px] text-white rounded-2xl pl-5 pr-14 py-4 focus:outline-none focus:border-[#3b82f6] focus:ring-4 focus:ring-[#3b82f6]/10 transition-all placeholder:text-[#71717a] resize-none leading-relaxed custom-scrollbar shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-3 bottom-3 w-10 h-10 flex items-center justify-center bg-white text-black rounded-xl hover:bg-[#e4e4e7] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
              <p className="text-[11px] text-[#52525b] mt-3 text-center font-medium">
                AI responses can be inaccurate. Not financial advice.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export { CopilotChat };
