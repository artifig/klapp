'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface NavigationItem {
  key: string;
  path: string;
}

const navigationItems: NavigationItem[] = [
  { key: 'home', path: '/' },
  { key: 'setup', path: '/setup' },
  { key: 'assessment', path: '/assessment' },
  { key: 'results', path: '/results' }
];

export function Navbar() {
  const locale = useLocale();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname.endsWith(path);
  };

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Logo />
            </div>
          </div>
          <div className="flex items-center">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 