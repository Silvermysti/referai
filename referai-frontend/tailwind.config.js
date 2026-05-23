export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#090D16",
        "card-surface": "#111827",
        "muted-primary": "#64748B",
        "muted-secondary": "#94A3B8",
        "brand-blue": "#2563EB",
        "brand-green": "#10B981",
        "brand-amber": "#F59E0B",
        "brand-red": "#EF4444",
        gradient: {
          start: "#4F46E5",
          end: "#7C3AED"
        },
        /* Light theme */
        "light-bg": "#F8FAFC",
        "light-card": "#FFFFFF",
        "light-border": "#E2E8F0",
        "light-text": "#0F172A",
        "light-muted": "#64748B",
        "light-success": "#10B981",
        "light-warning": "#F59E0B"
      },
      boxShadow: {
        "glow-purple": "0 0 25px rgba(79, 70, 229, 0.05)",
        "glow-active": "0 0 20px rgba(37, 99, 235, 0.15)",
        "glow-verify": "0 0 30px rgba(79, 70, 229, 0.2)",
        "light-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "light-md": "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      },
      backdropBlur: {
        xs: "2px"
      }
    }
  },
  plugins: []
}
