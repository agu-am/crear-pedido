/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      colors: {
        // Verde de marca Pedidos Paul (CTAs primarios)
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
        // Sistema Wise (superficies, texto, semántica)
        canvas: "#ffffff",
        "canvas-soft": "#e8ebe6",
        ink: "#0e0f0c",
        "ink-deep": "#163300",
        body: "#454745",
        mute: "#868685",
        positive: "#2ead4b",
        "positive-deep": "#054d28",
        "positive-pale": "#e2f6d5",
        warning: "#ffd11a",
        "warning-deep": "#b86700",
        negative: "#d03238",
        "negative-bg": "#320707",
        "primary-pale": "#e2f6d5",
      },
      boxShadow: {
        "card": "0 1px 2px rgba(14, 15, 12, 0.04)",
        "sheet": "0 -8px 40px rgba(14, 15, 12, 0.16)",
      },
      fontSize: {
        "display-xs": ["24px", { lineHeight: "31.2px", letterSpacing: "-0.48px", fontWeight: "600" }],
        "display-sm": ["32px", { lineHeight: "38.4px", letterSpacing: "-0.96px", fontWeight: "600" }],
      },
      keyframes: {
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.25s ease-out",
      },
    },
  },
  plugins: [
    require('tailwindcss-animated')
  ],
}
