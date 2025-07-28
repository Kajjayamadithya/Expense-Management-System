import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function Layout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const isAtLayoutRoot = location.pathname === "/layout";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/transactions");
        const transactions = res.data;

        let incomeTotal = 0;
        let expenseTotal = 0;

        for (const tx of transactions) {
          if (tx.type === "income") incomeTotal += tx.amount;
          else if (tx.type === "expense") expenseTotal += tx.amount;
        }

        setIncome(incomeTotal);
        setExpense(expenseTotal);
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      }
    };

    fetchData();
  }, []);

  const balance = income - expense;

  return (
    <div className="flex min-h-screen bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-white/10 backdrop-blur-md text-white flex flex-col p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-8">💸 Expense Tracker</h1>
        <nav className="flex flex-col space-y-4 text-lg font-medium">
          <Link
            to="/dashboard"
            className="hover:text-yellow-300 transition duration-200"
          >
            📊 Dashboard
          </Link>
          <Link
            to="/add-transaction"
            className="hover:text-yellow-300 transition duration-200"
          >
            ➕ Add Transaction
          </Link>
          <Link
            to="/category"
            className="hover:text-yellow-300 transition duration-200"
          >
            🗂 Manage Categories
          </Link>
          <Link
            to="/transaction-history"
            className="hover:text-yellow-300 transition duration-200"
          >
            📜 History
          </Link>
        </nav>
      </aside>

      {/* Main Section */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="flex justify-between items-center bg-white/10 backdrop-blur-md px-6 py-4 border-b border-white/20 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-semibold">
              👤 {user?.name || "User"}
            </div>
            <span className="text-sm hidden sm:block text-white/80">
              {user?.email}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold transition"
          >
            🚪 Logout
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-y-auto text-white">
          {isAtLayoutRoot ? (
            <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
              <h2 className="text-4xl font-bold mb-4">👋 Welcome, {user?.name || "User"}!</h2>
              <p className="text-lg mb-6 text-white/90">
                Here's a quick summary of your finances.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
                <div className="bg-white/10 p-4 rounded-lg shadow text-left">
                  <h3 className="font-semibold text-xl mb-1">📥 Income</h3>
                  <p className="text-2xl text-green-300">₹{income.toFixed(2)}</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg shadow text-left">
                  <h3 className="font-semibold text-xl mb-1">📤 Expenses</h3>
                  <p className="text-2xl text-red-300">₹{expense.toFixed(2)}</p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg shadow text-left">
                  <h3 className="font-semibold text-xl mb-1">💰 Total Balance</h3>
                  <p className="text-2xl text-black-300">₹{balance.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </main>
    </div>
  );
}