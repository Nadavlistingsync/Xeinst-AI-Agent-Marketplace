'use client';

import * as React from "react";
import { cn } from "../../../lib/utils";

interface LiquidGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glow' | 'flow' | 'float';
  shimmer?: boolean;
  interactive?: boolean;
  children: React.ReactNode;
}

const LiquidGlassCard = React.forwardRef<HTMLDivElement, LiquidGlassCardProps>(
  ({ className, variant = 'default', shimmer = true, interactive = true, children, ...props }, ref) => {
    const baseClasses = "liquid-glass";
    
    const variantClasses = {
      default: "",
      elevated: "liquid-glass-elevated",
      glow: "liquid-glass-glow",
      flow: "liquid-glass-flow",
      float: "liquid-glass-float"
    };
    
    const interactiveClasses = interactive ? "cursor-pointer" : "";
    const shimmerClasses = shimmer ? "" : "";
    
    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          interactiveClasses,
          shimmerClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
LiquidGlassCard.displayName = "LiquidGlassCard";

export { LiquidGlassCard };
