import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#e8f0fe",
          100: "#d2e3fc",
          500: "#4285f4",
          600: "#1a73e8",
          700: "#1967d2",
          900: "#174ea6",
        },
        google: {
          red: "#ea4335",
          yellow: "#fbbc04",
          green: "#34a853",
          blue: "#4285f4",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(60,64,67,.10), 0 6px 18px rgba(60,64,67,.08)",
        float: "0 18px 45px rgba(30,41,59,.16)",
        premium: "0 24px 70px rgba(15,23,42,.14)",
        glow: "0 20px 60px rgba(26,115,232,.22)",
      },
    },
  },
  plugins: [],
};

export default config;
