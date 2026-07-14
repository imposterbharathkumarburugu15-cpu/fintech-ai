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
