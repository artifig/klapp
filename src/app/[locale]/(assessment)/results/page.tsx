import { type NextPage } from 'next';
import { type PageProps } from '../../page';
import { ResultsClient } from './client';

const ResultsPage: NextPage<PageProps> = () => {
  return <ResultsClient />;
};

export default ResultsPage; 