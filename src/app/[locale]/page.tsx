import { redirect } from 'next/navigation';

interface LocalePageProps {
    params: {
        locale: string;
    };
}

export default function LocalePage({ params: { locale } }: LocalePageProps) {
    redirect(`/${locale}/assessment`);
} 