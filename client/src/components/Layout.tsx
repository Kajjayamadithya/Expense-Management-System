import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import axios from "../api/axios";

const navItems = [
  { to: "/layout", label: "Dashboard", icon: "📊", exact: true },
  { to: "/layout/add-transaction", label: "Add Transaction", icon: "➕" },
  { to: "/layout/transaction-history", label: "History", icon: "📜" },
  { to: "/layout/category", label: "Categories", icon: "🗂" },
];

export default function Layout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/transactions");
        const transactions = res.data;
        let inc = 0, exp = 0;
        for (const tx of transactions) {
          if (tx.type === "income") inc += tx.amount;
          else if (tx.type === "expense") exp += tx.amount;
        }
        setIncome(inc);
        setExpense(exp);
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      }
    };
    fetchData();
  }, []);

  const balance = income - expense;

  const isActive = (to: string, exact = false) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to) && to !== "/layout";
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarOpen ? "240px" : "72px",
        minHeight: "100vh",
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
        transition: "width 0.3s ease",
        flexShrink: 0,
        position: "relative",
        zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ padding: "0 20px 28px", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #6366f1, #a78bfa)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, flexShrink: 0,
          }}>💸</div>
          {sidebarOpen && (
            <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", whiteSpace: "nowrap" }}>
              Expense Tracker
            </span>
          )}
        </div>

        <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0 0 20px" }} />

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "0 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map(({ to, label, icon, exact }) => {
            const active = isActive(to, exact);
            return (
              <Link key={to} to={to} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 10,
                  background: active ? "rgba(99,102,241,0.15)" : "transparent",
                  border: active ? "1px solid rgba(99,102,241,0.25)" : "1px solid transparent",
                  color: active ? "#a5b4fc" : "var(--text-muted)",
                  fontSize: 14, fontWeight: active ? 600 : 500,
                  transition: "all 0.2s", cursor: "pointer",
                  whiteSpace: "nowrap", overflow: "hidden",
                }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                  {sidebarOpen && <span>{label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Balance Summary */}
        {sidebarOpen && (
          <div style={{ padding: "20px 16px 0" }}>
            <div style={{
              background: "var(--bg-elevated)", borderRadius: 12,
              padding: 16, border: "1px solid var(--border)",
            }}>
              <p style={{ fontSize: 11, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, fontWeight: 600 }}>
                Balance
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Income</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#34d399" }}>₹{income.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Expense</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#f87171" }}>₹{expense.toLocaleString()}</span>
                </div>
                <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "4px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Net</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: balance >= 0 ? "#34d399" : "#f87171" }}>
                    ₹{balance.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: "absolute", top: 20, right: -14,
            width: 28, height: 28, borderRadius: "50%",
            background: "var(--bg-elevated)", border: "1px solid var(--border)",
            color: "var(--text-muted)", fontSize: 12, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s", zIndex: 20,
          }}
        >
          {sidebarOpen ? "‹" : "›"}
        </button>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top Header */}
        <header style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 28px",
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "var(--text-subtle)" }}>Expense Tracker</span>
            <span style={{ fontSize: 13, color: "var(--text-subtle)" }}>/</span>
            <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>
              {navItems.find(n => isActive(n.to, n.exact))?.label || "Dashboard"}
            </span>
          </div>

          {/* User + Logout */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "var(--bg-elevated)", padding: "8px 14px", borderRadius: 10,
              border: "1px solid var(--border)",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "linear-gradient(135deg, #6366f1, #ec4899)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "white",
              }}>
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{user?.name || "User"}</p>
                <p style={{ fontSize: 11, color: "var(--text-subtle)", margin: 0 }}>{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-danger"
              style={{ padding: "8px 16px", fontSize: 13 }}
            >
              🚪 Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}