export const locales = ['et', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale = 'et' as const; 