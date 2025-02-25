'use client';

import React, { forwardRef } from 'react';
import { VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Button variants using class-variance-authority
export const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary/90 hover:-translate-y-1 shadow-sm hover:shadow-md",
        destructive: "bg-error text-white hover:bg-error/90 hover:-translate-y-1",
        outline: "border border-primary border-2 bg-transparent text-primary hover:bg-primary/5 hover:-translate-y-1",
        secondary: "bg-secondary text-white hover:bg-secondary/90 hover:-translate-y-1",
        gradient: "bg-brand-gradient text-white hover:-translate-y-1 hover:shadow-md",
        ghost: "text-primary hover:bg-primary/5",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 rounded-md",
        sm: "h-8 px-3 text-xs rounded-md",
        lg: "h-12 px-6 text-base rounded-md",
        icon: "h-10 w-10 rounded-md",
      },
      fullWidth: {
        true: "w-full",
      },
      diagonal: {
        true: "button-diagonal",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
      diagonal: false,
    },
  }
);

export interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, diagonal, children, ...props }, ref) => {
    // Handle accessibility
    const isDisabled = props.disabled;
    
    // Common aria attributes for better accessibility
    const ariaProps = {
      role: "button",
      "aria-disabled": isDisabled,
    };
    
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, diagonal }), className)}
        ref={ref}
        {...ariaProps}
        {...props}
      >
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button }; 