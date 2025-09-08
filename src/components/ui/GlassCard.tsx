"use client"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { forwardRef } from "react"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  padding?: "sm" | "md" | "lg"
  children: React.ReactNode
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = true, padding = "md", children, ...props }, ref) => {
    const paddingStyles = {
      sm: "p-4",
      md: "p-6",
      lg: "p-8"
    }

    const hoverStyles = hover ? "glass-hover" : ""

    return (
      <motion.div
        ref={ref}
        className={cn(
          "glass",
          paddingStyles[padding],
          hoverStyles,
          className
        )}
        whileHover={hover ? { scale: 1.02 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

GlassCard.displayName = "GlassCard"

export { GlassCard }
