"use client"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { forwardRef } from "react"

interface SectionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd'> {
  children: React.ReactNode
  className?: string
}

const Section = forwardRef<HTMLElement, SectionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <motion.section
        ref={ref}
        className={cn(
          "py-16 px-4",
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        viewport={{ once: true }}
        {...props}
      >
        <div className="container mx-auto max-w-7xl">
          {children}
        </div>
      </motion.section>
    )
  }
)

Section.displayName = "Section"

export { Section }
