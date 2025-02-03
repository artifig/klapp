import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

// Create the middleware with explicit configuration
export default createMiddleware({
  // A list of all locales that are supported
  locales,
  // Used when no locale matches
  defaultLocale,
  // Always require a locale prefix in the URL
  localePrefix: 'always'
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', `/(${locales.join('|')})/:path*`]
}; 
