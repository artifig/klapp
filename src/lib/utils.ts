import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CategoryScore } from "./types";
import type { SolutionProvider } from "./airtable";

export function cn(...inputs: ClassValue[]) {
  // Merge class names
  return twMerge(clsx(inputs));
}

export function getTopProviders(categoryScores: CategoryScore[], limit: number = 3): SolutionProvider[] {
  const providerCounts = new Map<string, { count: number; provider: SolutionProvider }>();
  
  categoryScores.forEach(category => {
    // Count providers from recommendations
    category.recommendations.forEach(rec => {
      rec.providers.forEach(provider => {
        const existing = providerCounts.get(provider.id);
        if (existing) {
          existing.count += 1;
        } else {
          providerCounts.set(provider.id, { count: 1, provider });
        }
      });
    });
    
    // Count providers from solutions
    category.solutions.forEach(solution => {
      solution.providers.forEach(provider => {
        const existing = providerCounts.get(provider.id);
        if (existing) {
          existing.count += 1;
        } else {
          providerCounts.set(provider.id, { count: 1, provider });
        }
      });
    });
  });

  return Array.from(providerCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(item => item.provider);
}

export function calculateMaturityLevel(score: number): {
  level: string;
  color: 'red' | 'yellow' | 'green';
} {
  if (score < 40) {
    return { level: 'Punane', color: 'red' };
  } else if (score < 70) {
    return { level: 'Kollane', color: 'yellow' };
  } else {
    return { level: 'Roheline', color: 'green' };
  }
}

export function calculateAverageScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}