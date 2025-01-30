import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './config';
import type { NextRequest } from 'next/server';

// Create the middleware with basic config
const middleware = createMiddleware({
  defaultLocale,
  locales,
  localePrefix: 'always',
  localeDetection: false
});

// Wrap the middleware to add logging
export default async function loggingMiddleware(request: NextRequest) {
  console.log('🌐 Incoming Request:', {
    url: request.url,
    defaultLocale,
    availableLocales: locales,
    headers: {
      'accept-language': request.headers.get('accept-language'),
      'x-middleware-locale': request.headers.get('x-middleware-locale'),
      'cookie': request.headers.get('cookie')
    }
  });

  const response = await middleware(request);
  
  console.log('🌐 Middleware Response:', {
    url: response.headers.get('x-middleware-rewrite') || response.headers.get('location'),
    status: response.status,
    locale: response.headers.get('x-middleware-locale')
  });

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|_static|.*\\..*).*)'
  ]
}; 
