"use client"
import { motion } from "framer-motion"

interface MotionWrapperProps {
  children: React.ReactNode
}

export function MotionWrapper({ children }: MotionWrapperProps) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="min-h-screen"
    >
      {children}
    </motion.main>
  )
}
