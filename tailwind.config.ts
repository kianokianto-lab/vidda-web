import type { Config } from "tailwindcss";

/**
 * VIDDA WEAR design tokens.
 * Brand-locked palette + typography. Do not extend without owner sign-off.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink:       "#0a0a0a", // Primary surface (black)
        ivory:     "#F1ECE3", // Off-white
        burgundy:  "#800020", // Accent
        burgundyD: "#4a0013", // Burgundy depth
        sand:      "#C8B89B", // Summer '26
        slate:     "#3F4549", // Summer '26 cool counter
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "Inter Tight", "system-ui", "sans-serif"],
        display: ["var(--font-cairo)", "Inter Tight", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.02em",
        eyebrow: "0.18em",
      },
      maxWidth: {
        wrap: "1200px",
      },
      boxShadow: {
        cinematic: "0 30px 80px rgba(0,0,0,0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
