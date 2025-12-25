import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function useChatStream(conversationId: number | undefined) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStream, setCurrentStream] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  // Load initial messages if conversation exists
  useEffect(() => {
    if (conversationId) {
      fetch(`/api/conversations/${conversationId}`, { credentials: "include" })
        .then(res => res.json())
        .then(data => {
          if (data.messages) {
            setMessages(data.messages.map((m: any) => ({
              role: m.role,
              content: m.content
            })));
          }
        })
        .catch(err => console.error("Failed to load history", err));
    }
  }, [conversationId]);

  const sendMessage = async (content: string) => {
    if (!conversationId) return;

    // Optimistic update
    const userMsg: ChatMessage = { role: "user", content };
    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);
    setCurrentStream("");

    try {
      abortControllerRef.current = new AbortController();
      
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        signal: abortControllerRef.current.signal,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to send message");

      // Handle SSE
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response body");

      let accumulatedResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6);
            if (jsonStr.trim() === "") continue;
            
            try {
              const data = JSON.parse(jsonStr);
              if (data.done) {
                // Finalize
                setMessages(prev => [...prev, { role: "assistant", content: accumulatedResponse }]);
                setCurrentStream("");
                setIsStreaming(false);
              } else if (data.content) {
                accumulatedResponse += data.content;
                setCurrentStream(accumulatedResponse);
              }
            } catch (e) {
              console.error("Error parsing SSE chunk", e);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.error("Chat error:", error);
      setIsStreaming(false);
    }
  };

  return {
    messages,
    sendMessage,
    isStreaming,
    currentStream
  };
}
