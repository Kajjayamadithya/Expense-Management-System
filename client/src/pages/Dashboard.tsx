import { useEffect, useState } from "react";
import axios from "../api/axios";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Transaction {
  _id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  category: { name: string };
}

const Dashboard = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get("/transactions");
      const data: Transaction[] = res.data;
      setTransactions(data.slice(0, 6));
      setIncome(data.filter(t => t.type === "income").reduce((a, t) => a + t.amount, 0));
      setExpense(data.filter(t => t.type === "expense").reduce((a, t) => a + t.amount, 0));
    } catch {
      toast.error("Failed to load dashboard data");
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const balance = income - expense;
  const savingsRate = income > 0 ? Math.max(0, Math.min(100, (balance / income) * 100)) : 0;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }} className="animate-fade-in">

      {/* ── Welcome Row ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
            Good day, {user?.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Here's your financial snapshot for today.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/layout/add-transaction" className="btn-primary btn-shimmer" style={{ textDecoration: "none", padding: "10px 20px", fontSize: 14 }}>
            ➕ Add Transaction
          </Link>
          <Link to="/layout/transaction-history" className="btn-ghost" style={{ textDecoration: "none", padding: "10px 20px", fontSize: 14 }}>
            View History
          </Link>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 28 }}>

        {/* Income */}
        <div className="stat-card animate-fade-in stagger-1">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            }}>📥</div>
            <span style={{ fontSize: 11, color: "#34d399", fontWeight: 600, background: "rgba(16,185,129,0.1)", padding: "4px 8px", borderRadius: 6 }}>
              Total
            </span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Income</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: "#34d399" }}>₹{income.toLocaleString()}</p>
        </div>

        {/* Expenses */}
        <div className="stat-card animate-fade-in stagger-2">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            }}>📤</div>
            <span style={{ fontSize: 11, color: "#f87171", fontWeight: 600, background: "rgba(239,68,68,0.1)", padding: "4px 8px", borderRadius: 6 }}>
              Total
            </span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Expenses</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: "#f87171" }}>₹{expense.toLocaleString()}</p>
        </div>

        {/* Balance */}
        <div className="stat-card animate-fade-in stagger-3" style={{ background: "linear-gradient(145deg, rgba(99,102,241,0.15), rgba(167,139,250,0.08))", borderColor: "rgba(99,102,241,0.25)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            }}>💰</div>
            <span style={{ fontSize: 11, color: "#a5b4fc", fontWeight: 600, background: "rgba(99,102,241,0.15)", padding: "4px 8px", borderRadius: 6 }}>
              Net
            </span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Balance</p>
          <p style={{ fontSize: 28, fontWeight: 800, color: balance >= 0 ? "#a5b4fc" : "#f87171" }}>
            ₹{balance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* ── Savings Rate Bar ── */}
      <div className="card animate-fade-in stagger-4" style={{ padding: "20px 24px", marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Savings Rate</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              {savingsRate.toFixed(1)}% of income saved this period
            </p>
          </div>
          <span style={{
            fontSize: 13, fontWeight: 700,
            color: savingsRate >= 30 ? "#34d399" : savingsRate >= 10 ? "#f59e0b" : "#f87171",
          }}>
            {savingsRate >= 30 ? "🟢 Excellent" : savingsRate >= 10 ? "🟡 Moderate" : "🔴 Low"}
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{
            width: `${savingsRate}%`,
            background: savingsRate >= 30
              ? "linear-gradient(90deg, #10b981, #34d399)"
              : savingsRate >= 10
              ? "linear-gradient(90deg, #f59e0b, #fcd34d)"
              : "linear-gradient(90deg, #ef4444, #f87171)",
          }} />
        </div>
      </div>

      {/* ── Recent Transactions ── */}
      <div className="card animate-fade-in stagger-5" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Recent Transactions</h2>
          <Link to="/layout/transaction-history" style={{ fontSize: 13, color: "#6366f1", textDecoration: "none", fontWeight: 500 }}>
            View all →
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>📭</p>
            <p style={{ fontSize: 14, color: "var(--text-muted)" }}>No transactions yet.</p>
            <Link to="/layout/add-transaction" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex", marginTop: 16, padding: "10px 20px", fontSize: 14 }}>
              Add your first transaction
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {transactions.map((tx, i) => (
              <div key={tx._id} className={`animate-fade-in stagger-${Math.min(i + 1, 5)}`} style={{
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
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: tx.type === "income" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                    border: tx.type === "income" ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(239,68,68,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                  }}>
                    {tx.type === "income" ? "↓" : "↑"}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{tx.title}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {tx.category?.name} · {new Date(tx.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <span style={{
                  fontSize: 15, fontWeight: 700,
                  color: tx.type === "income" ? "#34d399" : "#f87171",
                }}>
                  {tx.type === "income" ? "+" : "−"}₹{tx.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
