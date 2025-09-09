import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
    "./node_modules/@shadcn/ui/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        foreground: "#FFFFFF",
        accent: "#00FFFF",
        "accent-secondary": "#0077FF",
        // Glass colors
        glass: {
          bg: "rgba(255, 255, 255, 0.05)",
          border: "rgba(255, 255, 255, 0.2)",
          hover: "rgba(255, 255, 255, 0.08)",
        },
        // Neon colors
        neon: {
          cyan: "#00FFFF",
          blue: "#0077FF",
          glow: "rgba(0, 255, 255, 0.7)",
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'hero': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'heading': ['2rem', { lineHeight: '1.3' }],
      },
      boxShadow: {
        'glass': '0 0 20px rgba(0, 255, 255, 0.15)',
        'glass-hover': '0 0 30px rgba(0, 255, 255, 0.25)',
        'neon': '0 0 15px rgba(0, 255, 255, 0.7)',
        'neon-hover': '0 0 30px rgba(0, 255, 255, 0.9)',
        'glow': '0 0 10px rgba(255, 255, 255, 0.8)',
        'glow-strong': '0 0 30px rgba(0, 255, 255, 0.8)',
        'inner-glow': 'inset 0 0 20px rgba(0, 255, 255, 0.1)',
      },
      backdropBlur: {
        'glass': '15px',
        'modal': '10px',
      },
      borderRadius: {
        'glass': '20px',
        'button': '12px',
      },
      animation: {
        'gradient': 'gradientShift 20s ease infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 255, 255, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-neon': 'linear-gradient(90deg, #00ffff, #0077ff)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
        'gradient-divider': 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 20%, rgba(0, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0.2) 80%, transparent 100%)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries'),
    require("tailwindcss-animate"),
    function ({ addUtilities }: any) {
      addUtilities({
        // Glass utilities
        ".glass": {
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(15px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "20px",
          boxShadow: "0 0 20px rgba(0, 255, 255, 0.15)",
        },
        ".glass-hover": {
          transition: "all 0.3s ease",
        },
        ".glass-hover:hover": {
          background: "rgba(255, 255, 255, 0.08)",
          borderColor: "rgba(0, 255, 255, 0.4)",
          boxShadow: "0 0 30px rgba(0, 255, 255, 0.25)",
          transform: "translateY(-2px)",
        },
        // Neon button utilities
        ".btn-neon": {
          background: "linear-gradient(90deg, #00ffff, #0077ff)",
          color: "#000000",
          fontWeight: "700",
          borderRadius: "12px",
          padding: "12px 24px",
          boxShadow: "0 0 15px rgba(0, 255, 255, 0.7)",
          transition: "all 0.2s ease",
          border: "none",
          cursor: "pointer",
        },
        ".btn-neon:hover": {
          transform: "scale(1.05)",
          boxShadow: "0 0 30px rgba(0, 255, 255, 0.9)",
        },
        // Glass button utilities
        ".btn-glass": {
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(15px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "12px",
          padding: "12px 24px",
          color: "#ffffff",
          fontWeight: "600",
          transition: "all 0.3s ease",
          cursor: "pointer",
        },
        ".btn-glass:hover": {
          background: "rgba(255, 255, 255, 0.1)",
          borderColor: "rgba(0, 255, 255, 0.4)",
          boxShadow: "0 0 20px rgba(0, 255, 255, 0.2)",
          transform: "translateY(-1px)",
        },
        // Text glow utilities
        ".text-glow": {
          textShadow: "0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.6)",
        },
        ".text-glow-strong": {
          textShadow: "0 0 15px rgba(255, 255, 255, 1), 0 0 30px rgba(0, 255, 255, 0.8), 0 0 45px rgba(0, 255, 255, 0.6)",
        },
        ".text-glow-subtle": {
          textShadow: "0 0 5px rgba(255, 255, 255, 0.5)",
        },
        // Section divider
        ".section-divider": {
          height: "1px",
          background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 20%, rgba(0, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0.2) 80%, transparent 100%)",
          margin: "4rem 0",
        },
        // Hover effects
        ".hover-glow:hover": {
          boxShadow: "0 0 25px rgba(0, 255, 255, 0.4)",
          transform: "translateY(-2px)",
        },
        ".hover-lift:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 10px 30px rgba(0, 255, 255, 0.2)",
        },
        // Loading states
        ".loading-glow": {
          animation: "pulseGlow 2s ease-in-out infinite",
        },
      })
    },
  ],
}

export default config