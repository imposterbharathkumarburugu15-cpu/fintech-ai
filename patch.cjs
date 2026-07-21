const fs = require('fs');
let code = fs.readFileSync('src/components/NexusAI.jsx', 'utf8');

const mockFunction = `
const mockGeminiStream = async (userContent, onChunk) => {
  const responses = [
    "I'd be happy to help you analyze that! ",
    "Based on your recent financial data and portfolio allocation, ",
    "it looks like you have a strong concentration in the **Tech sector (35%)**, especially considering the upcoming **NVIDIA earnings report**. ",
    "\n\nHere is a quick breakdown of your current allocation:\n\n",
    "| Sector | Allocation | Performance (YTD) |\n|---|---|---|\n| Tech | 35% | +14.2% |\n| Finance | 20% | +5.1% |\n| Healthcare | 15% | +2.4% |\n\n",
    "If you'd like, I can help you model some rebalancing scenarios or analyze your discretionary spending to free up more capital for your emergency fund. ",
    "What would you like to explore next?"
  ];
  
  if (userContent.toLowerCase().includes("spend")) {
    responses.length = 0;
    responses.push(
      "Let's take a look at your spending trends for this month. ",
      "You've spent a total of **$4,250** so far, which is 12% lower than this time last month! ",
      "\n\nHere are your top 3 categories:\n",
      "- **Housing**: $2,100\n",
      "- **Dining**: $450 (⬇️ 28% decrease)\n",
      "- **Groceries**: $320\n\n",
      "Great job cutting back on dining out! Would you like to adjust your budget for next month based on these new habits?"
    );
  }

  for (const chunk of responses) {
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 300));
    onChunk(chunk);
  }
};
`;

const handleSubOriginal = `  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userContent = input.trim();
    const userMsg = { id: Date.now().toString(), role: "user", content: userContent };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const history = messages.map(m => ({ role: m.role, content: m.content }));
    history.push({ role: "user", content: userContent });

    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch(\`/api/chat/stream\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        throw new Error("Failed to connect");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulated = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\\n");
          
          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const parsed = JSON.parse(line.slice(6));
                accumulated += parsed.delta;
                setStreamingText(accumulated);
              } catch (err) {}
            }
          }
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
        const res = await fetch(\`/api/chat\`, {
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
        setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: \`Error: \${fallbackErr.message}\` }]);
      }
    } finally {
      setIsLoading(false);
    }
  };`;

const handleSubNew = `  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userContent = input.trim();
    const userMsg = { id: Date.now().toString(), role: "user", content: userContent };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setStreamingText("");

    try {
      let accumulated = "";
      await mockGeminiStream(userContent, (chunk) => {
        accumulated += chunk;
        setStreamingText(accumulated);
      });
      
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: accumulated },
      ]);
      setStreamingText("");
    } catch (err) {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: \`Error: \${err.message}\` }]);
    } finally {
      setIsLoading(false);
    }
  };`;

code = code.replace(handleSubOriginal, handleSubNew);
code = code.replace("function Message({ msg, isStreaming }) {", mockFunction + "\nfunction Message({ msg, isStreaming }) {");

fs.writeFileSync('src/components/NexusAI.jsx', code);
