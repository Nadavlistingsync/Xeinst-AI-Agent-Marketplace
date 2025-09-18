/**
 * Liquid Design System Tokens
 * Bubble and liquid-inspired design tokens for organic UI/UX
 */

export const liquidTokens = {
  // Colors - Bubble/Liquid inspired palette
  colors: {
    // Liquid surfaces with transparency
    liquid: {
      primary: 'rgba(59, 130, 246, 0.15)',      // Blue bubble
      secondary: 'rgba(139, 92, 246, 0.12)',    // Purple bubble
      tertiary: 'rgba(236, 72, 153, 0.10)',     // Pink bubble
      accent: 'rgba(6, 182, 212, 0.18)',        // Cyan bubble
      surface: 'rgba(255, 255, 255, 0.08)',     // Glass bubble
      border: 'rgba(255, 255, 255, 0.20)',      // Bubble outline
      borderSubtle: 'rgba(255, 255, 255, 0.10)', // Soft bubble outline
    },
    
    // Gradient bubbles
    bubbles: {
      blue: 'radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.1) 50%, transparent 100%)',
      purple: 'radial-gradient(circle at 70% 20%, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.1) 50%, transparent 100%)',
      pink: 'radial-gradient(circle at 20% 80%, rgba(236, 72, 153, 0.3) 0%, rgba(236, 72, 153, 0.1) 50%, transparent 100%)',
      cyan: 'radial-gradient(circle at 80% 60%, rgba(6, 182, 212, 0.3) 0%, rgba(6, 182, 212, 0.1) 50%, transparent 100%)',
      green: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.1) 50%, transparent 100%)',
    },
    
    // Liquid gradients
    gradients: {
      primary: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(6, 182, 212, 0.15) 100%)',
      secondary: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.15) 100%)',
      surface: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)',
      glow: 'linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(6, 182, 212, 0.3) 50%, rgba(139, 92, 246, 0.2) 100%)',
    }
  },

  // Liquid border radius - organic shapes
  radii: {
    bubble: {
      sm: '1rem 1.5rem 1.2rem 1.8rem',     // Organic small bubble
      md: '1.5rem 2rem 1.8rem 2.5rem',     // Medium bubble
      lg: '2rem 3rem 2.5rem 3.5rem',       // Large bubble
      xl: '3rem 4rem 3.5rem 4.5rem',       // Extra large bubble
    },
    organic: {
      sm: '50% 60% 40% 70%',               // Organic small
      md: '60% 40% 80% 20%',               // Organic medium  
      lg: '40% 60% 20% 80%',               // Organic large
      xl: '70% 30% 60% 40%',               // Organic extra large
    },
    liquid: {
      sm: '1rem 2rem 1.5rem 1rem',         // Liquid drop small
      md: '2rem 3rem 2.5rem 1.5rem',       // Liquid drop medium
      lg: '3rem 4rem 3.5rem 2rem',         // Liquid drop large
      xl: '4rem 5rem 4.5rem 3rem',         // Liquid drop extra large
    }
  },

  // Liquid shadows with glow effects
  shadows: {
    // Bubble shadows
    bubble: {
      sm: '0 4px 20px rgba(59, 130, 246, 0.15), 0 0 40px rgba(6, 182, 212, 0.1)',
      md: '0 8px 30px rgba(59, 130, 246, 0.2), 0 0 60px rgba(6, 182, 212, 0.15)',
      lg: '0 12px 40px rgba(59, 130, 246, 0.25), 0 0 80px rgba(6, 182, 212, 0.2)',
      xl: '0 20px 60px rgba(59, 130, 246, 0.3), 0 0 120px rgba(6, 182, 212, 0.25)',
    },
    
    // Liquid glow effects
    glow: {
      blue: '0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2), 0 0 60px rgba(59, 130, 246, 0.1)',
      purple: '0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2), 0 0 60px rgba(139, 92, 246, 0.1)',
      pink: '0 0 20px rgba(236, 72, 153, 0.4), 0 0 40px rgba(236, 72, 153, 0.2), 0 0 60px rgba(236, 72, 153, 0.1)',
      cyan: '0 0 20px rgba(6, 182, 212, 0.4), 0 0 40px rgba(6, 182, 212, 0.2), 0 0 60px rgba(6, 182, 212, 0.1)',
    },
    
    // Floating bubble effects
    float: {
      sm: '0 2px 15px rgba(255, 255, 255, 0.1), 0 0 30px rgba(59, 130, 246, 0.15)',
      md: '0 4px 25px rgba(255, 255, 255, 0.12), 0 0 50px rgba(59, 130, 246, 0.2)',
      lg: '0 8px 35px rgba(255, 255, 255, 0.15), 0 0 70px rgba(59, 130, 246, 0.25)',
    }
  },

  // Liquid motion - flowing, organic animations
  motion: {
    // Flowing durations
    duration: {
      bubble: '800ms',
      flow: '1200ms',
      float: '2000ms',
      pulse: '1500ms',
    },
    
    // Liquid easing curves
    easing: {
      bubble: 'cubic-bezier(0.34, 1.56, 0.64, 1)',      // Bouncy bubble
      flow: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',     // Smooth flow
      float: 'cubic-bezier(0.4, 0, 0.6, 1)',            // Gentle float
      liquid: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Liquid bounce
    },
    
    // Bubble spring presets
    spring: {
      bubble: { type: "spring", stiffness: 150, damping: 12, mass: 0.8 },
      flow: { type: "spring", stiffness: 100, damping: 15, mass: 1.2 },
      float: { type: "spring", stiffness: 80, damping: 20, mass: 1.5 },
    },
    
    // Keyframe animations
    keyframes: {
      float: {
        '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
        '50%': { transform: 'translateY(-10px) rotate(5deg)' },
      },
      bubble: {
        '0%': { transform: 'scale(1) rotate(0deg)', opacity: 0.8 },
        '50%': { transform: 'scale(1.1) rotate(180deg)', opacity: 1 },
        '100%': { transform: 'scale(1) rotate(360deg)', opacity: 0.8 },
      },
      pulse: {
        '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
        '50%': { opacity: 1, transform: 'scale(1.05)' },
      },
      flow: {
        '0%': { transform: 'translateX(-100%) skewX(-15deg)' },
        '100%': { transform: 'translateX(100%) skewX(-15deg)' },
      },
    },
  },

  // Backdrop filters for liquid glass effect
  backdropFilters: {
    light: 'blur(10px) saturate(1.2)',
    medium: 'blur(20px) saturate(1.5)',
    heavy: 'blur(40px) saturate(1.8)',
    glow: 'blur(30px) saturate(2) brightness(1.2)',
  },

  // Liquid spacing - more organic, flowing
  spacing: {
    bubble: {
      xs: '0.75rem',   // 12px
      sm: '1.25rem',   // 20px  
      md: '2rem',      // 32px
      lg: '3.5rem',    // 56px
      xl: '5.5rem',    // 88px
    }
  },
} as const;

export type LiquidTokens = typeof liquidTokens;
