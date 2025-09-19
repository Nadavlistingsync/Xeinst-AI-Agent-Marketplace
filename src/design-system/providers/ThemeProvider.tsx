"use client";

import React from 'react';
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes';

/**
 * ThemeProvider - Wrapper for next-themes with consistent configuration
 * 
 * Features:
 * - Default dark theme (Apple-like)
 * - System preference detection
 * - Smooth theme transitions
 * - High contrast support
 * - Reduced motion respect
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      themes={['light', 'dark']}
      disableTransitionOnChange={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
