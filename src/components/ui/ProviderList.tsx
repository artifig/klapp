'use client';

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useTheme } from "@/components/providers/ThemeProvider";
import type { SolutionProvider } from "@/lib/airtable";

interface ProviderListProps {
  providers: SolutionProvider[];
  showDescription?: boolean;
  showBadge?: boolean;
  compact?: boolean;
}

export function ProviderList({ 
  providers, 
  showDescription = false, 
  showBadge = false,
  compact = false
}: ProviderListProps) {
  const { isEmbedded } = useTheme();
  
  if (providers.length === 0) return null;

  return (
    <div className="space-y-3">
      {providers.map((provider) => (
        <a
          key={provider.id}
          href={provider.providerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-accent/50 ${
            compact ? 'py-1' : 'py-2'
          }`}
        >
          <Avatar className={compact ? "h-8 w-8" : "h-10 w-10"}>
            <AvatarImage 
              src={provider.providerLogo?.[0]?.url} 
              alt={provider.providerName_et} 
            />
            <AvatarFallback className="bg-primary/10 text-primary">
              {provider.providerName_et.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className={`font-medium truncate ${compact ? 'text-sm' : 'text-base'}`}>
                {provider.providerName_et}
              </h4>
              
              {showBadge && (
                <Badge variant="outline" className="ml-auto shrink-0 text-xs">
                  Teenusepakkuja
                </Badge>
              )}
            </div>
            
            {showDescription && provider.providerDescription_et && (
              <p className={`text-muted-foreground line-clamp-2 ${
                compact || isEmbedded ? 'text-xs' : 'text-sm'
              }`}>
                {provider.providerDescription_et}
              </p>
            )}
          </div>
          
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="shrink-0 text-muted-foreground"
          >
            <path d="M7 7h10v10" />
            <path d="M7 17 17 7" />
          </svg>
        </a>
      ))}
    </div>
  );
} 