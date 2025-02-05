import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { LocalizedText } from './airtable/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLocalizedText(text: LocalizedText, locale: string): string {
  return text[locale as keyof LocalizedText] || '';
} 