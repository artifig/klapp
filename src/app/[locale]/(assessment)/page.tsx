import { redirect } from 'next/navigation';
import { type NextPage } from 'next';
import { type PageProps } from '../page';

const AssessmentRoot: NextPage<PageProps> = async ({ params: { locale } }) => {
  redirect(`/${locale}/home`);
};

export default AssessmentRoot; 