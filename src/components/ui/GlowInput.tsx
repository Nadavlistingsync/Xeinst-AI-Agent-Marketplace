"use client"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface GlowInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const GlowInput = forwardRef<HTMLInputElement, GlowInputProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-white">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-xl border border-glass bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all duration-200",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-white/60">{helperText}</p>
        )}
      </div>
    )
  }
)

GlowInput.displayName = "GlowInput"

export { GlowInput }
