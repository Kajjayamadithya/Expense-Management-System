import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: "📈",
    title: "Track Income & Expenses",
    desc: "Monitor every rupee with smart categorization, instant summaries, and full transaction history.",
    accent: "#6366f1",
  },
  {
    icon: "📊",
    title: "Visual Analytics",
    desc: "Beautiful bar and line charts reveal your spending patterns and help you make better decisions.",
    accent: "#10b981",
  },
  {
    icon: "🔒",
    title: "Secure & Private",
    desc: "JWT-authenticated, encrypted sessions. Your financial data is yours alone.",
    accent: "#f59e0b",
  },
];

const stats = [
  { value: "₹0 Hidden Fees", label: "Completely free" },
  { value: "100%", label: "Data privacy" },
  { value: "Real-time", label: "Balance updates" },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)", fontFamily: "'Inter', sans-serif" }}>

      {/* ── NAV ── */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 48px", borderBottom: "1px solid var(--border)",
        position: "sticky", top: 0, background: "rgba(15,17,23,0.85)",
        backdropFilter: "blur(12px)", zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #6366f1, #a78bfa)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>💸</div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>Expense Tracker</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => navigate("/auth")}
            className="btn-ghost"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/auth")}
            className="btn-primary btn-shimmer"
          >
            Get Started →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "90px 48px 60px", textAlign: "center" }}
        className="animate-fade-in">

        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)",
          borderRadius: 999, padding: "6px 16px", marginBottom: 28,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", display: "inline-block" }} />
          <span style={{ fontSize: 12, color: "#a5b4fc", fontWeight: 500 }}>Smart personal finance management</span>
        </div>

        <h1 style={{
          fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 800,
          lineHeight: 1.1, marginBottom: 24,
          background: "linear-gradient(135deg, #f1f5f9 0%, #a5b4fc 50%, #ec4899 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          Take Control of<br />Your Finances
        </h1>

        <p style={{ fontSize: 18, color: "var(--text-muted)", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.7 }}>
          Track income, manage expenses, and visualize your financial health — all in one beautiful dashboard.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/auth")}
            className="btn-primary btn-shimmer"
            style={{ padding: "14px 32px", fontSize: 15, borderRadius: 12 }}
          >
            Start for Free →
          </button>
          <button
            onClick={() => navigate("/auth")}
            className="btn-ghost"
            style={{ padding: "14px 32px", fontSize: 15, borderRadius: 12 }}
          >
            Sign In
          </button>
        </div>

        {/* Mock Dashboard Card */}
        <div className="animate-float" style={{ marginTop: 64 }}>
          <div style={{
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: 20, padding: 28, maxWidth: 640, margin: "0 auto",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(99,102,241,0.1)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)" }}>Financial Overview</p>
              <span style={{ fontSize: 12, color: "#6366f1", fontWeight: 500 }}>May 2026</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
              {[
                { label: "Income", value: "₹54,200", color: "#34d399" },
                { label: "Expenses", value: "₹31,800", color: "#f87171" },
                { label: "Balance", value: "₹22,400", color: "#a5b4fc" },
              ].map(stat => (
                <div key={stat.label} style={{ background: "var(--bg-elevated)", borderRadius: 12, padding: 16, border: "1px solid var(--border)" }}>
                  <p style={{ fontSize: 11, color: "var(--text-subtle)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{stat.label}</p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: stat.color }}>{stat.value}</p>
                </div>
              ))}
            </div>
            {/* Mini bar chart mock */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 60 }}>
              {[40, 65, 45, 80, 55, 70, 50, 90, 60, 75, 85, 95].map((h, i) => (
                <div key={i} style={{
                  flex: 1, height: `${h}%`, borderRadius: 4,
                  background: i % 2 === 0 ? "rgba(99,102,241,0.5)" : "rgba(239,68,68,0.4)",
                  transition: "height 0.3s",
                }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "40px 48px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: "center" }} className={`animate-fade-in stagger-${i + 1}`}>
              <p style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>{s.value}</p>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 48px" }}>
        <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 700, marginBottom: 12 }}>Everything you need</h2>
        <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: 48, fontSize: 15 }}>
          A complete toolkit to manage your personal finances with ease.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {features.map((f, i) => (
            <div key={i} className={`card animate-fade-in stagger-${i + 1}`} style={{ padding: 28 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, marginBottom: 20,
                background: `${f.accent}18`, border: `1px solid ${f.accent}30`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: "var(--text-primary)" }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "0 48px 80px" }}>
        <div style={{
          maxWidth: 700, margin: "0 auto", textAlign: "center",
          background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(167,139,250,0.1))",
          border: "1px solid rgba(99,102,241,0.25)", borderRadius: 24, padding: "56px 40px",
          boxShadow: "0 0 60px rgba(99,102,241,0.1)",
        }}>
          <h2 style={{ fontSize: 30, fontWeight: 700, marginBottom: 14 }}>Ready to take control?</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 32, fontSize: 15 }}>
            Join and start tracking your finances today. It's free, always.
          </p>
          <button
            onClick={() => navigate("/auth")}
            className="btn-primary btn-shimmer"
            style={{ padding: "14px 40px", fontSize: 15, borderRadius: 12 }}
          >
            Create Free Account →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "24px 48px", textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "var(--text-subtle)" }}>© 2026 Expense Tracker. Built with ❤️ for better finances.</p>
      </footer>
    </div>
  );
};

export default Home;
