import { headers } from 'next/headers';
import { redirect } from '@/i18n/navigation';

export default async function Page() {
    // Ensure headers are properly awaited
    await headers();
    // We don't need to use the locale here since next-intl middleware will handle it
    redirect('/home');
} 