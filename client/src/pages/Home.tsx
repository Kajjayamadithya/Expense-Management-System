import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const features = [
  {
    title: "Track Income & Expenses",
    desc: "Monitor your financial transactions with detailed categorization and reporting.",
    icon: "📈"
  },
  {
    title: "Visual Analytics",
    desc: "Get insights with beautiful charts and graphs showing your spending patterns.",
    icon: "📊"
  },
  {
    title: "Secure & Private",
    desc: "Your financial data is protected with enterprise-grade security measures.",
    icon: "🔒"
  }
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white px-4 py-12 space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="flex justify-center items-center space-x-2 text-5xl font-bold drop-shadow">
          <span className="bg-white text-pink-600 rounded-xl px-3">💸</span>
          <h1 className="text-white">Expense Tracker</h1>
        </div>
        <p className="text-lg opacity-90">
          Manage your income and expenses with ease. Categorize transactions, track spending, and visualize your financial habits.
        </p>
        <div className="flex justify-center space-x-4 mt-6">
          <button
            onClick={() => navigate("/auth")}
            className="bg-white text-pink-600 hover:text-pink-700 font-bold py-2 px-6 rounded-full shadow-md hover:scale-105 transition-all"
          >
            Get Started →
          </button>
          
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto px-2">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-white/20 backdrop-blur-xl rounded-xl p-6 shadow-xl text-white border border-white/20 space-y-2"
          >
            <div className="text-4xl">{f.icon}</div>
            <h3 className="text-xl font-semibold">{f.title}</h3>
            <p className="text-white/90 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA Footer */}
      <div className="bg-white/20 backdrop-blur-xl border border-white/20 max-w-4xl mx-auto p-8 rounded-xl text-center shadow-2xl space-y-4">
        <h2 className="text-2xl font-bold text-white">Ready to take control of your finances?</h2>
        <p className="text-white/90">Join thousands of users who are already managing their money better with our tracker.</p>
        <button
          onClick={() => navigate("/auth")}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg flex items-center gap-2 mx-auto"
        >
          Start Tracking Today <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Home;
