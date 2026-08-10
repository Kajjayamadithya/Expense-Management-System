import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { transactionSchema } from "../utils/validationSchema";
import { useEffect, useState } from "react";
import axios from "../api/axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import QuickAILogger from "../components/QuickAILogger";
import ReceiptScannerModal from "../components/ReceiptScannerModal";

import * as yup from "yup";

interface Category {
  _id: string;
  name: string;
  type: "income" | "expense";
}

interface TransactionItem {
  amount: number;
  type: "income" | "expense";
}

interface ParsedAIData {
  type?: "income" | "expense";
  title?: string;
  merchant?: string;
  amount?: number;
  total?: number;
  date?: string;
  categoryName?: string;
}

type TransactionFormData = yup.InferType<typeof transactionSchema>;

const AddTransaction = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [selectedType, setSelectedType] = useState<"income" | "expense">("expense");
  const [loading, setLoading] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransactionFormData>({ resolver: yupResolver(transactionSchema) });

  const watchedAmount = watch("amount");

  const fetchData = async () => {
    try {
      const [catRes, txRes] = await Promise.all([
        axios.get("/categories"),
        axios.get("/transactions"),
      ]);
      setCategories(catRes.data);
      const allTx: TransactionItem[] = txRes.data;
      const inc = allTx.filter((t) => t.type === "income").reduce((a, t) => a + t.amount, 0);
      const exp = allTx.filter((t) => t.type === "expense").reduce((a, t) => a + t.amount, 0);
      setBalance(inc - exp);
    } catch {
      toast.error("Failed to load data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Keep form in sync with pill toggle
  useEffect(() => {
    setValue("type", selectedType);
  }, [selectedType, setValue]);

  // Handle AI Auto-fill from QuickLogger or Receipt Scanner
  const handleAIAutoFill = (parsed: ParsedAIData) => {
    if (parsed.type) setSelectedType(parsed.type);
    if (parsed.title || parsed.merchant) setValue("title", (parsed.title || parsed.merchant)!);
    if (parsed.amount || parsed.total) setValue("amount", (parsed.amount || parsed.total)!);
    if (parsed.date) setValue("date", parsed.date as unknown as Date);

    // Auto-match category name if available
    const catName = parsed.categoryName;
    if (catName) {
      const matchedCat = categories.find(
        (c) => c.name.toLowerCase().includes(catName.toLowerCase()) || catName.toLowerCase().includes(c.name.toLowerCase())
      );
      if (matchedCat) {
        setValue("categoryId", matchedCat._id);
      }
    }
  };

  const onSubmit = async (data: TransactionFormData) => {
    if (data.type === "expense" && data.amount > balance) {
      toast.error("Insufficient balance for this expense");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/transactions", data);
      toast.success("Transaction added ✅");
      navigate("/layout");
    } catch (err) {
      let message = "Failed to add transaction";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        message = err.response.data.message;
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === selectedType);
  const projectedBalance =
    selectedType === "expense"
      ? balance - (Number(watchedAmount) || 0)
      : balance + (Number(watchedAmount) || 0);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
            Add Transaction
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0 }}>Record a new income or expense entry.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowReceiptModal(true)}
          style={{
            padding: "8px 16px",
            borderRadius: 10,
            border: "1px solid rgba(236,72,153,0.4)",
            background: "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(99,102,241,0.15))",
            color: "#ec4899",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          🧾 Scan Receipt with AI
        </button>
      </div>

      {/* ⚡ Natural Language Quick AI Logger */}
      <QuickAILogger onParsed={handleAIAutoFill} />

      {/* Receipt Scanner Modal */}
      <ReceiptScannerModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        onScanned={handleAIAutoFill}
      />

      <div className="card" style={{ padding: 32 }}>
        {/* Type Toggle */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 10 }}>
            Transaction Type
          </label>
          <div
            style={{
              display: "flex",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 4,
            }}
          >
            {(["expense", "income"] as const).map((type) => {
              const active = selectedType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  style={{
                    flex: 1,
                    padding: "11px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 14,
                    fontFamily: "'Inter', sans-serif",
                    transition: "all 0.2s",
                    background: active ? (type === "income" ? "#10b981" : "#ef4444") : "transparent",
                    color: active ? "white" : "var(--text-muted)",
                  }}
                >
                  {type === "income" ? "📥 Income" : "📤 Expense"}
                </button>
              );
            })}
          </div>
          {/* Hidden input for form validation */}
          <input type="hidden" {...register("type")} />
        </div>

        {/* Balance Preview */}
        <div
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "14px 18px",
            marginBottom: 28,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <p style={{ fontSize: 11, color: "var(--text-subtle)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Current Balance
            </p>
            <p style={{ fontSize: 15, fontWeight: 700, color: balance >= 0 ? "#34d399" : "#f87171" }}>
              ₹{balance.toLocaleString()}
            </p>
          </div>
          <div style={{ fontSize: 18, color: "var(--text-subtle)" }}>→</div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 11, color: "var(--text-subtle)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              After Transaction
            </p>
            <p style={{ fontSize: 15, fontWeight: 700, color: projectedBalance >= 0 ? "#a5b4fc" : "#f87171" }}>
              ₹{projectedBalance.toLocaleString()}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Title */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 8 }}>
              Title
            </label>
            <input {...register("title")} className="input-dark" placeholder="e.g. Salary, Grocery, Rent…" />
            {errors.title && <p style={{ fontSize: 12, color: "var(--accent-danger)", marginTop: 6 }}>{errors.title.message}</p>}
          </div>

          {/* Amount */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 8 }}>
              Amount (₹)
            </label>
            <input type="number" {...register("amount")} className="input-dark" placeholder="0.00" min="0" />
            {errors.amount && <p style={{ fontSize: 12, color: "var(--accent-danger)", marginTop: 6 }}>{errors.amount.message}</p>}
          </div>

          {/* Category */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 8 }}>
              Category
            </label>
            <select {...register("categoryId")} className="input-dark" style={{ appearance: "none" }}>
              <option value="">Select a category</option>
              {filteredCategories.length === 0 && <option disabled>No {selectedType} categories available</option>}
              {filteredCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p style={{ fontSize: 12, color: "var(--accent-danger)", marginTop: 6 }}>{errors.categoryId.message}</p>}
          </div>

          {/* Date */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 8 }}>
              Date
            </label>
            <input type="date" {...register("date")} className="input-dark" />
            {errors.date && <p style={{ fontSize: 12, color: "var(--accent-danger)", marginTop: 6 }}>{errors.date.message}</p>}
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-muted)", marginBottom: 8 }}>
              Notes <span style={{ color: "var(--text-subtle)", fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              {...register("notes")}
              rows={3}
              className="input-dark"
              placeholder="Any additional notes…"
              style={{ resize: "vertical" }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
            <button type="button" onClick={() => navigate("/layout")} className="btn-ghost" style={{ flex: 1, padding: "13px" }}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary btn-shimmer"
              style={{ flex: 2, padding: "13px", fontSize: 15, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Saving…" : `Save ${selectedType === "income" ? "Income" : "Expense"} →`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransaction;
