import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema, registerSchema } from "../utils/validationSchema";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

type AuthFormData = {
  name?: string;
  email: string;
  password: string;
};

const Auth = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const schema = isLogin ? loginSchema : registerSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<AuthFormData>({
    resolver: yupResolver(schema)
  });
  const onSubmit = async (data: AuthFormData) => {
    try {
      const endpoint = isLogin ? "/users/login" : "/users/register";
      const res = await axios.post(endpoint, data);
      login(res.data, res.data.token);
      toast.success(`${isLogin ? "Login" : "Register"} successful`);
      navigate("/layout");
    } catch (err: any) {
      console.error("Auth error:", err);
      const message =
        err.response?.data?.message ||
        err.message ||
        "Something went wrong";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 relative">

      {/* 🔗 Top Navigation */}
      <div className="absolute top-6 left-6 flex space-x-4">
        <button
          onClick={() => navigate("/")}
          className="bg-white/20 text-white px-4 py-2 rounded-full hover:bg-white/30 border border-white/30 transition"
        >
          ⬅ Home
        </button>

        <button
          onClick={() => {
          const token = localStorage.getItem("token");
            if (user && token) {
              navigate("/dashboard");
              } else {
                toast.error("Please login first to access the dashboard");
                navigate("/auth");
              }
            }}
            className="bg-white/20 text-white px-4 py-2 rounded-full hover:bg-white/30 border border-white/30 transition"
          >
          📊 Dashboard
        </button>
      </div>

      {/* 🔐 Auth Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-white space-y-6 border border-white/20"
      >
        <h2 className="text-3xl font-bold text-center drop-shadow">
          {isLogin ? "🔐 Login" : "📝 Register"}
        </h2>

        {!isLogin && (
          <div>
            <label className="block mb-1 font-semibold">Name</label>
            <input
              {...register("name")}
              className="w-full px-4 py-2 rounded bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="Your Name"
            />
            <p className="text-pink-200 text-sm mt-1">{errors.name?.message}</p>
          </div>
        )}

        <div>
          <label className="block mb-1 font-semibold">Email</label>
          <input
            {...register("email")}
            className="w-full px-4 py-2 rounded bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-pink-300"
            placeholder="you@example.com"
          />
          <p className="text-pink-200 text-sm mt-1">{errors.email?.message}</p>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Password</label>
          <input
            type="password"
            {...register("password")}
            className="w-full px-4 py-2 rounded bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-pink-300"
            placeholder="••••••••"
          />
          <p className="text-pink-200 text-sm mt-1">{errors.password?.message}</p>
        </div>

        <button
          type="submit"
          className={`w-full py-3 rounded-lg font-bold tracking-wide shadow-xl transition-all duration-200 ${
            isLogin
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {isLogin ? "Login" : "Register"}
        </button>

        <p className="text-center text-sm text-white/90">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="text-yellow-300 underline ml-1"
            onClick={() => {
              setIsLogin(!isLogin);
              reset();
            }}
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </form>
    </div>
  );
};

export default Auth;