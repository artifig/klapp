'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  diagonal?: boolean;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      helperText,
      error,
      icon,
      iconPosition = 'left',
      isLoading = false,
      diagonal = false,
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    // Derived states
    const hasError = !!error;
    const showLeftIcon = icon && iconPosition === 'left';
    const showRightIcon = (icon && iconPosition === 'right') || isLoading;
    
    // Generate a random ID for the input for accessibility
    const id = React.useId();
    
    return (
      <div className={cn("relative", fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            {label}
          </label>
        )}
        <div className={cn("relative", fullWidth && "w-full")}>
          <input
            id={id}
            type={type}
            ref={ref}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            className={cn(
              "form-input transition-colors duration-200",
              "h-10 px-3 py-2 text-sm placeholder:text-muted-foreground", 
              "border border-input bg-background focus-visible:outline-none",
              "focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary",
              hasError && "border-error focus-visible:ring-error focus-visible:border-error",
              showLeftIcon && "pl-9",
              showRightIcon && "pr-9",
              diagonal && "clip-path-diagonal-input",
              fullWidth && "w-full",
              className
            )}
            disabled={props.disabled || isLoading}
            {...props}
          />
          {showLeftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          {showRightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {isLoading ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                icon
              )}
            </div>
          )}
        </div>
        {helperText && !hasError && (
          <p id={`${id}-helper`} className="text-xs text-muted-foreground mt-1.5">
            {helperText}
          </p>
        )}
        {hasError && (
          <p id={`${id}-error`} className="text-xs text-error mt-1.5">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input }; 