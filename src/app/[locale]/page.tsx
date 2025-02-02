import { redirect } from 'next/navigation';

interface PageProps {
    params: Promise<{ locale: string }>;
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Page({ params }: PageProps) {
    const { locale } = await params;
    redirect(`/${locale}/assessment`);
} 