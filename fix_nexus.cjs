const fs = require('fs');
let code = fs.readFileSync('src/components/NexusAI.jsx', 'utf8');

const handleSubNew = `  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userContent = input.trim();
    const userMsg = { id: Date.now().toString(), role: "user", content: userContent };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setStreamingText("");

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
          const lines = chunk.split("\\n");
          
          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              let parsed;
              try { parsed = JSON.parse(line.slice(6)); } catch(err) {}
              
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
        { id: (Date.now() + 1).toString(), role: "assistant", content: accumulated },
      ]);
      setStreamingText("");
    } catch (err) {
      if (err.name === "AbortError") return;
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: \`⚠️ **Notice**: \${err.message}\` }]);
    } finally {
      setIsLoading(false);
      setStreamingText("");
    }
  };`;

const startIdx = code.indexOf('  const handleSubmit = async (e) => {');
const endIdx = code.indexOf('  const handleKeyDown = (e) => {');

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + handleSubNew + '\\n' + code.substring(endIdx);
  fs.writeFileSync('src/components/NexusAI.jsx', code);
}
