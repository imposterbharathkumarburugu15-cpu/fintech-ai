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
                accumulated += (parsed.delta || "");
                setStreamingText(accumulated);
              } catch (err) {}
            } else if (line.startsWith("data: ") && line.includes("error")) {
               try {
                 const parsed = JSON.parse(line.slice(6));
                 if (parsed.error) {
                    throw new Error(parsed.error);
                 }
               } catch(e) {}
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

const startIdx = code.indexOf('  const handleSubmit = async (e) => {');
const endIdx = code.indexOf('  const handleKeyDown = (e) => {');

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + handleSubNew + '\n' + code.substring(endIdx);
  // Also remove the mock function if it exists
  const mockStart = code.indexOf('const mockGeminiStream =');
  const mockEnd = code.indexOf('function Message({ msg, isStreaming }) {');
  if (mockStart !== -1 && mockEnd !== -1) {
    code = code.substring(0, mockStart) + code.substring(mockEnd);
  }
  
  fs.writeFileSync('src/components/NexusAI.jsx', code);
}
