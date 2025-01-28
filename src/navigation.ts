import {createSharedPathnamesNavigation} from 'next-intl/navigation';
import {locales, defaultLocale} from './config';

export const {Link, redirect, usePathname, useRouter} = createSharedPathnamesNavigation({
  locales,
  defaultLocale
});

export const routes = {
  home: '/',
  intro: '/intro',
  assessment: '/assessment',
  results: '/results'
} as const; 