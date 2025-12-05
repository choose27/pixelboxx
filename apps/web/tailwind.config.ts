import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pixel: {
          bg: {
            primary: "#0a0a0f",
            secondary: "#12121a",
            tertiary: "#1a1a24",
            storm: "#2a2a35",
          },
          text: {
            primary: "#ffffff",
            secondary: "#a0a0b8",
            muted: "#606070",
          },
          neon: {
            pink: "#ff2d95",
            cyan: "#00f5ff",
            purple: "#bf5fff",
            lime: "#ccff00",
            gold: "#ffaa00",
          },
        },
      },
      fontFamily: {
        display: ["Archivo Black", "sans-serif"],
        body: ["Outfit", "sans-serif"],
        pixel: ["Press Start 2P", "monospace"],
      },
      animation: {
        "pixel-pulse": "pixel-pulse 2s ease-in-out infinite",
        "pixel-glow": "pixel-glow 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        pulse: "pulse 2s ease-in-out infinite",
        fadeInUp: "fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) both",
        gradientShift: "gradientShift 8s ease infinite",
        shine: "shine 0.6s ease",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.9)" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        shine: {
          to: { transform: "translateX(100%) rotate(45deg)" },
        },
        "pixel-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "pixel-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 255, 170, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(0, 255, 170, 0.5)" },
        },
      },
      spacing: {
        xs: "0.5rem",
        sm: "1rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "3rem",
        "2xl": "4rem",
        "3xl": "6rem",
      },
    },
  },
  plugins: [],
};

export default config;
