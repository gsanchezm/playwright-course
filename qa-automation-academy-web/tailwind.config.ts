import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Tokens estructurales: mapeados a CSS vars (conmutables por data-theme).
        // Se guardan como canales oklch desnudos -> oklch(var(--x) / <alpha-value>)
        // para que los modificadores de opacidad (bg-qa-base/70) sigan funcionando.
        qa: {
          base: "oklch(var(--bg) / <alpha-value>)",
          elevated: "oklch(var(--surface-2) / <alpha-value>)",
          panel: "oklch(var(--surface) / <alpha-value>)",
          line: "oklch(var(--border) / <alpha-value>)",
          text: "oklch(var(--text) / <alpha-value>)",
          muted: "oklch(var(--text-dim) / <alpha-value>)",
          // Colores de marca heredados (acentos antiguos, se conservan).
          cyan: "#77F2FF",
          blue: "#56B8FF",
          periwinkle: "#8FA9FF",
          lavender: "#B495FF",
          violet: "#8C5BFF",
          ice: "#D9F7FF",
        },
        // Acento verde de marca del rediseño (conmutable por tema).
        accent: "oklch(var(--accent) / <alpha-value>)",
        "accent-soft": "oklch(var(--accent-soft) / <alpha-value>)",
        "accent-fg": "oklch(var(--accent-fg) / <alpha-value>)",
        // Zona de código / terminal: CONSTANTE en ambos temas (siempre oscura).
        code: {
          bg: "#0e1726",
          border: "#1d2738",
          base: "#aab4c4",
          comment: "#5d6b7d",
          string: "#7ee0a3",
          keyword: "#caa6f2",
          fn: "#7fb4f2",
          red: "#ff5f57",
          yellow: "#febc2e",
          green: "#28c840",
          success: "#7ee0a3",
        },
        // Niveles de dificultad (constantes por tema).
        level: {
          beginner: "oklch(0.66 0.14 158)",
          intermediate: "oklch(0.74 0.13 70)",
          advanced: "oklch(0.62 0.16 25)",
        },
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "sans-serif"],
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        pill: "999px",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(119,242,255,.18), 0 0 30px rgba(86,184,255,.12)",
        // Sombra de tarjeta theme-aware (definida en index.css por tema).
        card: "var(--shadow)",
        soft: "var(--shadow)",
      },
      backgroundImage: {
        "qa-accent":
          "linear-gradient(135deg, #77F2FF 0%, #56B8FF 42%, #8FA9FF 72%, #B495FF 100%)",
        // Banda CTA del rediseño: gradiente del acento verde.
        "accent-band":
          "linear-gradient(135deg, oklch(0.62 0.14 158), oklch(0.55 0.13 162))",
      },
      keyframes: {
        "qaa-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-18px)" },
        },
        "qaa-blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "qaa-spin": {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "qaa-float": "qaa-float 14s ease-in-out infinite",
        "qaa-blink": "qaa-blink 1s step-end infinite",
        "qaa-spin": "qaa-spin 0.7s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
