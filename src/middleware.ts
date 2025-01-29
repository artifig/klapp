import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './config';

export default createMiddleware({
  defaultLocale,
  locales,
  localePrefix: 'as-needed',
  localeDetection: true
});

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|_static|.*\\..*).*)'
  ]
}; 
