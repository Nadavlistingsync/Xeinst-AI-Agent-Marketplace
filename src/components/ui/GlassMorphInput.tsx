'use client';

import * as React from "react";
import { cn } from "../../lib/utils";

interface GlassMorphInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const GlassMorphInput = React.forwardRef<HTMLInputElement, GlassMorphInputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-white/80 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              `w-full px-4 py-4 text-white placeholder-white/50 font-medium
               bg-white/6 backdrop-blur-xl border border-white/20 rounded-2xl
               transition-all duration-300 outline-none
               focus:bg-white/10 focus:border-white/40 
               focus:shadow-[0_0_40px_rgba(255,255,255,0.1)]
               hover:bg-white/8 hover:border-white/30`,
              icon && "pl-12",
              className
            )}
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(255, 255, 255, 0.05)',
              textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
            }}
            {...props}
          />
        </div>
        {error && (
          <p className="text-red-400 text-sm mt-1">{error}</p>
        )}
      </div>
    );
  }
);

GlassMorphInput.displayName = "GlassMorphInput";

export { GlassMorphInput };
