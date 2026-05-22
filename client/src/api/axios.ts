import axios from "axios";

const instance = axios.create({
  baseURL: "https://expense-management-system-5.onrender.com/api",
  headers: {
    "Content-Type": "application/json"
  }
});

// Attach JWT token from localStorage
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error logger for debugging
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("AXIOS ERROR:", error); // Log full error
    return Promise.reject(error);
  }
);

export default instance;
