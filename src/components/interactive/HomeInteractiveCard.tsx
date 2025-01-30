'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { useAssessmentContext } from '@/context/AssessmentContext';

export const HomeInteractiveCard = () => {
  const t = useTranslations('Home');
  const router = useRouter();
  const { setGoal } = useAssessmentContext();
  const [goalText, setGoalText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGoal(goalText);
    router.push('/setup');
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="goal"
            className="block text-sm font-medium text-gray-700"
          >
            {t('form.goal.label')}
          </label>
          <div className="mt-1">
            <textarea
              id="goal"
              name="goal"
              rows={4}
              className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder={t('form.goal.placeholder')}
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              required
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {t('form.goal.description')}
          </p>
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {t('form.submit')}
          </button>
        </div>
      </form>
    </Card>
  );
};

export default HomeInteractiveCard; 