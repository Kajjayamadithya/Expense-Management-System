import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { toast } from "react-hot-toast";

interface Category {
  _id: string;
  name: string;
  type: string;
}

interface Budget {
  _id: string;
  category: Category;
  monthlyLimit: number;
  spentAmount: number;
  percentage: number;
}

interface Goal {
  _id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  icon: string;
  color: string;
}

export default function BudgetsAndGoals() {
  const [activeTab, setActiveTab] = useState<"budgets" | "goals">("budgets");
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // Budget Modal State
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [monthlyLimit, setMonthlyLimit] = useState("");

  // Goal Modal State
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");
  const [goalIcon, setGoalIcon] = useState("🎯");

  // Deposit Modal State
  const [depositGoal, setDepositGoal] = useState<Goal | null>(null);
  const [depositAmount, setDepositAmount] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, budRes, goalRes] = await Promise.all([
        axios.get("/categories"),
        axios.get("/budgets"),
        axios.get("/goals"),
      ]);
      setCategories(catRes.data.filter((c: Category) => c.type === "expense"));
      setBudgets(budRes.data);
      setGoals(goalRes.data);
    } catch (err) {
      toast.error("Failed to load budgets and goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Setting Budget
  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !monthlyLimit) {
      toast.error("Please select a category and enter monthly limit");
      return;
    }

    try {
      await axios.post("/budgets", {
        categoryId: selectedCategory,
        monthlyLimit: Number(monthlyLimit),
      });
      toast.success("Category budget updated!");
      setShowBudgetModal(false);
      setSelectedCategory("");
      setMonthlyLimit("");
      fetchData();
    } catch (err) {
      toast.error("Failed to save budget");
    }
  };

  // Handle Deleting Budget
  const handleDeleteBudget = async (id: string) => {
    try {
      await axios.delete(`/budgets/${id}`);
      toast.success("Budget removed");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete budget");
    }
  };

  // Handle Creating Goal
  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle || !targetAmount) {
      toast.error("Please enter goal title and target amount");
      return;
    }

    try {
      await axios.post("/goals", {
        title: goalTitle,
        targetAmount: Number(targetAmount),
        deadline: goalDeadline || undefined,
        icon: goalIcon,
      });
      toast.success("New savings goal created! 🎯");
      setShowGoalModal(false);
      setGoalTitle("");
      setTargetAmount("");
      setGoalDeadline("");
      fetchData();
    } catch (err) {
      toast.error("Failed to create goal");
    }
  };

  // Handle Goal Deposit
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoal || !depositAmount) return;

    try {
      await axios.patch(`/goals/${depositGoal._id}/deposit`, {
        amount: Number(depositAmount),
      });
      toast.success(`Deposited ₹${depositAmount} into ${depositGoal.title}! 🎉`);
      setDepositGoal(null);
      setDepositAmount("");
      fetchData();
    } catch (err) {
      toast.error("Failed to add deposit");
    }
  };

  // Handle Goal Deletion
  const handleDeleteGoal = async (id: string) => {
    try {
      await axios.delete(`/goals/${id}`);
      toast.success("Goal deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete goal");
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }} className="animate-fade-in">
      {/* ── Top Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
            🎯 Budgets & Savings Vaults
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
            Set category spending caps & build targeted savings goals.
          </p>
        </div>

        {/* Tab Selector & Action */}
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ background: "var(--bg-surface)", padding: 4, borderRadius: 10, border: "1px solid var(--border)", display: "flex" }}>
            <button
              onClick={() => setActiveTab("budgets")}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                background: activeTab === "budgets" ? "linear-gradient(135deg, #6366f1, #a78bfa)" : "transparent",
                color: activeTab === "budgets" ? "#fff" : "var(--text-muted)",
              }}
            >
              📊 Category Budgets
            </button>
            <button
              onClick={() => setActiveTab("goals")}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                background: activeTab === "goals" ? "linear-gradient(135deg, #6366f1, #a78bfa)" : "transparent",
                color: activeTab === "goals" ? "#fff" : "var(--text-muted)",
              }}
            >
              🏺 Savings Goals
            </button>
          </div>

          {activeTab === "budgets" ? (
            <button
              onClick={() => setShowBudgetModal(true)}
              className="btn-primary btn-shimmer"
              style={{ padding: "8px 18px", fontSize: 13 }}
            >
              ➕ Set Category Budget
            </button>
          ) : (
            <button
              onClick={() => setShowGoalModal(true)}
              className="btn-primary btn-shimmer"
              style={{ padding: "8px 18px", fontSize: 13 }}
            >
              ➕ Create Savings Goal
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Loading data... ⏳</div>
      ) : activeTab === "budgets" ? (
        /* 📊 CATEGORY BUDGETS GRID */
        <div>
          {budgets.length === 0 ? (
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px dashed var(--border)",
                borderRadius: 16,
                padding: 48,
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: 42, display: "block", marginBottom: 12 }}>📊</span>
              <h3 style={{ fontSize: 16, color: "var(--text-primary)", marginBottom: 6 }}>No category budgets set yet</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 18 }}>
                Set monthly spending limits for categories like Dining, Groceries, and Shopping to prevent overspending!
              </p>
              <button onClick={() => setShowBudgetModal(true)} className="btn-primary" style={{ padding: "10px 20px" }}>
                Set Your First Budget
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
              {budgets.map((b) => {
                const isOver = b.spentAmount > b.monthlyLimit;
                const isNear = b.percentage >= 80 && !isOver;
                const progressColor = isOver ? "#f87171" : isNear ? "#fbbf24" : "#34d399";

                return (
                  <div
                    key={b._id}
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 16,
                      padding: 20,
                      position: "relative",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                          {b.category?.name || "Category"}
                        </h3>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Monthly Budget</span>
                      </div>
                      <button
                        onClick={() => handleDeleteBudget(b._id)}
                        style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 14 }}
                        title="Delete Budget"
                      >
                        🗑
                      </button>
                    </div>

                    {/* Progress Numbers */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                      <div>
                        <span style={{ fontSize: 20, fontWeight: 700, color: progressColor }}>
                          ₹{b.spentAmount.toLocaleString()}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}> / ₹{b.monthlyLimit.toLocaleString()}</span>
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 6,
                          background: isOver ? "rgba(248,113,113,0.15)" : isNear ? "rgba(251,191,36,0.15)" : "rgba(52,211,153,0.15)",
                          color: progressColor,
                        }}
                      >
                        {b.percentage}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div
                      style={{
                        width: "100%",
                        height: 10,
                        borderRadius: 5,
                        background: "var(--bg-elevated)",
                        overflow: "hidden",
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(100, b.percentage)}%`,
                          height: "100%",
                          background: progressColor,
                          borderRadius: 5,
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>

                    {/* Status Alert Badge */}
                    {isOver ? (
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#f87171",
                          background: "rgba(248,113,113,0.1)",
                          padding: "6px 10px",
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        🚨 <b>Over Budget!</b> You exceeded by ₹{(b.spentAmount - b.monthlyLimit).toLocaleString()}
                      </div>
                    ) : isNear ? (
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#fbbf24",
                          background: "rgba(251,191,36,0.1)",
                          padding: "6px 10px",
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        ⚠️ <b>Warning:</b> You have used 80%+ of this category's limit.
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, color: "var(--text-subtle)" }}>
                        Remaining balance: ₹{(b.monthlyLimit - b.spentAmount).toLocaleString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* 🏺 SAVINGS GOALS GRID */
        <div>
          {goals.length === 0 ? (
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px dashed var(--border)",
                borderRadius: 16,
                padding: 48,
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: 42, display: "block", marginBottom: 12 }}>🏺</span>
              <h3 style={{ fontSize: 16, color: "var(--text-primary)", marginBottom: 6 }}>No savings goals created yet</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 18 }}>
                Create savings pots for trips, gadgets, or emergency funds and track your deposits!
              </p>
              <button onClick={() => setShowGoalModal(true)} className="btn-primary" style={{ padding: "10px 20px" }}>
                Create Your First Goal
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
              {goals.map((g) => {
                const percent = Math.min(100, Math.round(((g.currentAmount || 0) / g.targetAmount) * 100));
                const isComplete = g.currentAmount >= g.targetAmount;

                return (
                  <div
                    key={g._id}
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 16,
                      padding: 20,
                      boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: 12,
                            background: "rgba(99,102,241,0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 22,
                          }}
                        >
                          {g.icon || "🎯"}
                        </div>
                        <div>
                          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>{g.title}</h3>
                          {g.deadline && (
                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                              Target Date: {new Date(g.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteGoal(g._id)}
                        style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 14 }}
                      >
                        🗑
                      </button>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                      <span style={{ fontSize: 20, fontWeight: 700, color: "#34d399" }}>
                        ₹{(g.currentAmount || 0).toLocaleString()}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        Target: ₹{g.targetAmount.toLocaleString()} ({percent}%)
                      </span>
                    </div>

                    <div
                      style={{
                        width: "100%",
                        height: 10,
                        borderRadius: 5,
                        background: "var(--bg-elevated)",
                        overflow: "hidden",
                        marginBottom: 16,
                      }}
                    >
                      <div
                        style={{
                          width: `${percent}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, #6366f1, #34d399)",
                          borderRadius: 5,
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>

                    {isComplete ? (
                      <div
                        style={{
                          background: "rgba(52,211,153,0.15)",
                          color: "#34d399",
                          fontWeight: 700,
                          textAlign: "center",
                          padding: "8px",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      >
                        🎉 Goal Reached! Congratulations!
                      </div>
                    ) : (
                      <button
                        onClick={() => setDepositGoal(g)}
                        style={{
                          width: "100%",
                          padding: "8px",
                          borderRadius: 8,
                          border: "1px solid var(--border)",
                          background: "var(--bg-elevated)",
                          color: "#a5b4fc",
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        💵 Deposit Funds
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── SET BUDGET MODAL ── */}
      {showBudgetModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}>
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, width: 400 }}>
            <h3 style={{ margin: "0 0 16px", color: "var(--text-primary)", fontSize: 18 }}>Set Category Monthly Limit</h3>
            <form onSubmit={handleSaveBudget} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)" }}
                >
                  <option value="">Select Expense Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Monthly Limit (₹)</label>
                <input
                  type="number"
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                  placeholder="e.g. 5000"
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)" }}
                />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" onClick={() => setShowBudgetModal(false)} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-primary">Save Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE GOAL MODAL ── */}
      {showGoalModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}>
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, width: 400 }}>
            <h3 style={{ margin: "0 0 16px", color: "var(--text-primary)", fontSize: 18 }}>Create Savings Vault</h3>
            <form onSubmit={handleSaveGoal} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Goal Title</label>
                <input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g. Goa Trip, New iPhone"
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Target Savings Amount (₹)</label>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="e.g. 25000"
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Target Date (Optional)</label>
                <input
                  type="date"
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Icon</label>
                <select
                  value={goalIcon}
                  onChange={(e) => setGoalIcon(e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)" }}
                >
                  <option value="🎯">🎯 Target</option>
                  <option value="✈️">✈️ Vacation / Travel</option>
                  <option value="📱">📱 Tech Gadget</option>
                  <option value="🚗">🚗 Vehicle</option>
                  <option value="🎓">🎓 Education</option>
                  <option value="🛡️">🛡️ Emergency Fund</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" onClick={() => setShowGoalModal(false)} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-primary">Create Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DEPOSIT MODAL ── */}
      {depositGoal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}>
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, width: 380 }}>
            <h3 style={{ margin: "0 0 10px", color: "var(--text-primary)", fontSize: 18 }}>Deposit into {depositGoal.title}</h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
              Current saved: ₹{(depositGoal.currentAmount || 0).toLocaleString()} / ₹{depositGoal.targetAmount.toLocaleString()}
            </p>
            <form onSubmit={handleDeposit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Deposit Amount (₹)"
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)" }}
              />
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setDepositGoal(null)} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-primary">Deposit Now</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
