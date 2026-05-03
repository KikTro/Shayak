import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.5rem",
        md: "3rem",
        lg: "4rem",
      },
      screens: {
        "2xl": "1200px",
      },
    },
    extend: {
      colors: {
        background: "#0A0A0A",
        foreground: "#FAFAFA",
        muted: "#1A1A1A",
        "muted-foreground": "#737373",
        accent: "#FF3D00",
        "accent-foreground": "#0A0A0A",
        border: "#262626",
        input: "#1A1A1A",
        card: "#0F0F0F",
        "card-foreground": "#FAFAFA",
        ring: "#FF3D00",
        success: "#22C55E",
        warning: "#EAB308",
        danger: "#EF4444",
      },
      borderRadius: {
        none: "0px",
        DEFAULT: "0px",
        sm: "0px",
        md: "0px",
        lg: "0px",
        xl: "0px",
        "2xl": "0px",
        full: "9999px", // reserved for avatar "dot" indicators only
      },
      fontFamily: {
        sans: ['"Inter Tight"', '"Inter"', "system-ui", "sans-serif"],
        serif: ['"Playfair Display"', "Georgia", "serif"],
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
      },
      letterSpacing: {
        tightest: "-0.06em",
        tighter: "-0.04em",
        tight: "-0.02em",
        normal: "-0.01em",
        wide: "0.05em",
        wider: "0.1em",
        widest: "0.2em",
      },
      maxWidth: {
        "8xl": "1440px",
        prose: "65ch",
      },
      spacing: {
        "18": "4.5rem",
        "30": "7.5rem",
      },
      fontSize: {
        "8xl": ["6.5rem", { lineHeight: "1" }],
        "9xl": ["8rem", { lineHeight: "1" }],
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s cubic-bezier(0.25, 0, 0, 1) forwards",
        "pulse-dot": "pulseDot 1.4s ease-in-out infinite",
        "marquee": "marquee 40s linear infinite",
        "shimmer": "shimmer 2s ease-in-out infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(0.85)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      transitionTimingFunction: {
        "editorial": "cubic-bezier(0.25, 0, 0, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
