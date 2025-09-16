"use client"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ProgressBarProps {
  progress: number
  className?: string
  showPercentage?: boolean
  animated?: boolean
  color?: "cyan" | "blue" | "green" | "yellow" | "red"
}

export function ProgressBar({ 
  progress, 
  className = "",
  showPercentage = false,
  animated = true,
  color = "cyan"
}: ProgressBarProps) {
  const colorClasses = {
    cyan: "bg-cyan-400",
    blue: "bg-blue-400", 
    green: "bg-green-400",
    yellow: "bg-yellow-400",
    red: "bg-red-400"
  }

  const clampedProgress = Math.min(Math.max(progress, 0), 100)

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-white/70">Progress</span>
        {showPercentage && (
          <span className="text-sm text-white/70">{clampedProgress}%</span>
        )}
      </div>
      
      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", colorClasses[color])}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ 
            duration: animated ? 1 : 0,
            ease: "easeOut"
          }}
        />
      </div>
    </div>
  )
}

interface CircularProgressProps {
  progress: number
  size?: number
  strokeWidth?: number
  className?: string
  showPercentage?: boolean
  color?: "cyan" | "blue" | "green" | "yellow" | "red"
}

export function CircularProgress({ 
  progress, 
  size = 120,
  strokeWidth = 8,
  className = "",
  showPercentage = true,
  color = "cyan"
}: CircularProgressProps) {
  const colorClasses = {
    cyan: "stroke-cyan-400",
    blue: "stroke-blue-400",
    green: "stroke-green-400", 
    yellow: "stroke-yellow-400",
    red: "stroke-red-400"
  }

  const clampedProgress = Math.min(Math.max(progress, 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          className={colorClasses[color]}
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-white">
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
    </div>
  )
}
