/**
 * Design System Tokens
 * Apple-inspired design tokens for consistent UI/UX
 */

export const tokens = {
  // Colors - Apple-inspired palette
  colors: {
    // Glass surfaces
    glass: {
      primary: 'rgba(255, 255, 255, 0.08)',
      secondary: 'rgba(255, 255, 255, 0.05)',
      tertiary: 'rgba(255, 255, 255, 0.03)',
      border: 'rgba(255, 255, 255, 0.12)',
      borderSubtle: 'rgba(255, 255, 255, 0.06)',
    },
    
    // Semantic colors
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49',
    },
    
    // Accent colors
    accent: {
      cyan: '#06b6d4',
      blue: '#3b82f6',
      purple: '#8b5cf6',
      pink: '#ec4899',
      green: '#10b981',
      orange: '#f59e0b',
      red: '#ef4444',
    },
    
    // Neutral scale
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a',
    },
    
    // Background gradients
    gradients: {
      primary: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
      secondary: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
      dark: 'linear-gradient(135deg, #0a0a0a 0%, #171717 100%)',
      glass: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    }
  },

  // Spacing scale (4px base)
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
  },

  // Border radius
  radii: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Shadows - Apple-inspired
  shadows: {
    // Subtle depth
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    
    // Glass shadows
    glass: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    glassHover: '0 12px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
    
    // Colored shadows
    primary: '0 8px 25px rgba(14, 165, 233, 0.15)',
    accent: '0 8px 25px rgba(6, 182, 212, 0.15)',
  },

  // Typography scale
  typography: {
    // Font families
    fontFamily: {
      sans: ['SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
      mono: ['SF Mono', 'Menlo', 'Monaco', 'monospace'],
    },
    
    // Font sizes
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
      '7xl': ['4.5rem', { lineHeight: '1' }],
      '8xl': ['6rem', { lineHeight: '1' }],
      '9xl': ['8rem', { lineHeight: '1' }],
    },
    
    // Font weights
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    
    // Letter spacing
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  // Motion tokens
  motion: {
    // Durations
    duration: {
      instant: '0ms',
      fast: '150ms',
      normal: '200ms',
      slow: '250ms',
      slower: '300ms',
    },
    
    // Easing curves
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
    
    // Spring presets
    spring: {
      gentle: { type: "spring", stiffness: 120, damping: 14 },
      wobbly: { type: "spring", stiffness: 180, damping: 12 },
      stiff: { type: "spring", stiffness: 210, damping: 20 },
    },
  },

  // Z-index layers
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },

  // Breakpoints
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

export type Tokens = typeof tokens;
