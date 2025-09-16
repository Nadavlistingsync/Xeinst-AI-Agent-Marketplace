"use client"

import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "card" | "text" | "avatar" | "button" | "input"
  width?: string | number
  height?: string | number
  rounded?: boolean
  animated?: boolean
}

export function Skeleton({
  className,
  variant = "default",
  width,
  height,
  rounded = false,
  animated = true,
  ...props
}: SkeletonProps) {
  const baseClasses = "bg-white/5 relative overflow-hidden"
  
  const variantClasses = {
    default: "",
    card: "w-full h-48 rounded-xl",
    text: "h-4 w-full rounded",
    avatar: "h-12 w-12 rounded-full",
    button: "h-10 w-24 rounded-lg",
    input: "h-10 w-full rounded-lg"
  }
  
  const animationClasses = animated ? "after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent" : ""
  const roundedClasses = rounded ? "rounded-full" : ""
  
  const style: React.CSSProperties = {
    width: width || undefined,
    height: height || undefined
  }
  
  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses,
        roundedClasses,
        className
      )}
      style={style}
      {...props}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="space-y-3">
      <Skeleton variant="card" />
      <Skeleton variant="text" className="h-4 w-2/3" />
      <Skeleton variant="text" className="h-3 w-1/2" />
    </div>
  )
}

export function SkeletonAvatar() {
  return <Skeleton variant="avatar" />
}

export function SkeletonButton() {
  return <Skeleton variant="button" />
}

export function SkeletonInput() {
  return <Skeleton variant="input" />
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton variant="avatar" className="h-10 w-10" />
          <div className="space-y-2 flex-1">
            <Skeleton variant="text" className="h-4" />
            <Skeleton variant="text" className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5, columns = 3 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" className="h-8 flex-1" />
        ))}
      </div>
      
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" className="h-6 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}