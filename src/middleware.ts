import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

// Create the middleware with explicit configuration
export default createMiddleware({
  // A list of all locales that are supported
  locales,
  // Used when no locale matches
  defaultLocale,
  // Always use locale prefix to avoid redirects
  localePrefix: 'always'
});

export const config = {
  matcher: [
    // Match all pathnames except for:
    // - /api routes
    // - /_next routes
    // - /public files (images, etc)
    '/((?!_next|api|Tehnopol_logo_RGB.png|globe.svg|next.svg|vercel.svg|window.svg|file.svg).*)',
    '/'
  ]
}; 
