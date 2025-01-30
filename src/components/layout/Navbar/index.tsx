'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { SyncStatus } from '@/components/ui/SyncStatus';

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

export const Navbar = () => {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname.endsWith(path);
  };

  return (
    <nav className="w-full bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <Logo className="h-8 w-auto" />
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {navigationItems.map(({ key, path }) => (
              <Link
                key={key}
                href={path}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(path)
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t(key)}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <SyncStatus isOffline={false} status="synced" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 