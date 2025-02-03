import {createSharedPathnamesNavigation} from 'next-intl/navigation';
import {locales, defaultLocale, routes} from './config';

export const {Link, redirect, usePathname, useRouter} = createSharedPathnamesNavigation({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

// Add a custom hook for programmatic navigation
export function useAppNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  
  return {
    navigateTo: (route: keyof typeof routes) => {
      router.push(routes[route]);
    },
    isActive: (route: keyof typeof routes) => {
      return pathname === routes[route];
    }
  };
} 