import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1C2521",
          50: "#F2F3F1",
          100: "#DFE3DE",
          200: "#B7C0B4",
          300: "#8E9C89",
          400: "#5E6E58",
          500: "#37453A",
          600: "#293530",
          700: "#212B26",
          800: "#1C2521",
          900: "#141B18",
        },
        paper: {
          DEFAULT: "#F7F3EC",
          soft: "#FBF9F5",
          line: "#E1DACA",
        },
        amber: {
          DEFAULT: "#E8A33D",
          50: "#FDF4E4",
          100: "#FAE7C4",
          200: "#F3CE8A",
          300: "#EDB863",
          400: "#E8A33D",
          500: "#CE8A24",
          600: "#A56E1C",
          700: "#7C5215",
        },
        moss: {
          DEFAULT: "#4B6B4E",
          50: "#EBF1EA",
          100: "#D3E0D2",
          400: "#5E8060",
          500: "#4B6B4E",
          600: "#3A5339",
        },
        clay: {
          DEFAULT: "#B4573F",
          50: "#F8E9E4",
          400: "#C56E51",
          500: "#B4573F",
          600: "#93412D",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        xs: "3px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(28, 37, 33, 0.06), 0 8px 24px -12px rgba(28, 37, 33, 0.18)",
        beacon: "0 0 0 4px rgba(232, 163, 61, 0.18)",
      },
      keyframes: {
        glow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        glow: "glow 2.4s ease-in-out infinite",
        rise: "rise 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
