import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './src/i18n/config';

const nextIntlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}`) && locale !== defaultLocale) {
      const newPathname = pathname.replace(`/${locale}`, `/${defaultLocale}`);
      const newUrl = request.nextUrl.clone();
      newUrl.pathname = newPathname;
      return NextResponse.redirect(newUrl);
    }
  }
  return nextIntlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!_next|api|Tehnopol_logo_RGB.png|globe.svg|next.svg|vercel.svg|window.svg|file.svg).*)',
    '/'
  ]
}; 