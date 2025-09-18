import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
        
        // Liquid bubble shadows
        'bubble-sm': '0 4px 20px rgba(59, 130, 246, 0.15), 0 0 40px rgba(6, 182, 212, 0.1)',
        'bubble-md': '0 8px 30px rgba(59, 130, 246, 0.2), 0 0 60px rgba(6, 182, 212, 0.15)',
        'bubble-lg': '0 12px 40px rgba(59, 130, 246, 0.25), 0 0 80px rgba(6, 182, 212, 0.2)',
        'bubble-xl': '0 20px 60px rgba(59, 130, 246, 0.3), 0 0 120px rgba(6, 182, 212, 0.25)',
        
        // Liquid glow effects
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2), 0 0 60px rgba(59, 130, 246, 0.1)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2), 0 0 60px rgba(139, 92, 246, 0.1)',
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.4), 0 0 40px rgba(236, 72, 153, 0.2), 0 0 60px rgba(236, 72, 153, 0.1)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.4), 0 0 40px rgba(6, 182, 212, 0.2), 0 0 60px rgba(6, 182, 212, 0.1)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.4), 0 0 40px rgba(16, 185, 129, 0.2), 0 0 60px rgba(16, 185, 129, 0.1)',
        
        // Floating bubble effects
        'float-sm': '0 2px 15px rgba(255, 255, 255, 0.1), 0 0 30px rgba(59, 130, 246, 0.15)',
        'float-md': '0 4px 25px rgba(255, 255, 255, 0.12), 0 0 50px rgba(59, 130, 246, 0.2)',
        'float-lg': '0 8px 35px rgba(255, 255, 255, 0.15), 0 0 70px rgba(59, 130, 246, 0.25)',
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
        
        // Liquid animations
        'bubble-float': 'bubbleFloat 4s ease-in-out infinite',
        'liquid-flow': 'liquidFlow 8s ease-in-out infinite',
        'bubble-pulse': 'bubblePulse 3s ease-in-out infinite',
        'liquid-morph': 'liquidMorph 6s ease-in-out infinite',
        'bubble-rise': 'bubbleRise 5s ease-in-out infinite',
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
        
        // Liquid keyframes
        bubbleFloat: {
          '0%, 100%': { 
            transform: 'translateY(0px) rotate(0deg) scale(1)',
            borderRadius: '1rem 1.5rem 1.2rem 1.8rem'
          },
          '33%': { 
            transform: 'translateY(-8px) rotate(2deg) scale(1.02)',
            borderRadius: '1.5rem 1rem 1.8rem 1.2rem'
          },
          '66%': { 
            transform: 'translateY(-4px) rotate(-1deg) scale(1.01)',
            borderRadius: '1.2rem 1.8rem 1rem 1.5rem'
          },
        },
        liquidFlow: {
          '0%': { 
            borderRadius: '2rem 3rem 2.5rem 3.5rem',
            transform: 'skewX(0deg) skewY(0deg)'
          },
          '25%': { 
            borderRadius: '3rem 2rem 3.5rem 2.5rem',
            transform: 'skewX(2deg) skewY(1deg)'
          },
          '50%': { 
            borderRadius: '2.5rem 3.5rem 2rem 3rem',
            transform: 'skewX(0deg) skewY(-1deg)'
          },
          '75%': { 
            borderRadius: '3.5rem 2.5rem 3rem 2rem',
            transform: 'skewX(-2deg) skewY(0deg)'
          },
          '100%': { 
            borderRadius: '2rem 3rem 2.5rem 3.5rem',
            transform: 'skewX(0deg) skewY(0deg)'
          },
        },
        bubblePulse: {
          '0%, 100%': { 
            opacity: 0.8, 
            transform: 'scale(1)',
            boxShadow: '0 8px 30px rgba(59, 130, 246, 0.2)'
          },
          '50%': { 
            opacity: 1, 
            transform: 'scale(1.05)',
            boxShadow: '0 12px 40px rgba(59, 130, 246, 0.4)'
          },
        },
        liquidMorph: {
          '0%': { borderRadius: '60% 40% 30% 70%' },
          '25%': { borderRadius: '30% 60% 70% 40%' },
          '50%': { borderRadius: '70% 30% 40% 60%' },
          '75%': { borderRadius: '40% 70% 60% 30%' },
          '100%': { borderRadius: '60% 40% 30% 70%' },
        },
        bubbleRise: {
          '0%': { 
            transform: 'translateY(100px) scale(0.8) rotate(0deg)',
            opacity: 0
          },
          '50%': { 
            transform: 'translateY(-10px) scale(1.1) rotate(180deg)',
            opacity: 1
          },
          '100%': { 
            transform: 'translateY(-100px) scale(0.8) rotate(360deg)',
            opacity: 0
          },
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