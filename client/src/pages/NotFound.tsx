import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white px-6">
      <div className="bg-white/20 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/30 max-w-md text-center">
        <h1 className="text-6xl font-extrabold mb-4 drop-shadow">😵 404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-white/80 mb-6">
          Oops! The page you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="bg-white text-purple-700 px-6 py-2 rounded-full font-semibold shadow hover:scale-105 hover:bg-purple-100 transition"
        >
          ⬅ Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
