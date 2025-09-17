"use client"
import { cn } from "../../lib/utils"
import { motion } from "framer-motion"
import { forwardRef } from "react"

interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd'> {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  children?: React.ReactNode
}

const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, subtitle, actions, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "py-16 px-4",
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        {...props}
      >
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold text-glow">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xl text-white/70 max-w-2xl">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-4">
                {actions}
              </div>
            )}
          </div>
          {children && (
            <div className="mt-8">
              {children}
            </div>
          )}
        </div>
      </motion.div>
    )
  }
)

PageHeader.displayName = "PageHeader"

export { PageHeader }
