import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f5ff",
          100: "#e6ebff",
          200: "#c3ccff",
          300: "#9fa9ff",
          400: "#7b7fff",
          500: "#5b57f5", // primary indigo
          600: "#4640d6",
          700: "#3730a8",
          800: "#2a2480",
          900: "#1d1958",
        },
        accent: {
          violet: "#8b5cf6",
          blue: "#4f7cff",
        },
        ink: {
          900: "#101223",
          700: "#3a3d52",
          500: "#6b6e85",
          300: "#a3a5b8",
        },
        surface: {
          DEFAULT: "#ffffff",
          soft: "#f7f8fc",
          border: "#e7e8f2",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #5b57f5 0%, #8b5cf6 50%, #4f7cff 100%)",
        "brand-gradient-soft": "linear-gradient(135deg, #f2f5ff 0%, #eef0ff 50%, #f2f0ff 100%)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,18,35,0.04), 0 8px 24px rgba(16,18,35,0.06)",
        "card-hover": "0 4px 12px rgba(16,18,35,0.08), 0 16px 40px rgba(16,18,35,0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
