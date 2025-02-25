'use client';

import React, { forwardRef } from 'react';
import { VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Button variants using class-variance-authority
export const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary/90 hover:-translate-y-0.5 shadow-sm hover:shadow-md active:translate-y-0",
        destructive: "bg-error text-white hover:bg-error/90 hover:-translate-y-0.5 active:translate-y-0",
        outline: "border border-primary border-2 bg-transparent text-primary hover:bg-primary/5 hover:-translate-y-0.5 active:translate-y-0",
        secondary: "bg-secondary text-white hover:bg-secondary/90 hover:-translate-y-0.5 active:translate-y-0",
        gradient: "bg-brand-gradient text-white hover:-translate-y-0.5 hover:shadow-md active:translate-y-0",
        ghost: "text-primary hover:bg-primary/5 hover:-translate-y-0.5 active:translate-y-0",
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
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth, 
    diagonal, 
    children, 
    isLoading, 
    icon,
    iconPosition = 'left',
    ...props 
  }, ref) => {
    // Handle accessibility
    const isDisabled = props.disabled || isLoading;
    
    // Common aria attributes for better accessibility
    const ariaProps = {
      role: "button",
      "aria-disabled": isDisabled,
      "data-loading": isLoading ? 'true' : undefined,
    };
    
    return (
      <button
        className={cn(
          buttonVariants({ variant, size, fullWidth, diagonal }),
          isLoading && "opacity-80 cursor-wait",
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...ariaProps}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {!isLoading && icon && iconPosition === 'left' && <span className="btn-icon">{icon}</span>}
          {children}
          {!isLoading && icon && iconPosition === 'right' && <span className="btn-icon">{icon}</span>}
        </span>
        {variant !== 'link' && variant !== 'ghost' && (
          <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button }; 