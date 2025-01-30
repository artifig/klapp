import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './config';

export default createMiddleware({
  defaultLocale,
  locales,
  localePrefix: 'always'
});

export const config = {
  // Skip all internal paths (_next, api)
  // Match all routes that should be internationalized
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}; 
