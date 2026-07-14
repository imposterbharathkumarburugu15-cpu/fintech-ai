import { useState, useRef, useEffect } from "react";
import { Send, Bot, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { cn } from "../lib/utils";
function CopilotChat({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "assistant",
      content: `# Welcome to FinPilot AI

      I'm your AI Financial Copilot.

      I  can help you with:

      • Expense analysis

      • Stock research

      • Portfolio insights

      • Budget planning

      • Financial reports

      How can I help you today?`
    }
  ]);
  <div className="flex flex-wrap gap-2 mb-4">
    {[
    "Analyze my expenses",
    "Compare Apple vs Microsoft",
    "Explain NVIDIA stock",
    "Create a monthly budget"
     ].map((item) => (
    <button
      key={item}
      onClick={() => setInput(item)}
      className="px-3 py-2 rounded-lg bg-[#18181b] border border-[#27272a] hover:border-[#3b82f6] text-xs text-[#d4d4d8]"
    >
      {item}
    </button>))}
  </div>
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isOpen]);
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!input.trim() || isLoading) return;

  const userMsg = {
    id: Date.now().toString(),
    role: "user",
    content: input.trim(),
  };

  setMessages((prev) => [...prev, userMsg]);
  setInput("");
  setIsLoading(true);

  try {
    const API_URL = import.meta.env.VITE_API_URL;

    const res = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: userMsg.content,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText);
    }

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.text,
      },
    ]);
  } catch (err) {
    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `❌ ${err.message}`,
      },
    ]);
  } finally {
    setIsLoading(false);
  }
};
  return <AnimatePresence>
      {isOpen && <motion.div
    initial={{ x: "100%", opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: "100%", opacity: 0 }}
    transition={{ type: "spring", damping: 25, stiffness: 200 }}
    className="absolute top-0 right-0 h-full w-96 bg-[#09090b] border-l border-[#27272a] shadow-2xl flex flex-col z-50"
  >
          <div className="p-4 border-b border-[#27272a] flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-[#3b82f6]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">FinPilot AI</h3>
                <p className="text-xs text-[#a1a1aa] flex items-center gap-1">
                  <span className="flex w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                  Connected
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-[#71717a] hover:text-white transition-colors rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 z-10">
            <AnimatePresence initial={false}>
              {messages.map((msg) => <motion.div
    key={msg.id}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn("flex gap-3 max-w-[85%]", msg.role === "user" ? "ml-auto" : "")}
  >
                  {msg.role === "assistant" && <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-[#a1a1aa]" />
                    </div>}
                  <div
    className={cn(
      "p-3 rounded-xl text-sm leading-relaxed",
      msg.role === "user" ? "bg-[#3b82f6] text-white rounded-tr-sm" : "bg-[#18181b] border border-[#27272a] text-[#e4e4e7] rounded-tl-sm markdown-body"
    )}
  >
                    {msg.role === "user" ? msg.content : <Markdown>{msg.content}</Markdown>}
                  </div>
                </motion.div>)}
              {isLoading && <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex gap-3 max-w-[85%]"
  >
                  <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-[#a1a1aa]" />
                  </div>
                  <div className="p-3 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center gap-2 text-[#a1a1aa] rounded-tl-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs">Analyzing...</span>
                  </div>
                </motion.div>}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-[#27272a] z-10">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <input
    type="text"
    value={input}
    onChange={(e) => setInput(e.target.value)}
    placeholder="Ask about expenses, stocks, budgets or investments..."
    className="w-full bg-[#18181b] border border-[#27272a] text-sm text-white rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all placeholder:text-[#71717a]"
  />
              <button
    type="submit"
    disabled={!input.trim() || isLoading}
    className="absolute right-2 w-8 h-8 flex items-center justify-center bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </motion.div>}
    </AnimatePresence>;
}
export {
  CopilotChat
};
