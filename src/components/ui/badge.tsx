import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "outline" | "success"
}

function Badge({
  className,
  variant = "primary",
  ...props
}: BadgeProps) {
  const variantClasses = {
    primary: "bg-primary text-white hover:bg-primary-dark",
    secondary: "bg-secondary text-white hover:bg-gray-600",
    outline: "bg-transparent border border-primary text-primary hover:bg-primary hover:text-white",
    success: "bg-green-600 text-white hover:bg-green-700"
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-none px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge } 