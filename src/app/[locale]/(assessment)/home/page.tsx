import { type NextPage } from 'next';
import { type PageProps } from '../../page';
import { HomeClient } from './client';

const HomePage: NextPage<PageProps> = () => {
  return <HomeClient />;
};

export default HomePage; 
