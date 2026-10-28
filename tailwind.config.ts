import type { Config } from "tailwindcss";

/**
 * Pixelverse palette and typography tokens.
 * Blue-black surfaces, pearl-aqua as the lead accent (token still named `champagne`),
 * periwinkle, mint and rose-quartz in supporting roles.
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        xs: "420px",
      },
      colors: {
        arcade: {
          dark: "#06070b",        // ink
          midnight: "#0a0c13",    // deepest panel
          surface: "#10131c",     // raised surface
          surfaceHover: "#171b27",
          card: "rgba(16, 19, 28, 0.72)",
          border: "#222736",
          borderLight: "#333a52",
          champagne: "#a9e9df",   // lead accent
          champagneGlow: "rgba(169, 233, 223, 0.35)",
          orchid: "#b9a8ff",      // secondary accent
          orchidGlow: "rgba(185, 168, 255, 0.35)",
          sage: "#9fe6c3",        // success / free
          sageGlow: "rgba(159, 230, 195, 0.35)",
          rose: "#f4a3c0",        // favourites / destructive
          roseGlow: "rgba(244, 163, 192, 0.35)",
          amber: "#f3d28a",       // ratings
          // New beautiful variants
          neon: "#00f3ff",        // midnight neon
          neonGlow: "rgba(0, 243, 255, 0.35)",
          sunset: "#ff9d5c",      // sunset orange
          sunsetGlow: "rgba(255, 157, 92, 0.35)",
          forest: "#4ade80",      // forest green
          forestGlow: "rgba(74, 222, 128, 0.35)",
          purple: "#c084fc",      // deep purple
          purpleGlow: "rgba(192, 132, 252, 0.35)",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Figtree", "Outfit", "Noto Sans Devanagari", "Noto Sans Bengali", "system-ui", "sans-serif"],
        display: ["Outfit", "Plus Jakarta Sans", "Figtree", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
        heading: ["Outfit", "Plus Jakarta Sans", "Figtree", "system-ui", "sans-serif"],
        body: ["Plus Jakarta Sans", "Figtree", "Noto Sans Devanagari", "Noto Sans Bengali", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "champagne-glow": "0 0 22px -4px rgba(169, 233, 223, 0.45)",
        "orchid-glow": "0 0 22px -4px rgba(185, 168, 255, 0.45)",
        "sage-glow": "0 0 22px -4px rgba(159, 230, 195, 0.45)",
        "rose-glow": "0 0 22px -4px rgba(244, 163, 192, 0.45)",
        "neon-glow": "0 0 22px -4px rgba(0, 243, 255, 0.45)",
        "sunset-glow": "0 0 22px -4px rgba(255, 157, 92, 0.45)",
        "forest-glow": "0 0 22px -4px rgba(74, 222, 128, 0.45)",
        "purple-glow": "0 0 22px -4px rgba(192, 132, 252, 0.45)",
        mosaic: "4px 4px 0px 0px rgba(169, 233, 223, 0.2)",
        "mosaic-solid": "3px 3px 0px 0px #a9e9df",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        scanline: "scanline 8s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        glow: {
          "0%": { opacity: "0.5" },
          "100%": { opacity: "1" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
