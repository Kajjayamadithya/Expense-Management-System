/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        dark: {
          base: "#0f1117",
          surface: "#1a1d27",
          elevated: "#22263a",
        },
        accent: {
          primary: "#6366f1",
          success: "#10b981",
          danger: "#ef4444",
          warning: "#f59e0b",
        },
      },
    },
  },
  plugins: [],
}