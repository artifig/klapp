import {createSharedPathnamesNavigation} from 'next-intl/navigation';
import {locales, defaultLocale} from './config';

export const {Link, redirect, usePathname, useRouter} = createSharedPathnamesNavigation({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
});

export const routes = {
  home: '/',
  setup: '/setup',
  assessment: '/assessment',
  results: '/results'
} as const; 