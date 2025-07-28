import { useEffect, useState } from "react";
import axios from "../api/axios";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

interface Transaction {
  _id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  category: {
    name: string;
  };
}

const Dashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get("/transactions");
      const data: Transaction[] = res.data;

      setTransactions(data.slice(0, 5));

      const incomeTotal = data
        .filter((t) => t.type === "income")
        .reduce((acc, t) => acc + t.amount, 0);

      const expenseTotal = data
        .filter((t) => t.type === "expense")
        .reduce((acc, t) => acc + t.amount, 0);

      setIncome(incomeTotal);
      setExpense(expenseTotal);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const balance = income - expense;
  const balancePercent = income > 0 ? (balance / income) * 100 : 0;

  let balanceColor = "text-green-200"; // 🟢 Default

  if (balancePercent < 20) {
    balanceColor = "text-red-300"; // 🔴
  } else if (balancePercent < 50) {
    balanceColor = "text-yellow-300"; // 🟡
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-6 relative overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-4">
          <Link
            to="/add-transaction"
            className="bg-white text-purple-700 px-5 py-2 rounded-full font-semibold shadow-md hover:shadow-lg hover:scale-105 transition"
          >
            ➕ Add Transaction
          </Link>
          <Link
            to="/transaction-history"
            className="bg-white/20 border border-white/30 px-4 py-2 rounded-full text-white hover:bg-white/30 backdrop-blur shadow transition"
          >
            📜 Transaction History
          </Link>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="bg-white/20 border border-white/30 px-4 py-2 rounded-full hover:bg-white/30 backdrop-blur shadow transition"
          >
            ⚙️ Settings
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-2xl shadow-xl backdrop-blur bg-white/30 border border-white/20">
          <h2 className="text-sm font-semibold uppercase text-white/80 mb-1">Total Income</h2>
          <p className="text-3xl font-bold text-green-200">₹ {income.toLocaleString()}</p>
        </div>
        <div className="p-6 rounded-2xl shadow-xl backdrop-blur bg-white/30 border border-white/20">
          <h2 className="text-sm font-semibold uppercase text-white/80 mb-1">Total Expenses</h2>
          <p className="text-3xl font-bold text-red-200">₹ {expense.toLocaleString()}</p>
        </div>
        <div className="p-6 rounded-2xl shadow-xl backdrop-blur bg-white/30 border border-white/20">
          <h2 className="text-sm font-semibold uppercase text-white/80 mb-1">Balance</h2>
          <p className={`text-3xl font-bold ${balanceColor}`}>₹ {balance.toLocaleString()}</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white/20 backdrop-blur rounded-2xl shadow-xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p className="text-white/70">No transactions found.</p>
        ) : (
          <ul className="divide-y divide-white/10">
            {transactions.map((tx) => (
              <li key={tx._id} className="py-4 flex justify-between items-center">
                <div>
                  <p className="text-lg font-medium">{tx.title}</p>
                  <p className="text-sm text-white/70">
                    {tx.category?.name} · {new Date(tx.date).toLocaleDateString("en-IN")}
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
        )}
      </div>

      {/* Sidebar Navigation */}
      {showSidebar && (
        <div className="absolute top-0 right-0 w-64 h-full bg-white/30 text-white backdrop-blur-xl shadow-2xl p-6 border-l border-white/20 transition-transform duration-300 z-50">
          <button
            onClick={() => setShowSidebar(false)}
            className="absolute top-4 right-4 text-white hover:text-red-300 text-xl font-bold"
          >
            ✖
          </button>
          <h3 className="text-xl font-bold mb-6">🔧 Navigation</h3>
          <ul className="space-y-4">
            <li>
              <Link to="/" className="hover:underline text-white/90">
                👤 Logout
              </Link>
            </li>
            <li>
              <Link to="/add-transaction" className="hover:underline text-white/90">
                ➕ Add Transaction
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
