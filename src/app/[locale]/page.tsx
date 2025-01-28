'use client';

import {useTranslations} from 'next-intl';
import {Link, routes} from '@/navigation';
import {useState} from 'react';
import {PageWrapper} from '@/components/ui/PageWrapper';
import {Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter} from '@/components/ui/Card';

export default function Home() {
  const t = useTranslations();
  const [goal, setGoal] = useState('');

  return (
    <PageWrapper>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            {t('app.title')}
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {t('app.description')}
          </p>
        </div>

        {/* Goal Input Card */}
        <Card animate className="mt-12">
          <CardHeader>
            <CardTitle>{t('home.goalLabel')}</CardTitle>
            <CardDescription>
              {t('home.goalPlaceholder')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full p-4 bg-gray-800/50 border border-gray-700 rounded-none text-white min-h-[100px]
                focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
              placeholder={t('home.goalPlaceholder')}
            />
          </CardContent>
          <CardFooter className="justify-end">
            <Link
              href={routes.intro}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-700 text-white font-bold 
                shadow-lg hover:from-orange-600 hover:to-orange-800 transition-all"
            >
              {t('home.startButton')}
            </Link>
          </CardFooter>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} animate>
              <CardHeader>
                <CardTitle className="text-xl">Feature {i}</CardTitle>
                <CardDescription>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
} 
