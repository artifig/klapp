'use client';

import {useTranslations} from 'next-intl';
import {Link, routes} from '@/navigation';
import {useState} from 'react';

export default function Home() {
  const t = useTranslations();
  const [goal, setGoal] = useState('');

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <h1 className="text-4xl font-bold">
          {t('app.title')}
        </h1>
        
        <p className="text-xl text-gray-300">
          {t('app.description')}
        </p>

        <div className="space-y-4">
          <label htmlFor="goal" className="block text-lg">
            {t('home.goalLabel')}
          </label>
          <textarea
            id="goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full p-4 bg-gray-900 border border-gray-700 rounded-none text-white min-h-[100px]"
            placeholder={t('home.goalPlaceholder')}
          />
        </div>

        <Link
          href={routes.intro}
          className="inline-block px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-700 text-white font-bold shadow-lg hover:from-orange-600 hover:to-orange-800 transition-all"
        >
          {t('home.startButton')}
        </Link>
      </div>
    </main>
  );
} 
