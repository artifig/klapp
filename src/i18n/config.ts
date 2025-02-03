export const locales = ['et', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale = 'et' as const;

export const routes = {
  home: '/',
  // Assessment flow routes
  setup: '/(assessment)/setup',
  assessment: '/(assessment)/assessment',
  results: '/(assessment)/results',
  validate: '/(assessment)/validate'
} as const; 