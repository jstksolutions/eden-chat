"use client";

import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport, isTextUIPart } from "ai";
import type { UIMessage } from "ai";
import { MessageCircle, X, Send } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";

interface ChatWidgetProps {
  facilityId: string;
  facilityName: string;
  primaryColor?: string;
  isEmbedded?: boolean;
}

const LEAD_REGEX = /<lead_data>([\s\S]*?)<\/lead_data>/;

function extractLeadData(text: string): { clean: string; data: Record<string, string> | null } {
  const match = text.match(LEAD_REGEX);
  if (!match) return { clean: text, data: null };
  let data: Record<string, string> | null = null;
  try {
    data = JSON.parse(match[1]) as Record<string, string>;
  } catch {
    // malformed tag — still strip it from display
  }
  return { clean: text.replace(match[0], "").trim(), data };
}

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter(isTextUIPart)
    .map((p) => p.text)
    .join("");
}

function makeWelcomeMessage(facilityName: string): UIMessage {
  return {
    id: "welcome-0",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: `Hi! Welcome to ${facilityName}. I'm here to help you learn about our care services, answer questions about insurance and admissions, or connect you with our team. How can I help you today?`,
      },
    ],
  };
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

export function ChatWidget({
  facilityId,
  facilityName,
  primaryColor = "#2E5A3A",
  isEmbedded = false,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(isEmbedded);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const submittedLeads = useRef<Set<string>>(new Set());

  const transport = useMemo(
    () =>
      new TextStreamChatTransport({
        api: "/api/chat",
        body: { facilityId },
      }),
    [facilityId]
  );

  const { messages, sendMessage, status, setMessages } = useChat({
    transport,
    messages: [makeWelcomeMessage(facilityName)],
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Auto-scroll to bottom on new content
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Capture lead data from assistant messages and POST to /api/lead
  useEffect(() => {
    for (const msg of messages) {
      if (msg.role !== "assistant") continue;
      if (submittedLeads.current.has(msg.id)) continue;
      const text = getMessageText(msg);
      const { data } = extractLeadData(text);
      if (data) {
        submittedLeads.current.add(msg.id);
        fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, facilityId }),
        }).catch(() => {
          // fire-and-forget; don't block UI on lead capture errors
        });
      }
    }
  }, [messages, facilityId]);

  // Reset messages when facilityId changes (when used without key prop)
  useEffect(() => {
    setMessages([makeWelcomeMessage(facilityName)]);
    submittedLeads.current.clear();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilityId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    await sendMessage({ text });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e as unknown as React.FormEvent);
    }
  }

  const chatPanel = (
    <div
      className={
        isEmbedded
          ? "flex flex-col h-full rounded-2xl overflow-hidden shadow-2xl bg-white"
          : "flex flex-col rounded-2xl overflow-hidden shadow-2xl bg-white w-[400px] h-[600px] sm:w-[400px] sm:h-[600px] max-sm:fixed max-sm:inset-0 max-sm:w-full max-sm:h-full max-sm:rounded-none"
      }
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="text-white" size={20} />
          <div>
            <p className="text-white font-semibold text-sm leading-tight">{facilityName}</p>
            <p className="text-white/80 text-xs">Care Assistant</p>
          </div>
        </div>
        {!isEmbedded && (
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            aria-label="Close chat"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {messages.map((msg) => {
          const rawText = getMessageText(msg);
          const { clean: displayText } = extractLeadData(rawText);
          if (!displayText) return null;

          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? "rounded-br-sm text-white"
                    : "rounded-bl-sm bg-gray-100 text-gray-800"
                }`}
                style={isUser ? { backgroundColor: primaryColor } : undefined}
              >
                {displayText}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm">
              <TypingDots />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-gray-200">
        <form onSubmit={(e) => void handleSubmit(e)} className="flex items-end gap-2 p-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message…"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent leading-relaxed max-h-32 overflow-y-auto"
            style={{ focusRingColor: primaryColor } as React.CSSProperties}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white transition-opacity disabled:opacity-40"
            style={{ backgroundColor: primaryColor }}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 pb-2">
          Powered by JS Tech
        </p>
      </div>
    </div>
  );

  if (isEmbedded) return chatPanel;

  return (
    <>
      {/* Floating chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-bottom-4">
          {chatPanel}
        </div>
      )}

      {/* Floating bubble button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform duration-150"
        style={{ backgroundColor: primaryColor }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="text-white" size={24} />
        ) : (
          <MessageCircle className="text-white" size={24} />
        )}
      </button>
    </>
  );
}
