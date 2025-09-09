"use client"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { forwardRef } from "react"

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "neon" | "glass" | "ghost"
  size?: "sm" | "md" | "lg"
  fullWidth?: boolean
  asChild?: boolean
}

const GlowButton = forwardRef<HTMLButtonElement, Props>(({ 
  className, 
  variant = "neon", 
  size = "md",
  fullWidth = false,
  asChild = false,
  children,
  ...props 
}, ref) => {
  const baseClasses = "font-bold transition-all duration-200 ease-out cursor-pointer border-none"
  
  const variantClasses = {
    neon: "btn-neon text-black",
    glass: "btn-glass text-white",
    ghost: "bg-transparent text-white border border-white/20 hover:border-cyan-400 hover:text-cyan-400 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]"
  }
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-6 py-3 text-base rounded-xl",
    lg: "px-8 py-4 text-lg rounded-xl"
  }

  const widthClasses = fullWidth ? "w-full" : ""

  const ButtonComponent = motion.button

  return (
    <ButtonComponent
      ref={ref}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        widthClasses,
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </ButtonComponent>
  )
})

GlowButton.displayName = "GlowButton"

export { GlowButton }