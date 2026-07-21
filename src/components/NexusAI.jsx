import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Send,
  Sparkles,
  User,
  Copy,
  Check,
  RefreshCw,
  BarChart2,
  TrendingUp,
  Lightbulb,
  Wallet,
  ArrowRight,
  MessageSquare,
  Settings,
  Sliders,
} from "lucide-react";
import Markdown from "react-markdown";

const suggestions = [
  { icon: BarChart2, label: "Analyze my spending trends" },
  { icon: TrendingUp, label: "Explain NVIDIA's growth" },
  { icon: Wallet, label: "Review portfolio performance" },
  { icon: Lightbulb, label: "Build a budget for next month" },
];

function Message({ msg, isStreaming }) {
  const isUser = msg.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex w-full px-6 py-6 ${isUser ? "" : "bg-[#121214] border-y border-white/5"}`}
    >
      <div className="flex gap-4 max-w-3xl mx-auto w-full">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 border border-white/10 shadow-lg">
            <User className="w-4 h-4 text-white" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shrink-0 border border-white/10 shadow-lg relative overflow-hidden">
            <Sparkles className="w-4 h-4 text-white z-10" />
            <div className="absolute inset-0 bg-white/20 animate-pulse mix-blend-overlay"></div>
          </div>
        )}

        <div className="flex-1 min-w-0 mt-1">
          {isUser ? (
            <p className="text-[#fafafa] font-medium leading-relaxed">
              {msg.content}
            </p>
          ) : (
            <div className="text-[15px] text-[#e4e4e7] leading-relaxed [&>p]:mb-4 [&>ul]:mb-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:mb-4 [&>ol]:list-decimal [&>ol]:pl-6 [&>pre]:bg-[#0A0A0A] [&>pre]:border [&>pre]:border-white/10 [&>pre]:rounded-xl [&>pre]:p-4 [&>pre]:overflow-x-auto [&>h1]:text-white [&>h1]:font-semibold [&>h1]:mb-2 [&>h1]:mt-6 [&>h2]:text-white [&>h2]:font-semibold [&>h2]:mb-2 [&>h2]:mt-6 [&>h3]:text-white [&>h3]:font-semibold [&>h3]:mb-2 [&>h3]:mt-6 [&>code]:text-indigo-300 [&>code]:bg-indigo-500/10 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded-md [&>strong]:text-white [&>table]:w-full [&>table]:border-collapse [&>table]:my-4 [&>table_th]:border-b [&>table_th]:border-white/10 [&>table_th]:pb-2 [&>table_th]:text-left [&>table_th]:text-white [&>table_td]:border-b [&>table_td]:border-white/5 [&>table_td]:py-2 [&>table_td]:text-[#e4e4e7]">
              <Markdown>{msg.content}</Markdown>
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-purple-400 ml-1 animate-pulse align-middle" />
              )}
            </div>
          )}

          {!isUser && !isStreaming && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-[#a1a1aa] hover:text-white hover:bg-white/5 transition-colors"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function NexusChat({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");

  // AI settings
  const [chatMode, setChatMode] = useState(
    () => localStorage.getItem("finpilot_chat_mode") || "groq",
  );
  const [ollamaHost, setOllamaHost] = useState(
    () =>
      localStorage.getItem("finpilot_ollama_host") || "http://127.0.0.1:11434",
  );
  const [ollamaModel, setOllamaModel] = useState(
    () => localStorage.getItem("finpilot_ollama_model") || "llama3",
  );
  const [showSettings, setShowSettings] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, isOpen]);

  // Persist configurations
  useEffect(() => {
    localStorage.setItem("finpilot_chat_mode", chatMode);
  }, [chatMode]);

  useEffect(() => {
    localStorage.setItem("finpilot_ollama_host", ollamaHost);
  }, [ollamaHost]);

  useEffect(() => {
    localStorage.setItem("finpilot_ollama_model", ollamaModel);
  }, [ollamaModel]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  // Main chat submit handler
  const triggerChat = async (promptText) => {
    if (!promptText.trim() || isLoading) return;

    const userContent = promptText.trim();
    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: userContent,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setStreamingText("");

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    history.push({ role: "user", content: userContent });

    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch(`/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          mode: chatMode,
          ollamaHost: ollamaHost,
          ollamaModel: ollamaModel,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to connect to AI service.");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulated = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              let parsed;
              try {
                parsed = JSON.parse(line.slice(6));
              } catch (err) {}

              if (parsed && parsed.error) {
                throw new Error(parsed.error);
              } else if (parsed && parsed.delta) {
                accumulated += parsed.delta;
                setStreamingText(accumulated);
              }
            }
          }
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: accumulated,
        },
      ]);
      setStreamingText("");
    } catch (err) {
      if (err.name === "AbortError") return;
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `⚠️ **Notice**: ${err.message}`,
        },
      ]);
    } finally {
      setIsLoading(false);
      setStreamingText("");
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    const prompt = input;
    setInput("");
    triggerChat(prompt);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestionClick = (text) => {
    triggerChat(text);
  };

  const handleOptionSelect = (text) => {
    triggerChat(text);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.5 }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
              mass: 0.8,
            }}
            className="fixed right-0 top-0 h-full w-full sm:w-[480px] lg:w-[680px] bg-[#0A0A0A] border-l border-white/5 z-[101] flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border border-white/10">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-[15px] tracking-tight">
                    Nexus AI
                  </h2>
                  <p className="text-[#a1a1aa] text-[12px] font-medium leading-none mt-1">
                    Your Financial Copilot
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/5 text-[#a1a1aa] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto scrollbar-hide relative bg-[#0A0A0A]">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 pb-32">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/20 border border-white/10"
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="text-center mb-10"
                  >
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-purple-200 mb-4 tracking-tight">
                      Good Morning, Maya
                    </h1>
                    <p className="text-[#a1a1aa] text-[15px] max-w-sm mx-auto leading-relaxed">
                      I'm Nexus AI, your intelligent financial copilot. I help
                      you understand expenses, investments, taxes, savings, and
                      market intelligence.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="w-full max-w-lg space-y-3"
                  >
                    {suggestions.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(item.label)}
                        className="w-full flex items-center justify-between p-4 rounded-xl bg-[#121214] border border-white/5 hover:border-indigo-500/30 hover:bg-[#18181b] transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#27272a] flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                            <item.icon className="w-4 h-4 text-[#a1a1aa] group-hover:text-indigo-400" />
                          </div>
                          <span className="text-[14px] font-medium text-[#e4e4e7] group-hover:text-white transition-colors">
                            {item.label}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#52525b] group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </motion.div>
                </div>
              ) : (
                <div className="flex flex-col pb-6 pt-2">
                  {messages.map((msg, i) => (
                    <Message key={msg.id || i} msg={msg} />
                  ))}
                  {streamingText && (
                    <Message
                      msg={{ role: "assistant", content: streamingText }}
                      isStreaming={true}
                    />
                  )}
                  {isLoading && !streamingText && (
                    <div className="flex w-full px-6 py-6 bg-[#121214] border-y border-white/5">
                      <div className="flex gap-4 max-w-3xl mx-auto w-full">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shrink-0 border border-white/10 relative overflow-hidden">
                          <Sparkles className="w-4 h-4 text-white z-10" />
                        </div>
                        <div className="flex items-center h-8">
                          <div className="flex gap-1.5">
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{
                                repeat: Infinity,
                                duration: 1,
                                delay: 0,
                              }}
                              className="w-2 h-2 rounded-full bg-indigo-500"
                            />
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{
                                repeat: Infinity,
                                duration: 1,
                                delay: 0.2,
                              }}
                              className="w-2 h-2 rounded-full bg-purple-500"
                            />
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{
                                repeat: Infinity,
                                duration: 1,
                                delay: 0.4,
                              }}
                              className="w-2 h-2 rounded-full bg-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interactive Options list at the bottom of active chat (only when not loading or streaming) */}
                  {!isLoading && !streamingText && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="px-6 py-6 max-w-3xl mx-auto w-full flex flex-col gap-3"
                    >
                      <p className="text-xs text-[#a1a1aa] font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                        Interactive Reports & Actions:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: "Analyze Spending Trends", icon: "📊" },
                          { label: "Explain NVIDIA's Growth", icon: "📈" },
                          { label: "Review Portfolio Performance", icon: "💼" },
                          { label: "Build a Monthly Budget", icon: "🪙" },
                          {
                            label: "Tax Planning & Indian Finance",
                            icon: "🇮🇳",
                          },
                        ].map((opt) => (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => handleOptionSelect(opt.label)}
                            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#121214] border border-white/5 hover:border-indigo-500/40 hover:bg-[#18181b] text-xs text-[#e4e4e7] hover:text-white transition-all font-medium active:scale-95 shadow-lg"
                          >
                            <span>{opt.icon}</span>
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent shrink-0">
              <form
                onSubmit={handleSubmit}
                className="max-w-3xl mx-auto relative group"
              >
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20 opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-500"></div>
                <div className="relative flex items-end gap-2 bg-[#121214] border border-[#27272a] group-focus-within:border-indigo-500/50 rounded-2xl p-2 shadow-lg transition-colors">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Nexus AI anything about your finances..."
                    className="w-full max-h-[200px] bg-transparent text-[#fafafa] placeholder:text-[#71717a] text-[15px] resize-none focus:outline-none px-3 py-3 scrollbar-hide leading-relaxed"
                    rows="1"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95 mb-1 mr-1"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
                <div className="text-center mt-3">
                  <span className="text-[11px] text-[#52525b]">
                    Powered by Groq Llama 3.3 Engine &amp; High-Fidelity
                    Intelligence Models
                  </span>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
