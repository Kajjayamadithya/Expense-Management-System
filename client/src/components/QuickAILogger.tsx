import React, { useState } from "react";
import axios from "../api/axios";
import { toast } from "react-hot-toast";

interface ParsedTx {
  title: string;
  amount: number;
  type: "income" | "expense";
  categoryName: string;
  date: string;
}

interface QuickAILoggerProps {
  onParsed: (parsed: ParsedTx) => void;
}

export default function QuickAILogger({ onParsed }: QuickAILoggerProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post("/ai/parse", { prompt });
      onParsed(res.data);
      toast.success("AI parsed transaction details! Form auto-filled ✨");
    } catch (err) {
      toast.error("Failed to parse natural language text");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(236,72,153,0.08))",
        border: "1px solid rgba(99,102,241,0.3)",
        borderRadius: 14,
        padding: 18,
        marginBottom: 24,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 18 }}>⚡</span>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
          Natural Language AI Quick-Logger
        </h3>
      </div>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
        Type in plain English (e.g. <i>"Spent 450 on dinner at Barbeque Nation today"</i> or <i>"Got 15000 freelance salary"</i>)
      </p>

      <form onSubmit={handleParse} style={{ display: "flex", gap: 10 }}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Bought groceries for 850 rupees at Reliance..."
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--bg-surface)",
            color: "var(--text-primary)",
            fontSize: 13,
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(135deg, #6366f1, #a78bfa)",
            color: "#fff",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {loading ? "Parsing..." : "✨ Auto-Fill"}
        </button>
      </form>
    </div>
  );
}
