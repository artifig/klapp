import { redirect } from 'next/navigation';

export default async function Page({
    params: { locale }
}: {
    params: { locale: string };
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    redirect(`/${locale}/assessment`);
} 