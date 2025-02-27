'use client';

import { Button } from "@/components/ui/UiButton";
import { useRouter } from "next/navigation";

interface ErrorStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}

export function ErrorState({
  title,
  description,
  actionText = "Tagasi algusesse",
  actionHref = "/assessment",
}: ErrorStateProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-8 w-8 text-red-600" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold text-secondary mb-2">{title}</h2>
      <p className="text-gray-600 max-w-md mb-8">{description}</p>
      
      <Button 
        variant="primary"
        onClick={() => router.push(actionHref)}
        className="px-6"
      >
        {actionText}
      </Button>
    </div>
  );
} 