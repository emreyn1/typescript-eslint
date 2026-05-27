"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Film } from "lucide-react";
import Link from "next/link";

interface Message {
  role: "user" | "bot";
  text: string;
  recommendations?: {
    id: number;
    title: string;
    year: string;
    rating: number;
    poster: string | null;
    type: string;
  }[];
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: 'Hey! I can help you find movies and TV shows. Try "something like Inception" or "best horror movies"',
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: data.response || "Sorry, something went wrong.",
          recommendations: data.recommendations,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Connection error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center shadow-xl transition-colors"
        aria-label="Open chat"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[360px] max-h-[500px] bg-[#111] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-indigo-600/20">
        <div className="flex items-center gap-2">
          <Film size={18} className="text-indigo-400" />
          <span className="font-semibold text-sm">Movie Assistant</span>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="p-1 hover:bg-white/10 rounded"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 max-h-[340px]">
        {messages.map((msg, i) => (
          <div key={i}>
            <div
              className={`text-sm px-3 py-2 rounded-xl max-w-[85%] ${
                msg.role === "user"
                  ? "bg-indigo-600 ml-auto"
                  : "bg-white/10"
              }`}
            >
              {msg.text}
            </div>
            {msg.recommendations && msg.recommendations.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {msg.recommendations.map((rec) => (
                  <Link
                    key={rec.id}
                    href={`/watch/${rec.type}/${rec.id}`}
                    className="flex items-center gap-2 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {rec.poster && (
                      <img
                        src={rec.poster}
                        alt={rec.title}
                        className="w-8 h-12 rounded object-cover"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">
                        {rec.title}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {rec.year} • ⭐ {rec.rating?.toFixed(1)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="bg-white/10 text-sm px-3 py-2 rounded-xl max-w-[85%] text-gray-400">
            Thinking...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 px-3 py-2 border-t border-white/10"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What should I watch tonight?"
          className="flex-1 bg-transparent text-sm px-2 py-1.5 focus:outline-none placeholder-gray-600"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-1.5 bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
