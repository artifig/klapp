'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export function LoadingScreen() {
    const t = useTranslations('common');
    const [isLoading, setIsLoading] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, [pathname, searchParams]);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-300">
            <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                </div>
                <span className="text-primary font-medium">{t('loading')}</span>
            </div>
        </div>
    );
} 