'use client';

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { SolutionProvider } from "@/lib/airtable";

interface ProviderListProps {
  providers: SolutionProvider[];
  showDescription?: boolean;
}

export function ProviderList({ providers, showDescription = false }: ProviderListProps) {
  if (providers.length === 0) return null;

  return (
    <div>
      <p>Teenusepakkujad:</p>
      <div>
        {providers.map((provider) => (
          <a
            key={provider.id}
            href={provider.providerUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Avatar>
              <AvatarImage 
                src={provider.providerLogo?.[0]?.url} 
                alt={provider.providerName_et} 
              />
              <AvatarFallback>
                {provider.providerName_et.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4>{provider.providerName_et}</h4>
              {showDescription && <p>{provider.providerDescription_et}</p>}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
} 