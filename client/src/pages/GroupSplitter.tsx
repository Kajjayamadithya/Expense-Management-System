import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { toast } from "react-hot-toast";

interface Group {
  _id: string;
  name: string;
  description?: string;
  members: string[];
}

interface GroupExpense {
  _id: string;
  paidBy: string;
  title: string;
  amount: number;
  splits: Array<{ memberName: string; shareAmount: number }>;
  date: string;
}

interface Debt {
  from: string;
  to: string;
  amount: number;
}

export default function GroupSplitter() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<GroupExpense[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  // New Group Modal State
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [memberInput, setMemberInput] = useState("");
  const [memberList, setMemberList] = useState<string[]>([]);

  // New Expense Modal State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/groups");
      setGroups(res.data);
      if (res.data.length > 0 && !selectedGroup) {
        loadGroupDetails(res.data[0]._id);
      }
    } catch (err) {
      toast.error("Failed to load group list");
    } finally {
      setLoading(false);
    }
  };

  const loadGroupDetails = async (groupId: string) => {
    try {
      const res = await axios.get(`/groups/${groupId}`);
      setSelectedGroup(res.data.group);
      setExpenses(res.data.expenses);
      setDebts(res.data.debts);
    } catch (err) {
      toast.error("Failed to load group details");
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Add Member to Draft List
  const handleAddMember = () => {
    if (!memberInput.trim()) return;
    if (!memberList.includes(memberInput.trim())) {
      setMemberList([...memberList, memberInput.trim()]);
    }
    setMemberInput("");
  };

  // Create Group
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    try {
      const res = await axios.post("/groups", {
        name: groupName,
        description: groupDesc,
        members: memberList,
      });
      toast.success("Group created!");
      setShowGroupModal(false);
      setGroupName("");
      setGroupDesc("");
      setMemberList([]);
      fetchGroups();
      loadGroupDetails(res.data._id);
    } catch (err) {
      toast.error("Failed to create group");
    }
  };

  // Log Shared Expense
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !expenseTitle || !expenseAmount || !paidBy) {
      toast.error("Please fill out expense title, amount, and payer");
      return;
    }

    const totalAmt = Number(expenseAmount);
    const splitShare = Math.round((totalAmt / selectedGroup.members.length) * 100) / 100;
    const splits = selectedGroup.members.map((m) => ({
      memberName: m,
      shareAmount: splitShare,
    }));

    try {
      await axios.post(`/groups/${selectedGroup._id}/expenses`, {
        paidBy,
        title: expenseTitle,
        amount: totalAmt,
        splits,
      });

      toast.success("Shared expense added!");
      setShowExpenseModal(false);
      setExpenseTitle("");
      setExpenseAmount("");
      loadGroupDetails(selectedGroup._id);
    } catch (err) {
      toast.error("Failed to log expense");
    }
  };

  // Settle Debt Action
  const handleSettleDebt = async (debt: Debt) => {
    if (!selectedGroup) return;

    try {
      await axios.post(`/groups/${selectedGroup._id}/expenses`, {
        paidBy: debt.from,
        title: `Settlement to ${debt.to}`,
        amount: debt.amount,
        splits: [{ memberName: debt.to, shareAmount: debt.amount }],
      });

      toast.success(`Settled ₹${debt.amount} payment! 🎉`);
      loadGroupDetails(selectedGroup._id);
    } catch (err) {
      toast.error("Failed to settle debt");
    }
  };

  // Delete Group
  const handleDeleteGroup = async (groupId: string) => {
    try {
      await axios.delete(`/groups/${groupId}`);
      toast.success("Group deleted");
      setSelectedGroup(null);
      fetchGroups();
    } catch (err) {
      toast.error("Failed to delete group");
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
            👥 Group Expense Splitter
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
            Split bills with roommates, friends & trips with automated debt calculation.
          </p>
        </div>
        <button
          onClick={() => setShowGroupModal(true)}
          className="btn-primary btn-shimmer"
          style={{ padding: "8px 18px", fontSize: 13 }}
        >
          ➕ Create New Group
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Loading groups... ⏳</div>
      ) : groups.length === 0 ? (
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px dashed var(--border)",
            borderRadius: 16,
            padding: 48,
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: 42, display: "block", marginBottom: 12 }}>👥</span>
          <h3 style={{ fontSize: 16, color: "var(--text-primary)", marginBottom: 6 }}>No Expense Groups Created Yet</h3>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 18 }}>
            Create a group for your flatmates or a weekend trip to keep track of shared bills!
          </p>
          <button onClick={() => setShowGroupModal(true)} className="btn-primary" style={{ padding: "10px 20px" }}>
            Create First Group
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>
          {/* ── Left Sidebar: Group List ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Your Groups
            </span>
            {groups.map((g) => {
              const active = selectedGroup?._id === g._id;
              return (
                <div
                  key={g._id}
                  onClick={() => loadGroupDetails(g._id)}
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    background: active ? "rgba(99,102,241,0.15)" : "var(--bg-surface)",
                    border: active ? "1px solid rgba(99,102,241,0.4)" : "1px solid var(--border)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: active ? "#a5b4fc" : "var(--text-primary)" }}>
                      {g.name}
                    </h4>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", background: "var(--bg-elevated)", padding: "2px 6px", borderRadius: 6 }}>
                      {g.members?.length || 0} members
                    </span>
                  </div>
                  {g.description && <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-muted)" }}>{g.description}</p>}
                </div>
              );
            })}
          </div>

          {/* ── Right Panel: Group Details & Expenses ── */}
          {selectedGroup && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Group Header Card */}
              <div
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: 20,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>
                    {selectedGroup.name}
                  </h2>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
                    Members: <b>{selectedGroup.members.join(", ")}</b>
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => {
                      setPaidBy(selectedGroup.members[0] || "");
                      setShowExpenseModal(true);
                    }}
                    className="btn-primary"
                    style={{ padding: "8px 16px", fontSize: 13 }}
                  >
                    💸 Add Shared Expense
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(selectedGroup._id)}
                    style={{ background: "none", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 13 }}
                  >
                    🗑
                  </button>
                </div>
              </div>

              {/* Net Settlement Balances */}
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(52,211,153,0.06))",
                  border: "1px solid rgba(99,102,241,0.2)",
                  borderRadius: 16,
                  padding: 20,
                }}
              >
                <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                  ⚖️ Settlement Matrix ("Who Owes Whom")
                </h3>

                {debts.length === 0 ? (
                  <p style={{ margin: 0, fontSize: 13, color: "#34d399", fontWeight: 600 }}>
                    ✅ Everyone is completely settled up!
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {debts.map((debt, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          background: "var(--bg-surface)",
                          padding: "12px 16px",
                          borderRadius: 10,
                          border: "1px solid var(--border)",
                        }}
                      >
                        <div style={{ fontSize: 14 }}>
                          <b>{debt.from}</b> owes <b>{debt.to}</b>:{" "}
                          <span style={{ fontWeight: 700, color: "#f87171" }}>₹{debt.amount.toLocaleString()}</span>
                        </div>
                        <button
                          onClick={() => handleSettleDebt(debt)}
                          className="btn-ghost"
                          style={{ padding: "6px 12px", fontSize: 12, border: "1px solid #34d399", color: "#34d399" }}
                        >
                          ✔ Settle Up
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Group Expense History */}
              <div
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: 20,
                }}
              >
                <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                  📜 Shared Expense History
                </h3>

                {expenses.length === 0 ? (
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No shared expenses logged in this group yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {expenses.map((exp) => (
                      <div
                        key={exp._id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: 12,
                          borderRadius: 10,
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <div>
                          <h4 style={{ margin: 0, fontSize: 14, color: "var(--text-primary)" }}>{exp.title}</h4>
                          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            Paid by <b>{exp.paidBy}</b> on {new Date(exp.date).toLocaleDateString()}
                          </span>
                        </div>
                        <span style={{ fontSize: 16, fontWeight: 700, color: "#a5b4fc" }}>
                          ₹{exp.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CREATE GROUP MODAL ── */}
      {showGroupModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}>
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, width: 420 }}>
            <h3 style={{ margin: "0 0 16px", color: "var(--text-primary)", fontSize: 18 }}>Create Shared Expense Group</h3>
            <form onSubmit={handleCreateGroup} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Flat 302 Roommates, Manali Trip"
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Description (Optional)</label>
                <input
                  type="text"
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  placeholder="e.g. Rent, wifi, and shared groceries"
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)" }}
                />
              </div>

              {/* Add Members */}
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Add Member Name / Email</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    value={memberInput}
                    onChange={(e) => setMemberInput(e.target.value)}
                    placeholder="e.g. Rahul, Priya"
                    style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)" }}
                  />
                  <button type="button" onClick={handleAddMember} className="btn-ghost" style={{ padding: "10px 14px" }}>
                    Add
                  </button>
                </div>
                {memberList.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                    {memberList.map((m, idx) => (
                      <span key={idx} style={{ background: "rgba(99,102,241,0.2)", color: "#a5b4fc", fontSize: 12, padding: "4px 8px", borderRadius: 6 }}>
                        {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" onClick={() => setShowGroupModal(false)} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-primary">Create Group</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD EXPENSE MODAL ── */}
      {showExpenseModal && selectedGroup && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}>
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, width: 400 }}>
            <h3 style={{ margin: "0 0 16px", color: "var(--text-primary)", fontSize: 18 }}>Log Shared Expense</h3>
            <form onSubmit={handleAddExpense} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Title</label>
                <input
                  type="text"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  placeholder="e.g. WiFi Bill, Dinner at Barbeque"
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Total Amount (₹)</label>
                <input
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="e.g. 1500"
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Paid By</label>
                <select
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text-primary)" }}
                >
                  {selectedGroup.members.map((m, idx) => (
                    <option key={idx} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div style={{ fontSize: 12, color: "var(--text-muted)", background: "var(--bg-elevated)", padding: 10, borderRadius: 8 }}>
                ℹ️ Split equally among <b>{selectedGroup.members.length}</b> members: ~₹
                {expenseAmount ? Math.round(Number(expenseAmount) / selectedGroup.members.length) : 0} / person
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" onClick={() => setShowExpenseModal(false)} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-primary">Add Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
