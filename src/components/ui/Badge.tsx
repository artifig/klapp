'use client';

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import React from "react";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-white",
        secondary: "bg-secondary text-white",
        accent: "bg-accent text-foreground",
        outline: "bg-transparent border border-primary text-primary",
        success: "bg-success text-white",
        warning: "bg-warning text-foreground",
        error: "bg-error text-white",
        ghost: "bg-muted text-muted-foreground",
        gradient: "bg-brand-gradient text-white",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-3 py-1 text-sm",
      },
      diagonal: {
        true: "clip-path-diagonal",
        false: "",
      },
      interactive: {
        true: "cursor-pointer hover:-translate-y-0.5 active:translate-y-0",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      diagonal: false,
      interactive: false,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  count?: number;
  max?: number;
  dot?: boolean;
}

function Badge({
  className,
  variant,
  size,
  diagonal,
  interactive,
  count,
  max = 99,
  dot = false,
  children,
  ...props
}: BadgeProps) {
  // Format count if provided
  const displayValue = count !== undefined
    ? count > max
      ? `${max}+`
      : count.toString()
    : null;

  return (
    <div
      className={cn(
        badgeVariants({ variant, size, diagonal, interactive }),
        dot && "relative pl-6",
        className
      )}
      {...props}
    >
      {dot && (
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-current" />
      )}
      {displayValue ?? children}
    </div>
  );
}

export { Badge, badgeVariants }; 