import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "var(--bg-base)", fontFamily: "'Inter', sans-serif",
      textAlign: "center", padding: "40px 24px",
    }}
      className="animate-fade-in"
    >
      {/* Glow */}
      <div style={{
        position: "absolute", width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        fontSize: 96, marginBottom: 8, lineHeight: 1,
        filter: "drop-shadow(0 0 24px rgba(99,102,241,0.4))",
      }}>
        💸
      </div>

      <h1 style={{
        fontSize: 80, fontWeight: 900, margin: "0 0 8px",
        background: "linear-gradient(135deg, #6366f1, #a78bfa)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
      }}>
        404
      </h1>

      <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>
        Page not found
      </h2>
      <p style={{ fontSize: 15, color: "var(--text-muted)", maxWidth: 360, lineHeight: 1.7, marginBottom: 36 }}>
        Looks like this page went missing. Let's get you back to managing your finances.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost"
          style={{ padding: "12px 24px", fontSize: 14 }}
        >
          ← Go Back
        </button>
        <button
          onClick={() => navigate("/")}
          className="btn-primary btn-shimmer"
          style={{ padding: "12px 24px", fontSize: 14 }}
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
