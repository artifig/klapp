import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const locales = ['et', 'en'] as const;
export const defaultLocale = 'et' as const;

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
});

export const {Link, redirect, usePathname, useRouter} = createNavigation(routing); 