import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        nexus: {
          bg: "#F3F7FC",
          surface: "#FFFFFF",
          cyan: "#17B89F",
          violet: "#3D5AFE",
          success: "#0FA968",
          warning: "#D08A10",
          danger: "#FF4444",
          text: "#111827",
          muted: "#5B6B82",
        },
      },
      fontFamily: {
        display: ["Orbitron", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 10px 30px rgba(23, 184, 159, 0.25)",
        glowSoft: "0 8px 20px rgba(17, 24, 39, 0.08)",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(17, 24, 39, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(17, 24, 39, 0.04) 1px, transparent 1px)",
        scanlines:
          "repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 3px)",
      },
      animation: {
        pulseRing: "pulseRing 2s ease-out infinite",
        breathe: "breathe 2.4s ease-in-out infinite",
      },
      keyframes: {
        pulseRing: {
          "0%": { transform: "scale(0.95)", opacity: "0.6" },
          "70%": { transform: "scale(1.35)", opacity: "0" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
        breathe: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
