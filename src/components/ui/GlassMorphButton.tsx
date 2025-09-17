'use client';

import * as React from "react";
import { cn } from "../../lib/utils";
import { Slot } from "@radix-ui/react-slot";

interface GlassMorphButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  asChild?: boolean;
  children: React.ReactNode;
}

const GlassMorphButton = React.forwardRef<HTMLButtonElement, GlassMorphButtonProps>(
  ({ className, variant = 'default', size = 'md', asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    const baseClasses = `
      relative inline-flex items-center justify-center font-semibold
      bg-white/8 backdrop-blur-xl border border-white/20 
      rounded-full transition-all duration-300 cursor-pointer
      hover:bg-white/12 hover:border-white/40 
      focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black
      active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
      overflow-hidden group
    `;
    
    const variantClasses = {
      default: "text-white hover:text-white",
      primary: `
        bg-white/12 border-white/30 text-white
        hover:bg-white/16 hover:border-white/50 
        hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]
        before:absolute before:inset-0 before:bg-gradient-to-r 
        before:from-white/10 before:to-white/5 before:opacity-0 
        before:transition-opacity before:duration-300
        hover:before:opacity-100
      `,
      secondary: "bg-white/6 border-white/15 text-white/90 hover:text-white",
      ghost: "bg-transparent border-transparent text-white/80 hover:bg-white/8 hover:text-white",
      outline: "bg-transparent border-white/30 text-white hover:bg-white/8"
    };
    
    const sizeClasses = {
      sm: "px-4 py-2 text-sm h-9",
      md: "px-6 py-3 text-base h-11",
      lg: "px-8 py-4 text-lg h-13",
      xl: "px-10 py-5 text-xl h-15"
    };
    
    return (
      <Comp
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(255, 255, 255, 0.05)',
          textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
        }}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

GlassMorphButton.displayName = "GlassMorphButton";

export { GlassMorphButton };
