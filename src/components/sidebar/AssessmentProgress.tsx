'use client';

import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useAssessmentState } from '@/state/useAssessmentState';
import ClientOnly from '@/components/ClientOnly';
import type { Category } from '@/state/types';

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

export const AssessmentProgress = () => {
  const t = useTranslations('assessment');
  const { 
    categories,
    currentCategory,
    completedCategories,
    setCurrentCategory,
    progress 
  } = useAssessmentState();

  const handleCategoryClick = (category: Category) => {
    setCurrentCategory(category);
  };

  return (
    <ClientOnly>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('progress.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category) => (
              <CategoryItem
                key={category.id}
                name={category.name}
                isActive={category.id === currentCategory?.id}
                isCompleted={completedCategories.includes(category.id)}
                onClick={() => handleCategoryClick(category)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </ClientOnly>
  );
}; 