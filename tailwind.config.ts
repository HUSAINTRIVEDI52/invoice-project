import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        accent: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#3730a3",
        },
        google: {
          red: "#dc2626",
          yellow: "#d97706",
          green: "#059669",
          blue: "#4f46e5",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,.05), 0 10px 30px rgba(15,23,42,.08)",
        float: "0 22px 60px rgba(15,23,42,.16)",
        premium: "0 28px 90px rgba(15,23,42,.18)",
        glow: "0 24px 70px rgba(5,150,105,.26)",
      },
      borderRadius: {
        premium: "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
