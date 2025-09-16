import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { forwardRef, ReactNode } from "react"
import Link from "next/link"

type GlassCardVariant = "default" | "elevated" | "bordered" | "flat" | "interactive" | "gradient"
type GlassCardSize = "sm" | "md" | "lg" | "xl"

type Props = Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd'> & {
  variant?: GlassCardVariant
  size?: GlassCardSize
  hover?: boolean
  glow?: boolean
  delay?: number
  href?: string
  icon?: ReactNode
  title?: string
  subtitle?: string
  footer?: ReactNode
  loading?: boolean
  onClick?: () => void
}

const GlassCard = forwardRef<HTMLDivElement, Props>(({ 
  className, 
  variant = "default",
  size = "md",
  hover = true, 
  glow = false,
  delay = 0,
  href,
  icon,
  title,
  subtitle,
  footer,
  loading = false,
  onClick,
  children,
  ...props 
}, ref) => {
  const baseClasses = "glass overflow-hidden backdrop-blur-md"
  
  const variantClasses = {
    default: "bg-white/5 border border-white/20",
    elevated: "bg-white/8 border border-white/20 shadow-xl shadow-cyan-500/5",
    bordered: "bg-white/5 border-2 border-cyan-400/30",
    flat: "bg-white/5 border-none",
    interactive: "bg-white/5 border border-white/20 cursor-pointer",
    gradient: "bg-gradient-to-br from-white/10 to-white/5 border border-white/20"
  }
  
  const sizeClasses = {
    sm: "p-3",
    md: "p-5",
    lg: "p-6",
    xl: "p-8"
  }
  
  const hoverClasses = hover ? "glass-hover" : ""
  const glowClasses = glow ? "loading-glow" : ""
  const loadingClasses = loading ? "animate-pulse" : ""
  const clickableClasses = (onClick || href) ? "cursor-pointer" : ""

  const cardContent = (
    <>
      {(title || icon) && (
        <div className="flex items-center space-x-3 mb-4">
          {icon && <div className="text-cyan-400">{icon}</div>}
          <div>
            {title && <h3 className="font-semibold text-white text-lg">{title}</h3>}
            {subtitle && <p className="text-white/70 text-sm mt-0.5">{subtitle}</p>}
          </div>
        </div>
      )}
      
      {children}
      
      {footer && (
        <div className="mt-4 pt-4 border-t border-white/10">
          {footer}
        </div>
      )}
    </>
  )

  // If href is provided, render as Link
  if (href) {
    return (
      <Link href={href} passHref>
        <motion.a
          className={cn(
            baseClasses,
            variantClasses[variant],
            sizeClasses[size],
            hoverClasses,
            glowClasses,
            loadingClasses,
            clickableClasses,
            "block",
            className
          )}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay }}
          viewport={{ once: true }}
          whileHover={{ 
            scale: hover ? 1.02 : 1,
            y: hover ? -5 : 0,
            transition: { duration: 0.2 }
          }}
        >
          {cardContent}
        </motion.a>
      </Link>
    )
  }

  return (
    <motion.div
      ref={ref}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        hoverClasses,
        glowClasses,
        loadingClasses,
        clickableClasses,
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      whileHover={{ 
        scale: (hover && (onClick || href)) ? 1.02 : 1,
        y: (hover && (onClick || href)) ? -5 : 0,
        transition: { duration: 0.2 }
      }}
      onClick={onClick}
      {...props}
    >
      {cardContent}
    </motion.div>
  )
})

GlassCard.displayName = "GlassCard"

export { GlassCard }
export type { GlassCardVariant, GlassCardSize }