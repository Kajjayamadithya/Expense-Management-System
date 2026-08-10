import { useEffect, useState } from "react";
import axios from "../api/axios";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface Category {
  _id: string;
  name: string;
  type: "income" | "expense";
}

const schema = yup.object({
  name: yup.string().required("Category name is required"),
  type: yup.string().oneOf(["income", "expense"]).required("Type is required"),
});

type CategoryFormData = yup.InferType<typeof schema>;

const Category = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "income" | "expense">("all");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({ resolver: yupResolver(schema) });

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/categories");
      setCategories(res.data);
    } catch {
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const onSubmit = async (data: CategoryFormData) => {
    setLoading(true);
    try {
      await axios.post("/categories", data);
      toast.success("Category added ✅");
      fetchCategories();
      reset();
    } catch {
      toast.error("Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/categories/${id}`);
      toast.success("Category deleted");
      fetchCategories();
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const filtered = activeTab === "all" ? categories : categories.filter(c => c.type === activeTab);
  const incomeCount = categories.filter(c => c.type === "income").length;
  const expenseCount = categories.filter(c => c.type === "expense").length;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }} className="animate-fade-in">

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
          Manage Categories
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
          Organize your transactions with custom income and expense categories.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24, alignItems: "start" }}>

        {/* ── Left: Add Form ── */}
        <div className="card animate-fade-in stagger-1" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>
            ➕ New Category
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 8 }}>
                Category Name
              </label>
              <input
                {...register("name")}
                className="input-dark"
                placeholder="e.g. Groceries, Freelance…"
              />
              {errors.name && (
                <p style={{ fontSize: 12, color: "var(--accent-danger)", marginTop: 6 }}>{errors.name.message}</p>
              )}
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 8 }}>
                Type
              </label>
              <select {...register("type")} className="input-dark" style={{ appearance: "none" }}>
                <option value="">Select type</option>
                <option value="income">📥 Income</option>
                <option value="expense">📤 Expense</option>
              </select>
              {errors.type && (
                <p style={{ fontSize: 12, color: "var(--accent-danger)", marginTop: 6 }}>{errors.type.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary btn-shimmer"
              style={{ padding: "12px", marginTop: 4, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Adding…" : "Add Category"}
            </button>
          </form>

          {/* Stats */}
          <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
            <p style={{ fontSize: 12, color: "var(--text-subtle)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Summary
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{
                flex: 1, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)",
                borderRadius: 10, padding: "12px", textAlign: "center",
              }}>
                <p style={{ fontSize: 22, fontWeight: 800, color: "#34d399" }}>{incomeCount}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Income</p>
              </div>
              <div style={{
                flex: 1, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)",
                borderRadius: 10, padding: "12px", textAlign: "center",
              }}>
                <p style={{ fontSize: 22, fontWeight: 800, color: "#f87171" }}>{expenseCount}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Expense</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Category List ── */}
        <div className="animate-fade-in stagger-2">

          {/* Filter Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {(["all", "income", "expense"] as const).map(tab => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "8px 16px", borderRadius: 8, cursor: "pointer",
                    background: active ? "#6366f1" : "var(--bg-elevated)",
                    color: active ? "white" : "var(--text-muted)",
                    fontWeight: 500, fontSize: 13, fontFamily: "'Inter', sans-serif",
                    border: active ? "1px solid transparent" : "1px solid var(--border)",
                    transition: "all 0.2s",
                  } as React.CSSProperties}
                >
                  {tab === "all" ? "All" : tab === "income" ? "📥 Income" : "📤 Expense"}
                </button>
              );
            })}
            <span style={{ marginLeft: "auto", fontSize: 13, color: "var(--text-muted)", alignSelf: "center" }}>
              {filtered.length} categor{filtered.length === 1 ? "y" : "ies"}
            </span>
          </div>

          {/* Category Cards */}
          {filtered.length === 0 ? (
            <div className="card" style={{ padding: "48px", textAlign: "center" }}>
              <p style={{ fontSize: 32, marginBottom: 12 }}>🗂</p>
              <p style={{ fontSize: 14, color: "var(--text-muted)" }}>No categories found.</p>
              <p style={{ fontSize: 13, color: "var(--text-subtle)", marginTop: 4 }}>
                Use the form to add your first category.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map((cat, i) => (
                <div
                  key={cat._id}
                  className={`card animate-fade-in stagger-${Math.min(i + 1, 5)}`}
                  style={{
                    padding: "16px 20px", display: "flex",
                    justifyContent: "space-between", alignItems: "center",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-hover)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                      background: cat.type === "income" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                      border: cat.type === "income" ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(239,68,68,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                    }}>
                      {cat.type === "income" ? "📥" : "📤"}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>
                        {cat.name}
                      </p>
                      <span
                        className={cat.type === "income" ? "badge-income" : "badge-expense"}
                        style={{ fontSize: 11 }}
                      >
                        {cat.type}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="btn-danger"
                    style={{ padding: "6px 12px", fontSize: 12 }}
                  >
                    🗑 Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Category;
