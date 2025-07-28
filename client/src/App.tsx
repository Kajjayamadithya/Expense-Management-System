import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AddTransaction from "./pages/AddTransaction";
import Category from "./pages/Category";
import TransactionHistory from "./pages/TransactionHistory";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Router>
      <Toaster />
      <Routes>
        {/* 🌟 Public Home Page */}
        <Route path="/" element={<Home />} />

        {/* 🔐 Auth Page */}
        <Route path="/auth" element={<Auth />} />
        
        {/* 🏠 Main Layout with Navigation */ }

        <Route path="/layout" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="add-transaction" element={<AddTransaction />} />
          <Route path="category" element={<Category />} />
          <Route path="transaction-history" element={<TransactionHistory />} />
        </Route>

        {/* 🔒 Protected Dashboard & Features */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-transaction"
          element={
            <ProtectedRoute>
              <AddTransaction />
            </ProtectedRoute>
          }
        />
        <Route
          path="/category"
          element={
            <ProtectedRoute>
              <Category />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transaction-history"
          element={
            <ProtectedRoute>
              <TransactionHistory />
            </ProtectedRoute>
          }
        />
        {/* 🚧 Catch-All Redirect to Home */}
        <Route path="*" element={<NotFound/>} />
      </Routes>
    </Router>
  );
}
export default App;
