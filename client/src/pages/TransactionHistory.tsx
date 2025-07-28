import { useEffect, useState } from "react";
import axios from "../api/axios";
import { toast } from "react-hot-toast";
import { unparse } from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line
} from "recharts";

interface Transaction {
  _id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: { name: string };
  date: string;
}

interface Category {
  _id: string;
  name: string;
  type: "income" | "expense";
}

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filtered, setFiltered] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, catRes] = await Promise.all([
          axios.get("/transactions"),
          axios.get("/categories")
        ]);
        setTransactions(txRes.data);
        setFiltered(txRes.data);
        setCategories(catRes.data);
      } catch (err: any) {
        toast.error("Failed to load data");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filteredTx = [...transactions];

    if (typeFilter) {
      filteredTx = filteredTx.filter((tx) => tx.type === typeFilter);
    }

    if (categoryFilter) {
      filteredTx = filteredTx.filter((tx) => tx.category?.name === categoryFilter);
    }

    if (startDate) {
      filteredTx = filteredTx.filter(
        (tx) => new Date(tx.date) >= new Date(startDate)
      );
    }

    if (endDate) {
      filteredTx = filteredTx.filter(
        (tx) => new Date(tx.date) <= new Date(endDate)
      );
    }

    setFiltered(filteredTx);
  }, [typeFilter, categoryFilter, startDate, endDate, transactions]);

  const exportCSV = () => {
    const csv = unparse(
      filtered.map((tx) => ({
        Title: tx.title,
        Amount: tx.amount,
        Type: tx.type,
        Category: tx.category?.name,
        Date: new Date(tx.date).toLocaleDateString()
      }))
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartData = [
    {
      name: "Income",
      total: filtered
        .filter((tx) => tx.type === "income")
        .reduce((sum, tx) => sum + tx.amount, 0)
    },
    {
      name: "Expense",
      total: filtered
        .filter((tx) => tx.type === "expense")
        .reduce((sum, tx) => sum + tx.amount, 0)
    }
  ];

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Transaction History", 14, 22);
    doc.setFontSize(12);
    doc.setTextColor(100);

    const tableData = filtered.map((tx) => [
      tx.title,
      `₹${tx.amount}`,
      tx.type,
      tx.category?.name || "-",
      new Date(tx.date).toLocaleDateString()
    ]);

    autoTable(doc, {
      startY: 30,
      head: [["Title", "Amount", "Type", "Category", "Date"]],
      body: tableData
    });

    doc.save("transactions.pdf");
  };

  const lineChartData = Object.values(
    filtered.reduce((acc, tx) => {
      const dateKey = new Date(tx.date).toLocaleDateString("en-CA"); // yyyy-mm-dd
      if (!acc[dateKey]) acc[dateKey] = { date: dateKey, income: 0, expense: 0 };
      acc[dateKey][tx.type] += tx.amount;
      return acc;
    }, {} as Record<string, { date: string; income: number; expense: number }>)
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-12 text-white">
      <div className="max-w-6xl mx-auto bg-white/20 backdrop-blur-xl p-6 rounded-xl border border-white/30 shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center drop-shadow">
          🧾 Transaction History
        </h2>

        {/* 🔍 Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white/20 text-black px-4 py-2 rounded w-full md:w-1/3 border border-white/30"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white/20 text-black px-4 py-2 rounded w-full md:w-1/3 border border-white/30"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* 📅 Date Range */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="date"
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-white/20 text-black px-4 py-2 rounded w-full md:w-1/2 border border-white/30"
          />
          <input
            type="date"
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-white/20 text-black px-4 py-2 rounded w-full md:w-1/2 border border-white/30"
          />
        </div>

        {/* 📊 Bar Chart */}
        <div className="w-full h-64 mb-6 bg-white/10 rounded-xl p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#ffffff" />
              <YAxis stroke="#ffffff" />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 📈 Line Chart by Date */}
        <div className="w-full h-64 mb-6 bg-white/10 rounded-xl p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineChartData}>
              <XAxis dataKey="date" stroke="#ffffff" />
              <YAxis stroke="#ffffff" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#34d399"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Income"
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#f87171"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Expense"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ⬇ Export Button */}
        <button
          onClick={exportCSV}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded shadow mb-6"
        >
          ⬇ Export to CSV
        </button>

            <button
            onClick={exportPDF}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded shadow  ml-4"
            >
            🧾 Export to PDF
          </button>

        {/* 📜 Scrollable Transaction List */}
        {filtered.length === 0 ? (
          <p className="text-center text-white/80">No transactions found.</p>
        ) : (
          <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            <ul className="space-y-3">
              {filtered.map((tx) => (
                <li
                  key={tx._id}
                  className="flex justify-between items-center p-4 bg-white/20 rounded-xl border border-white/20"
                >
                  <div>
                    <p className="font-semibold text-white">{tx.title}</p>
                    <p className="text-white/80 text-sm">
                      {tx.category?.name} ·{" "}
                      {new Date(tx.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p
                    className={`text-lg font-bold ${
                      tx.type === "income" ? "text-green-300" : "text-red-300"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}₹{tx.amount}
                  </p>
                  
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;