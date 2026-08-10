import { useState, useEffect, useRef } from "react";
import axios from "../api/axios";
import { toast } from "react-hot-toast";

interface Message {
  sender: "user" | "ai";
  text: string;
}

interface Transaction {
  amount: number;
  type: "income" | "expense";
}

export default function AIChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [persona, setPersona] = useState<"strict" | "wealth" | "shopping">("strict");
  const [messages, setMessages] = useState<Message[]>([
    { sender: "ai", text: "Hello! I am your AI Financial Copilot. Pick a mode above to get started!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (userPrompt?: string) => {
    const textToSend = userPrompt || input;
    if (!textToSend.trim()) return;

    const newMessages: Message[] = [...messages, { sender: "user", text: textToSend }];
    setMessages(newMessages);
    if (!userPrompt) setInput("");
    setLoading(true);

    try {
      // Fetch user's summary for context
      const txRes = await axios.get("/transactions");
      const transactions: Transaction[] = txRes.data;
      const income = transactions.filter((t) => t.type === "income").reduce((a: number, t) => a + t.amount, 0);
      const expense = transactions.filter((t) => t.type === "expense").reduce((a: number, t) => a + t.amount, 0);
      const balance = income - expense;

      const res = await axios.post("/ai/chat", {
        message: textToSend,
        persona,
        summary: { income, expense, balance },
      });

      setMessages([...newMessages, { sender: "ai", text: res.data.reply }]);
    } catch (err) {
      toast.error("Failed to connect to AI assistant");
      setMessages([...newMessages, { sender: "ai", text: "Sorry, I had trouble connecting to my AI core." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 🔮 Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6366f1, #ec4899)",
          color: "#fff",
          border: "none",
          boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
          cursor: "pointer",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {isOpen ? "✖" : "🤖"}
      </button>

      {/* 🤖 Chatbot Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 92,
            right: 24,
            width: 360,
            height: 520,
            background: "var(--bg-surface, #1e1e2d)",
            border: "1px solid var(--border, rgba(255,255,255,0.1))",
            borderRadius: 16,
            boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
            zIndex: 999,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px",
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>🤖</span>
              <div>
                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>AI Financial Assistant</h4>
                <span style={{ fontSize: 11, opacity: 0.85 }}>Gemini Powered Copilot</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: "none", border: "none", color: "#fff", fontSize: 16, cursor: "pointer" }}
            >
              ✕
            </button>
          </div>

          {/* Persona Tabs */}
          <div
            style={{
              display: "flex",
              background: "rgba(0,0,0,0.2)",
              padding: "4px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            {[
              { id: "strict" as const, label: "💼 Strict Coach" },
              { id: "wealth" as const, label: "📈 Wealth Guide" },
              { id: "shopping" as const, label: "🛒 Shopping Guard" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPersona(tab.id)}
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: 6,
                  border: "none",
                  background: persona === tab.id ? "var(--bg-elevated, #2d2d3f)" : "transparent",
                  color: persona === tab.id ? "#a5b4fc" : "var(--text-muted, #94a3b8)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div
            style={{
              flex: 1,
              padding: "14px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  padding: "10px 14px",
                  borderRadius: 12,
                  fontSize: 13,
                  lineHeight: "1.45",
                  background:
                    m.sender === "user"
                      ? "linear-gradient(135deg, #6366f1, #4f46e5)"
                      : "var(--bg-elevated, #2b2b3d)",
                  color: m.sender === "user" ? "#fff" : "var(--text-primary, #e2e8f0)",
                  border: m.sender === "user" ? "none" : "1px solid var(--border, rgba(255,255,255,0.08))",
                }}
              >
                {m.text}
              </div>
            ))}

            {loading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  padding: "8px 12px",
                  borderRadius: 10,
                  background: "var(--bg-elevated, #2b2b3d)",
                  color: "#a5b4fc",
                  fontSize: 12,
                }}
              >
                Thinking... 🧠
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips */}
          <div
            style={{
              padding: "6px 12px",
              display: "flex",
              gap: 6,
              overflowX: "auto",
              borderTop: "1px solid var(--border)",
              background: "rgba(0,0,0,0.1)",
            }}
          >
            {persona === "shopping" ? (
              <button
                className="btn-ghost"
                onClick={() => handleSend("Can I afford to buy a ₹1,500 jacket right now?")}
                style={{ fontSize: 10, padding: "4px 8px", whiteSpace: "nowrap" }}
              >
                🛍️ Can I buy a ₹1500 jacket?
              </button>
            ) : persona === "strict" ? (
              <button
                className="btn-ghost"
                onClick={() => handleSend("Review my monthly spending and tell me where to cut expenses.")}
                style={{ fontSize: 10, padding: "4px 8px", whiteSpace: "nowrap" }}
              >
                📊 Review my spending
              </button>
            ) : (
              <button
                className="btn-ghost"
                onClick={() => handleSend("How much should I allocate to my emergency fund based on my balance?")}
                style={{ fontSize: 10, padding: "4px 8px", whiteSpace: "nowrap" }}
              >
                💡 Emergency fund advice
              </button>
            )}
          </div>

          {/* Input Box */}
          <div
            style={{
              padding: "10px 12px",
              borderTop: "1px solid var(--border)",
              display: "flex",
              gap: 8,
              background: "var(--bg-surface, #1e1e2d)",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask AI financial advice..."
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--bg-elevated)",
                color: "var(--text-primary)",
                fontSize: 13,
                outline: "none",
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                border: "none",
                background: "linear-gradient(135deg, #6366f1, #a78bfa)",
                color: "#fff",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
