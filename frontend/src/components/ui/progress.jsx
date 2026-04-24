import * as React from "react"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef(({ className, value = 0, color = "blue", ...props }, ref) => {
  const colorMap = {
    blue: "from-blue-500 to-violet-500",
    green: "from-green-400 to-emerald-500",
    yellow: "from-yellow-400 to-orange-500",
    red: "from-red-500 to-rose-500",
  }
  return (
    <div
      ref={ref}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...props}
    >
      <div
        className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out", colorMap[color] || colorMap.blue)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
})
Progress.displayName = "Progress"

export { Progress }
