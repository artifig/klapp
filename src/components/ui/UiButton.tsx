import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg'
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', isLoading, children, disabled, ...props }, ref) => {
    // Tailwind classes for different variants
    const variantClasses = {
      primary: 'bg-primary hover:bg-primary-dark text-white border-transparent',
      secondary: 'bg-secondary hover:bg-gray-600 text-white border-transparent',
      outline: 'bg-transparent border border-primary text-primary hover:bg-primary hover:text-white',
      ghost: 'bg-transparent text-secondary hover:bg-muted hover:text-primary',
      link: 'bg-transparent text-primary underline-offset-4 hover:underline p-0 h-auto',
    }
    
    // Tailwind classes for different sizes
    const sizeClasses = {
      default: 'py-2 px-4 text-base',
      sm: 'py-1 px-3 text-sm',
      lg: 'py-2.5 px-5 text-lg',
    }
    
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-medium rounded-none transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          
          // Apply variant and size classes
          variantClasses[variant],
          sizeClasses[size],
          
          // Apply custom classes
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button } 