import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#d9ecff",
          200: "#baddff",
          300: "#8ac7ff",
          400: "#53a7ff",
          500: "#2f86f6",
          600: "#1f68d8",
          700: "#1d55af",
          800: "#1d498c",
          900: "#1f3e73"
        },
        ink: "#0f172a",
        sand: "#f8fafc"
      },
      boxShadow: {
        soft: "0 20px 45px -25px rgba(15, 23, 42, 0.25)"
      },
      fontFamily: {
        sans: ["var(--font-sans)"]
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to right, rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.06) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
