"use client"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface TooltipProps {
  content: string
  children: React.ReactNode
  position?: "top" | "bottom" | "left" | "right"
  delay?: number
  className?: string
}

export function Tooltip({ 
  content, 
  children, 
  position = "top",
  delay = 500,
  className 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const showTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId)
    const id = setTimeout(() => setIsVisible(true), delay)
    setTimeoutId(id)
  }

  const hideTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId)
    setIsVisible(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [timeoutId])

  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2"
  }

  const arrowClasses = {
    top: "top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-cyan-400",
    bottom: "bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-cyan-400",
    left: "left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-cyan-400",
    right: "right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-cyan-400"
  }

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            className={cn(
              "absolute z-50 px-3 py-2 text-sm text-white bg-black/90 backdrop-blur-sm rounded-lg border border-cyan-400/30 shadow-lg",
              positionClasses[position],
              className
            )}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {content}
            <div 
              className={cn(
                "absolute w-0 h-0 border-4",
                arrowClasses[position]
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
