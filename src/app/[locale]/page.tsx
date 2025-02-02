import { redirect } from 'next/navigation';
import { type NextPage } from 'next';

export interface PageProps {
    params: {
        locale: string;
    };
    searchParams: Record<string, string | string[] | undefined>;
}

const LocalePage: NextPage<PageProps> = async ({ params: { locale } }) => {
    redirect(`/${locale}/assessment`);
};

export default LocalePage; 