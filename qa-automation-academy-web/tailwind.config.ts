import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        qa: {
          base: "#050816",
          elevated: "#0C1226",
          panel: "#101A35",
          line: "#213052",
          text: "#EAF2FF",
          muted: "#A9B9D6",
          cyan: "#77F2FF",
          blue: "#56B8FF",
          periwinkle: "#8FA9FF",
          lavender: "#B495FF",
          violet: "#8C5BFF",
          ice: "#D9F7FF",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        sans: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(119,242,255,.18), 0 0 30px rgba(86,184,255,.12)",
        card: "0 20px 60px rgba(3, 8, 24, .45)",
      },
      backgroundImage: {
        "qa-hero":
          "radial-gradient(circle at 20% 20%, rgba(119,242,255,0.18), transparent 28%), radial-gradient(circle at 80% 10%, rgba(140,91,255,0.16), transparent 26%), radial-gradient(circle at 50% 80%, rgba(86,184,255,0.12), transparent 30%), linear-gradient(180deg, #050816 0%, #0A1124 50%, #050816 100%)",
        "qa-accent":
          "linear-gradient(135deg, #77F2FF 0%, #56B8FF 42%, #8FA9FF 72%, #B495FF 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
