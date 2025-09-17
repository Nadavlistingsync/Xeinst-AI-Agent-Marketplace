'use client';

import * as React from "react";
import { cn } from "../../../lib/utils";
import { Slot } from "@radix-ui/react-slot";

interface LiquidGlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  asChild?: boolean;
  children: React.ReactNode;
}

const LiquidGlassButton = React.forwardRef<HTMLButtonElement, LiquidGlassButtonProps>(
  ({ className, variant = 'default', size = 'md', asChild = false, children, ...props }, ref) => {
    const baseClasses = "liquid-button";
    
    const variantClasses = {
      default: "",
      primary: "liquid-button-primary",
      secondary: "bg-white/10 border-white/20",
      ghost: "bg-transparent border-white/10"
    };
    
    const sizeClasses = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
      xl: "px-12 py-6 text-xl"
    };
    
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
LiquidGlassButton.displayName = "LiquidGlassButton";

export { LiquidGlassButton };
