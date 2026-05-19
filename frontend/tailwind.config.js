/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Premium Color System - Obsidian Tech
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        muted: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
        },
        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--input) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",
        primary: {
          DEFAULT: "#6366f1",
          foreground: "#09090b",
        },
        secondary: {
          DEFAULT: "#27272a",
          foreground: "#6366f1",
        },
        accent: {
          DEFAULT: "#0ea5e9",
          foreground: "#6366f1",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        // Brand Colors
        'bg-main': '#09090b',
        'bg-soft': '#27272a',
        'brand-accent': '#0ea5e9',
        'brand-dark': '#6366f1',
        
        // Surface Scale
        surface: {
          DEFAULT: '#09090b',
          elevated: '#FCF8F3',
          overlay: 'rgba(9, 9, 11, 0.8)',
        },
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(to right, #6366f1, #1a3d6d)',
        'global-bg': 'linear-gradient(135deg, #09090b 0%, #27272a 35%, #0ea5e9 70%, #09090b 100%)',
        'glass-bg': 'rgba(9, 9, 11, 0.75)',
      },
      boxShadow: {
        'premium': '0 4px 24px rgba(0, 0, 0, 0.06)',
        'premium-elevated': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'accent-glow': '0 0 20px rgba(102, 252, 241, 0.3)',
      },
    },
  },
  plugins: [],
}
