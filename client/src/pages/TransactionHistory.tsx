import { useEffect, useState } from "react";
import axios from "../api/axios";
import { toast } from "react-hot-toast";
import { unparse } from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, CartesianGrid,
} from "recharts";

interface Transaction {
  _id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: { name: string };
  date: string;
}

interface Category {
  _id: string;
  name: string;
  type: "income" | "expense";
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-elevated)", border: "1px solid var(--border)",
      borderRadius: 10, padding: "10px 14px", fontSize: 13,
    }}>
      <p style={{ color: "var(--text-muted)", marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: ₹{p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeChart, setActiveChart] = useState<"bar" | "line">("bar");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, catRes] = await Promise.all([
          axios.get("/transactions"),
          axios.get("/categories"),
        ]);
        setTransactions(txRes.data);
        setFiltered(txRes.data);
        setCategories(catRes.data);
      } catch {
        toast.error("Failed to load data");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let f = [...transactions];
    if (typeFilter) f = f.filter(tx => tx.type === typeFilter);
    if (categoryFilter) f = f.filter(tx => tx.category?.name === categoryFilter);
    // Use ISO date string slice (YYYY-MM-DD) to avoid IST timezone offset issues
    if (startDate) f = f.filter(tx => tx.date.slice(0, 10) >= startDate);
    if (endDate) f = f.filter(tx => tx.date.slice(0, 10) <= endDate);
    setFiltered(f);
  }, [typeFilter, categoryFilter, startDate, endDate, transactions]);

  const totalIncome = filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const barChartData = [
    { name: "Income", total: totalIncome },
    { name: "Expense", total: totalExpense },
  ];

  const lineChartData = Object.values(
    filtered.reduce((acc, tx) => {
      const key = new Date(tx.date).toLocaleDateString("en-CA");
      if (!acc[key]) acc[key] = { date: key, income: 0, expense: 0 };
      acc[key][tx.type] += tx.amount;
      return acc;
    }, {} as Record<string, { date: string; income: number; expense: number }>)
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const exportCSV = () => {
    const csv = unparse(filtered.map(tx => ({
      Title: tx.title, Amount: tx.amount, Type: tx.type,
      Category: tx.category?.name, Date: new Date(tx.date).toLocaleDateString(),
    })));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    toast.success("CSV exported ✅");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Transaction History", 14, 22);
    autoTable(doc, {
      startY: 30,
      head: [["Title", "Amount", "Type", "Category", "Date"]],
      body: filtered.map(tx => [tx.title, `₹${tx.amount}`, tx.type, tx.category?.name || "-", new Date(tx.date).toLocaleDateString()]),
      styles: { fontSize: 11 },
    });
    doc.save("transactions.pdf");
    toast.success("PDF exported ✅");
  };

  const clearFilters = () => {
    setTypeFilter(""); setCategoryFilter(""); setStartDate(""); setEndDate("");
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }} className="animate-fade-in">

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
            Transaction History
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
            {filtered.length} transaction{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={exportCSV} className="btn-ghost" style={{ fontSize: 13, padding: "9px 16px" }}>
            ⬇ CSV
          </button>
          <button onClick={exportPDF} className="btn-ghost" style={{ fontSize: 13, padding: "9px 16px" }}>
            🧾 PDF
          </button>
        </div>
      </div>

      {/* ── Summary Chips ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Income", value: totalIncome, color: "#34d399", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.2)" },
          { label: "Total Expenses", value: totalExpense, color: "#f87171", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)" },
          { label: "Net Balance", value: totalIncome - totalExpense, color: (totalIncome - totalExpense) >= 0 ? "#a5b4fc" : "#f87171", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)" },
        ].map((s, i) => (
          <div key={i} className={`animate-fade-in stagger-${i + 1}`} style={{
            background: s.bg, border: `1px solid ${s.border}`,
            borderRadius: 14, padding: "18px 20px",
          }}>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: s.color }}>₹{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="card animate-fade-in stagger-2" style={{ padding: "20px 24px", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>🔍 Filters</p>
          {(typeFilter || categoryFilter || startDate || endDate) && (
            <button onClick={clearFilters} className="btn-ghost" style={{ fontSize: 12, padding: "5px 12px" }}>
              Clear all
            </button>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input-dark">
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="input-dark">
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
          </select>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-dark" />
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-dark" />
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="card animate-fade-in stagger-3" style={{ padding: "24px", marginBottom: 24 }}>
        {/* Chart Tab Toggle */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Analytics</h2>
          <div style={{ display: "flex", background: "var(--bg-elevated)", borderRadius: 8, padding: 3, border: "1px solid var(--border)" }}>
            {(["bar", "line"] as const).map(type => (
              <button key={type} onClick={() => setActiveChart(type)} style={{
                padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 500, fontFamily: "'Inter', sans-serif",
                background: activeChart === type ? "#6366f1" : "transparent",
                color: activeChart === type ? "white" : "var(--text-muted)",
                transition: "all 0.2s",
              }}>
                {type === "bar" ? "Bar" : "Trend"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            {activeChart === "bar" ? (
              <BarChart data={barChartData} barSize={52}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={13} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}
                  fill="url(#barGrad)"
                />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
              </BarChart>
            ) : (
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 13, color: "#94a3b8" }} />
                <Line type="monotone" dataKey="income" stroke="#34d399" strokeWidth={2.5} dot={{ r: 4, fill: "#34d399", strokeWidth: 0 }} name="Income" />
                <Line type="monotone" dataKey="expense" stroke="#f87171" strokeWidth={2.5} dot={{ r: 4, fill: "#f87171", strokeWidth: 0 }} name="Expense" />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Transaction List ── */}
      <div className="card animate-fade-in stagger-4" style={{ padding: "24px" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
          Transactions
        </h2>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>📭</p>
            <p style={{ fontSize: 14, color: "var(--text-muted)" }}>No transactions match your filters.</p>
          </div>
        ) : (
          <div style={{ maxHeight: 380, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }} className="custom-scrollbar">
            {filtered.map((tx, i) => (
              <div
                key={tx._id}
                className={`animate-fade-in stagger-${Math.min(i + 1, 5)}`}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "14px 16px", borderRadius: 10,
                  background: "var(--bg-elevated)", border: "1px solid var(--border)",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-hover)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                    background: tx.type === "income" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                    border: tx.type === "income" ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(239,68,68,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                  }}>
                    {tx.type === "income" ? "↓" : "↑"}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{tx.title}</p>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span className={tx.type === "income" ? "badge-income" : "badge-expense"} style={{ fontSize: 10 }}>
                        {tx.category?.name || "—"}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-subtle)" }}>
                        {new Date(tx.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>
                <p style={{
                  fontSize: 15, fontWeight: 700,
                  color: tx.type === "income" ? "#34d399" : "#f87171",
                }}>
                  {tx.type === "income" ? "+" : "−"}₹{tx.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;