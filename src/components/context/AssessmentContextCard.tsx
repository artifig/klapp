'use client';

import { useTranslations } from 'next-intl';
import Card from '@/components/ui/Card';
import { useAssessmentContext } from '@/context/AssessmentContext';
import ClientOnly from '@/components/ClientOnly';

interface CategoryItemProps {
  name: string;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

const CategoryItem = ({ name, isActive, isCompleted, onClick }: CategoryItemProps) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
      isActive
        ? 'bg-primary text-white'
        : isCompleted
        ? 'bg-green-50 text-green-700'
        : 'hover:bg-gray-50'
    }`}
  >
    <div className="flex items-center justify-between">
      <span>{name}</span>
      {isCompleted && <span className="text-green-500">✓</span>}
    </div>
  </button>
);

export const AssessmentContextCard = () => {
  const t = useTranslations('assessment');
  const { 
    categories,
    currentCategory,
    completedCategories = [],
    setCurrentCategory,
    progress 
  } = useAssessmentContext();

  return (
    <ClientOnly>
      <Card>
        <div className="space-y-6">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{t('progress')}</span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">
              {t('categories.title')}
            </h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <CategoryItem
                  key={category.id}
                  name={category.name}
                  isActive={currentCategory?.id === category.id}
                  isCompleted={completedCategories.includes(category.id)}
                  onClick={() => setCurrentCategory(category)}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>
    </ClientOnly>
  );
};

export default AssessmentContextCard; 