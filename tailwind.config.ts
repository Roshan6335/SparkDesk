import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Iris-violet brand family — primary accent across the whole product
        brand: {
          50: "#f3f2ff",
          100: "#e7e4ff",
          200: "#c9c3ff",
          300: "#aba1ff",
          400: "#948bff",
          500: "#847dff", // signature accent
          600: "#6a63e0",
          700: "#4b49aa", // deep variant — hover/pressed
          800: "#38377f",
          900: "#252454",
        },
        accent: {
          violet: "#847dff",
          orchid: "#dd90d8",
          periwinkle: "#90b8f0",
          cyan: "#00b3dd",
        },
        // Text hierarchy, remapped for the dark canvas
        ink: {
          900: "#f5f5f7", // primary text
          700: "#c7c8cc", // body text
          500: "#9f9fa0", // secondary / description text
          300: "#6a6b6b", // muted / mono labels
        },
        surface: {
          DEFAULT: "#0f1011", // page canvas
          soft: "#151617", // slightly lifted panels
          border: "rgba(255,255,255,0.08)",
        },
        glass: {
          DEFAULT: "rgba(255,255,255,0.04)",
          hover: "rgba(255,255,255,0.07)",
          border: "rgba(255,255,255,0.10)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #847dff 0%, #a390ff 50%, #90b8f0 100%)",
        "brand-gradient-soft": "linear-gradient(135deg, rgba(132,125,255,0.18) 0%, rgba(144,184,240,0.14) 100%)",
        "sky-atmosphere":
          "linear-gradient(180deg, #0a0d10 0%, #101d27 10%, #163a52 24%, #1a4788 40%, #3a76ac 56%, #6fa2c8 72%, #a9c7dd 86%, #6fa2c8 100%)",
      },
      borderRadius: {
        xl2: "1.25rem",
        "3xl2": "1.875rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.25)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.35), 0 20px 48px rgba(0,0,0,0.32)",
        glow: "0 0 40px rgba(132,125,255,0.25)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
