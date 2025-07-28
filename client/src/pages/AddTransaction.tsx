import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { transactionSchema } from "../utils/validationSchema";
import { useEffect, useState } from "react";
import axios from "../api/axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface Category {
  _id: string;
  name: string;
  type: "income" | "expense";
}

const AddTransaction = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(transactionSchema)
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, txRes] = await Promise.all([
          axios.get("/categories"),
          axios.get("/transactions")
        ]);

        setCategories(catRes.data);

        const allTx = txRes.data;
        const income = allTx
          .filter((t: any) => t.type === "income")
          .reduce((acc: number, t: any) => acc + t.amount, 0);
        const expense = allTx
          .filter((t: any) => t.type === "expense")
          .reduce((acc: number, t: any) => acc + t.amount, 0);

        setBalance(income - expense);
      } catch (err: any) {
        toast.error("Failed to load categories or transactions");
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      if (data.type === "expense" && data.amount > balance) {
        toast.error("Insufficient balance for this expense");
        return;
      }

      await axios.post("/transactions", data);
      toast.success("Transaction added successfully");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add transaction");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-12">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-xl bg-white/20 backdrop-blur-xl text-white p-8 rounded-2xl shadow-2xl border border-white/20 space-y-6"
      >
        <h2 className="text-3xl font-bold text-center drop-shadow">💸 Add Transaction</h2>

        <div>
          <label className="block font-semibold mb-1">Title</label>
          <input
            {...register("title")}
            className="w-full px-4 py-2 rounded bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-pink-300"
            placeholder="Transaction title"
          />
          <p className="text-pink-200 text-sm mt-1">{errors.title?.message}</p>
        </div>

        <div>
          <label className="block font-semibold mb-1">Amount</label>
          <input
            type="number"
            {...register("amount")}
            className="w-full px-4 py-2 rounded bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-pink-300"
            placeholder="₹"
          />
          <p className="text-pink-200 text-sm mt-1">{errors.amount?.message}</p>
        </div>

        <div>
          <label className="block font-semibold mb-1">Type</label>
          <select
            {...register("type")}
            className="w-full px-4 py-2 rounded bg-white/20 text-black placeholder:text-gray-700 border border-white/30 focus:outline-none focus:ring-2 focus:ring-pink-300 appearance-none"
          >
            <option value="">Select Type</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <p className="text-pink-200 text-sm mt-1">{errors.type?.message}</p>
        </div>

        <div>
          <label className="block font-semibold mb-1">Category</label>
          <select
            {...register("categoryId")}
            className="w-full px-4 py-2 rounded bg-white/20 text-black placeholder:text-gray-700 border border-white/30 focus:outline-none focus:ring-2 focus:ring-pink-300 appearance-none"
          >
            <option value="">Select Category</option>
            {categories.length === 0 && (
              <option disabled value="">
                No categories available
              </option>
            )}
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name} ({cat.type})
              </option>
            ))}
          </select>
          <p className="text-pink-200 text-sm mt-1">{errors.categoryId?.message}</p>
        </div>

        <div>
          <label className="block font-semibold mb-1">Date</label>
          <input
            type="date"
            {...register("date")}
            className="w-full px-4 py-2 rounded bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
          <p className="text-pink-200 text-sm mt-1">{errors.date?.message}</p>
        </div>

        <div>
          <label className="block font-semibold mb-1">Notes (optional)</label>
          <textarea
            {...register("notes")}
            rows={3}
            className="w-full px-4 py-2 rounded bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-pink-300"
            placeholder="Optional notes..."
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-lg font-bold tracking-wide shadow-xl bg-blue-500 hover:bg-blue-600 transition"
        >
          Add Transaction
        </button>
      </form>
    </div>
  );
};

export default AddTransaction;
