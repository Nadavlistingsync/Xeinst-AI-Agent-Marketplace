import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { forwardRef } from "react"

type Props = Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd'> & {
  hover?: boolean
  glow?: boolean
  delay?: number
}

const GlassCard = forwardRef<HTMLDivElement, Props>(({ 
  className, 
  hover = true, 
  glow = false,
  delay = 0,
  children,
  ...props 
}, ref) => {
  const baseClasses = "glass"
  const hoverClasses = hover ? "glass-hover" : ""
  const glowClasses = glow ? "loading-glow" : ""

  return (
    <motion.div
      ref={ref}
      className={cn(
        baseClasses,
        hoverClasses,
        glowClasses,
        "p-6",
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
      {...props}
    >
      {children}
    </motion.div>
  )
})

GlassCard.displayName = "GlassCard"

export { GlassCard }