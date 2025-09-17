"use client"
import { cn } from "../../lib/utils"
import { motion } from "framer-motion"
import { forwardRef, ReactNode } from "react"
import Link from "next/link"

type GlowButtonVariant = "neon" | "glass" | "ghost" | "outline" | "danger"
type GlowButtonSize = "xs" | "sm" | "md" | "lg" | "xl"

type Props = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd'> & {
  variant?: GlowButtonVariant
  size?: GlowButtonSize
  fullWidth?: boolean
  asChild?: boolean
  href?: string
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  loading?: boolean
  disabled?: boolean
}

const GlowButton = forwardRef<HTMLButtonElement, Props>(({ 
  className, 
  variant = "neon", 
  size = "md",
  fullWidth = false,
  asChild = false,
  href,
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  children,
  ...props 
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center font-bold transition-all duration-200 ease-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-black"
  
  const variantClasses = {
    neon: "btn-neon text-black border-none shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40",
    glass: "btn-glass text-white border-none",
    ghost: "bg-transparent text-white border border-white/20 hover:border-cyan-400 hover:text-cyan-400 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]",
    outline: "bg-transparent text-cyan-400 border border-cyan-400/50 hover:bg-cyan-400/10 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]",
    danger: "bg-red-500 text-white border-none hover:bg-red-600 shadow-lg shadow-red-500/20 hover:shadow-red-500/40"
  }
  
  const sizeClasses = {
    xs: "px-2 py-1 text-xs rounded-md gap-1",
    sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
    md: "px-5 py-2.5 text-base rounded-xl gap-2",
    lg: "px-7 py-3.5 text-lg rounded-xl gap-2.5",
    xl: "px-8 py-4 text-xl rounded-xl gap-3"
  }

  const widthClasses = fullWidth ? "w-full" : ""
  const disabledClasses = disabled || loading ? "opacity-60 cursor-not-allowed pointer-events-none" : ""

  const ButtonComponent = motion.button

  const buttonContent = (
    <>
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {icon && iconPosition === 'left' && !loading && <span className="inline-flex">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="inline-flex">{icon}</span>}
    </>
  )

  // If href is provided, render as Link
  if (href && !disabled) {
    return (
      <Link href={href} passHref>
        <motion.a
          className={cn(
            baseClasses,
            variantClasses[variant],
            sizeClasses[size],
            widthClasses,
            disabledClasses,
            className
          )}
          whileHover={{ scale: disabled ? 1 : 1.03 }}
          whileTap={{ scale: disabled ? 1 : 0.97 }}
          transition={{ duration: 0.2 }}
        >
          {buttonContent}
        </motion.a>
      </Link>
    )
  }

  return (
    <ButtonComponent
      ref={ref}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        widthClasses,
        disabledClasses,
        className
      )}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      transition={{ duration: 0.2 }}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {buttonContent}
    </ButtonComponent>
  )
})

GlowButton.displayName = "GlowButton"

export { GlowButton }
export type { GlowButtonVariant, GlowButtonSize }