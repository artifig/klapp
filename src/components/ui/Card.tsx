'use client';

import React, { forwardRef } from 'react';
import { VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/ThemeProvider';

// Card variants
const cardVariants = cva(
  "overflow-hidden transition-all duration-300 relative",
  {
    variants: {
      variant: {
        default: "bg-background border border-border shadow-sm",
        elevated: "bg-background shadow-md",
        outlined: "bg-transparent border border-border",
        filled: "bg-muted",
        gradient: "bg-brand-gradient text-white border-none",
      },
      size: {
        sm: "p-3",
        default: "p-5",
        lg: "p-6",
      },
      interactive: {
        true: "hover:shadow-modern hover:-translate-y-1 card-hover-effect cursor-pointer transform",
      },
      diagonal: {
        true: "",
        false: "rounded-lg",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      interactive: false,
      diagonal: false,
    },
  }
);

// Card Header
const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

// Card Title
const CardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & { as?: React.ElementType }
>(({ className, as: Component = "h3", ...props }, ref) => (
  <Component
    ref={ref}
    className={cn("text-lg font-bold leading-tight tracking-tight text-foreground", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

// Card Description
const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

// Card Content
const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

// Card Footer
const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// Card Image - New component
const CardImage = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { src: string; alt: string }
>(({ className, src, alt, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("w-full overflow-hidden", className)}
    {...props}
  >
    <img 
      src={src} 
      alt={alt} 
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
    />
  </div>
));
CardImage.displayName = "CardImage";

// Main Card Component
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  as?: React.ElementType;
  withHoverEffect?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant, 
    size, 
    interactive,
    diagonal,
    as: Component = "div",
    withHoverEffect = false,
    ...props 
  }, ref) => {
    const { isEmbedded } = useTheme();
    
    // Adjust styling when embedded
    const embeddedClass = isEmbedded ? 'embedded-card max-w-full shadow-none' : '';
    
    return (
      <Component
        ref={ref}
        className={cn(
          cardVariants({ variant, size, interactive, diagonal }), 
          embeddedClass, 
          withHoverEffect && "group",
          className
        )}
        data-diagonal={diagonal}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardImage }; 