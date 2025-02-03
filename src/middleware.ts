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
  // Skip all internal paths (_next)
  // Skip all api routes (/api)
  // Skip all static files (public folder)
  matcher: [
    // Match all pathnames except for
    // - _next
    // - api (API routes)
    // - static files in the public directory (e.g. favicon.ico)
    '/((?!api|_next|.*\\..*).*)',
    // Match root path
    '/'
  ]
}; 
