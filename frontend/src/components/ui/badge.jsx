import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    success: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    danger: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    purple: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  }
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }
