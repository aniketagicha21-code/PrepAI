/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        accent: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          soft: "#EFF6FF",
        },
        surface: {
          DEFAULT: "#F8FAFC",
          muted: "#F1F5F9",
        },
      },
      boxShadow: {
        glass: "0 8px 32px rgba(15, 23, 42, 0.08)",
        "glass-dark": "0 8px 32px rgba(0, 0, 0, 0.35)",
        lift: "0 12px 40px -12px rgba(37, 99, 235, 0.25)",
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, #2563EB 0%, #4F46E5 45%, #7C3AED 100%)",
        "mesh-light":
          "radial-gradient(at 40% 20%, rgba(37, 99, 235, 0.12) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(124, 58, 237, 0.08) 0px, transparent 45%)",
        "mesh-dark":
          "radial-gradient(at 40% 20%, rgba(37, 99, 235, 0.2) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(124, 58, 237, 0.15) 0px, transparent 45%)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        shimmer: "shimmer 2.2s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
