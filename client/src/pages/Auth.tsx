import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema, registerSchema } from "../utils/validationSchema";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

type AuthFormData = {
  name?: string;
  email: string;
  password: string;
};

const Auth = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const schema = isLogin ? loginSchema : registerSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthFormData>({ resolver: yupResolver(schema) });

  const onSubmit = async (data: AuthFormData) => {
    setLoading(true);
    try {
      const endpoint = isLogin ? "/users/login" : "/users/register";
      const res = await axios.post(endpoint, data);
      const { token, ...userData } = res.data;
      login(userData, token);
      toast.success(`${isLogin ? "Welcome back" : "Account created"} 🎉`);
      navigate("/layout");
    } catch (err) {
      let message = "Something went wrong";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      background: "var(--bg-base)", fontFamily: "'Inter', sans-serif",
    }}>
      {/* ── Left Brand Panel ── */}
      <div style={{
        flex: "0 0 45%", display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "60px 56px",
        background: "linear-gradient(145deg, #0f1117 0%, #1a1d27 100%)",
        borderRight: "1px solid var(--border)",
        position: "relative", overflow: "hidden",
      }}
        className="animate-slide-left"
      >
        {/* Background glow */}
        <div style={{
          position: "absolute", top: "20%", left: "30%",
          width: 320, height: 320, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "10%", right: "10%",
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 56 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "linear-gradient(135deg, #6366f1, #a78bfa)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
          }}>💸</div>
          <span style={{ fontWeight: 700, fontSize: 20, color: "var(--text-primary)" }}>Expense Tracker</span>
        </div>

        <h2 style={{
          fontSize: 36, fontWeight: 800, lineHeight: 1.2,
          marginBottom: 16,
          background: "linear-gradient(135deg, #f1f5f9, #a5b4fc)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          Master your<br />money.
        </h2>
        <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.8, maxWidth: 320, marginBottom: 48 }}>
          Track every rupee, categorize transactions, and visualize your financial health in real-time.
        </p>

        {/* Mini feature list */}
        {["Smart expense categorization", "Income & expense tracking", "Detailed analytics & export"].map((feat, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 20, height: 20, borderRadius: "50%",
              background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10,
            }}>✓</div>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{feat}</span>
          </div>
        ))}
      </div>

      {/* ── Right Form Panel ── */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center",
        justifyContent: "center", padding: "40px 48px",
      }}
        className="animate-slide-right"
      >
        <div style={{ width: "100%", maxWidth: 400 }}>

          {/* Tab Toggle */}
          <div style={{
            display: "flex", background: "var(--bg-surface)",
            border: "1px solid var(--border)", borderRadius: 12,
            padding: 4, marginBottom: 36,
          }}>
            {["Login", "Register"].map((tab) => {
              const active = (tab === "Login") === isLogin;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => { setIsLogin(tab === "Login"); reset(); }}
                  style={{
                    flex: 1, padding: "10px", borderRadius: 8,
                    background: active ? "#6366f1" : "transparent",
                    color: active ? "white" : "var(--text-muted)",
                    border: "none", cursor: "pointer",
                    fontWeight: 600, fontSize: 14,
                    fontFamily: "'Inter', sans-serif",
                    transition: "all 0.2s",
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>
            {isLogin ? "Welcome back" : "Create account"}
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 32 }}>
            {isLogin ? "Sign in to your account to continue." : "Start tracking your finances today."}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {!isLogin && (
              <div className="animate-fade-in">
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 8 }}>
                  Full Name
                </label>
                <input
                  {...register("name")}
                  className="input-dark"
                  placeholder="John Doe"
                />
                {errors.name && <p style={{ fontSize: 12, color: "var(--accent-danger)", marginTop: 6 }}>{errors.name.message}</p>}
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 8 }}>
                Email Address
              </label>
              <input
                {...register("email")}
                className="input-dark"
                placeholder="you@example.com"
                type="email"
              />
              {errors.email && <p style={{ fontSize: 12, color: "var(--accent-danger)", marginTop: 6 }}>{errors.email.message}</p>}
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 8 }}>
                Password
              </label>
              <input
                {...register("password")}
                className="input-dark"
                placeholder="••••••••"
                type="password"
              />
              {errors.password && <p style={{ fontSize: 12, color: "var(--accent-danger)", marginTop: 6 }}>{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary btn-shimmer"
              style={{ width: "100%", padding: "14px", fontSize: 15, borderRadius: 10, marginTop: 4, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Please wait…" : isLogin ? "Sign In →" : "Create Account →"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", marginTop: 24 }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); reset(); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#a5b4fc", fontWeight: 600, fontSize: 13,
                fontFamily: "'Inter', sans-serif", textDecoration: "underline",
              }}
            >
              {isLogin ? "Register" : "Sign in"}
            </button>
          </p>

          <button
            onClick={() => navigate("/")}
            style={{
              display: "block", margin: "24px auto 0", background: "none",
              border: "none", cursor: "pointer", color: "var(--text-subtle)",
              fontSize: 13, fontFamily: "'Inter', sans-serif",
            }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;