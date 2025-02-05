'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAssessment } from '@/state/assessment-state';
import { useMemo, useEffect, useCallback, useState } from 'react';
import { updateAssessmentResults } from '@/lib/airtable/mutations';
import type { Category } from '@/state/types';
import type { MethodSolutionLevel } from '@/lib/airtable/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface Props {
  initialData: {
    categories: Category[];
    answers: {
      id: string;
      text: { et: string; en: string };
      description?: { et: string; en: string };
      score: number;
      isActive: boolean;
      questions: string[];
    }[];
    solutionLevels: MethodSolutionLevel[];
  };
}

interface UserDetailsFormProps {
  onSubmit: (data: { name: string; email: string; companyName: string }) => void;
  isSubmitting: boolean;
}

function UserDetailsForm({ onSubmit, isSubmitting }: UserDetailsFormProps) {
  const t = useTranslations('results');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: ''
  });
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    companyName?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!formData.name.trim()) {
      newErrors.name = t('validation.name.required');
    }
    if (!formData.email.trim()) {
      newErrors.email = t('validation.email.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('validation.email.invalid');
    }
    if (!formData.companyName.trim()) {
      newErrors.companyName = t('validation.company.required');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          {t('userDetails.nameLabel')}
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            if (errors.name) setErrors({ ...errors, name: undefined });
          }}
          className={`mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary ${errors.name ? 'border-red-500' : ''
            }`}
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          {t('userDetails.emailLabel')}
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            if (errors.email) setErrors({ ...errors, email: undefined });
          }}
          className={`mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary ${errors.email ? 'border-red-500' : ''
            }`}
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
          {t('userDetails.companyNameLabel')}
        </label>
        <input
          id="companyName"
          type="text"
          value={formData.companyName}
          onChange={(e) => {
            setFormData({ ...formData, companyName: e.target.value });
            if (errors.companyName) setErrors({ ...errors, companyName: undefined });
          }}
          className={`mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary ${errors.companyName ? 'border-red-500' : ''
            }`}
          disabled={isSubmitting}
        />
        {errors.companyName && (
          <p className="mt-1 text-sm text-red-500">{errors.companyName}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full py-3 text-lg font-semibold"
        disabled={isSubmitting}
      >
        {isSubmitting ? t('userDetails.submitting') : t('userDetails.submit')}
      </Button>
    </form>
  );
}

interface CategoryLevel {
  category: Category;
  level: MethodSolutionLevel;
  score: number;
}

export function ResultsClient({ initialData }: Props) {
  const t = useTranslations('results');
  const router = useRouter();
  const {
    assessment: { answers },
    reference: { categories, methodAnswers },
    forms: { setup, goal },
    dispatch
  } = useAssessment();
  const [showUserDetailsForm, setShowUserDetailsForm] = useState(false);
  const [isSubmittingDetails, setIsSubmittingDetails] = useState(false);

  // All hooks must be called before any conditional returns
  const filteredCategories = useMemo(() => {
    return categories.filter(category =>
      category.companyType.includes(setup.companyType)
    );
  }, [categories, setup.companyType]);

  const categoryScores = useMemo(() => {
    return filteredCategories.map(category => {
      const categoryAnswers = Object.values(answers).filter(
        answer => answer.categoryId === category.id
      );

      const totalScore = categoryAnswers.reduce((sum, answer) =>
        sum + answer.score, 0
      );

      // Don't multiply by 100 here, keep the raw average
      const averageScore = categoryAnswers.length > 0
        ? totalScore / categoryAnswers.length
        : 0;

      console.log(`Category ${category.name} score calculation:`, {
        totalScore,
        answersCount: categoryAnswers.length,
        averageScore
      });

      return {
        id: category.id,
        name: category.name,
        averageScore,
        questions: category.questions.map(questionId => {
          const answer = answers[questionId];
          if (!answer) return null;

          const methodAnswer = methodAnswers.find(a => a.id === answer.answerId);
          if (!methodAnswer) return null;

          return {
            id: questionId,
            text: category.name,
            answer: {
              id: answer.answerId,
              text: methodAnswer.text.et,
              score: answer.score,
              timestamp: answer.timestamp
            }
          };
        }).filter((q): q is NonNullable<typeof q> => q !== null)
      };
    });
  }, [filteredCategories, answers, methodAnswers]);

  const categoryLevels = useMemo(() => {
    console.log('Solution levels:', initialData.solutionLevels);
    return categoryScores.map(category => {
      console.log(`Finding level for category ${category.name}:`, {
        score: category.averageScore,
        levels: initialData.solutionLevels.map(l => ({
          lower: l.levelScore_lowerThreshold,
          upper: l.levelScore_upperThreshold
        }))
      });

      const matchingLevel = initialData.solutionLevels.find(level =>
        category.averageScore >= level.levelScore_lowerThreshold &&
        category.averageScore <= level.levelScore_upperThreshold
      );

      if (!matchingLevel) {
        console.warn(`No matching level found for category ${category.name} with score ${category.averageScore}`);
        return null;
      }

      return {
        category: categories.find(c => c.id === category.id)!,
        level: matchingLevel,
        score: category.averageScore
      };
    }).filter((level): level is CategoryLevel => level !== null);
  }, [categoryScores, initialData.solutionLevels, categories]);

  const radarData = useMemo(() => {
    return categoryLevels.map(({ category, level }) => ({
      subject: category.name,
      level: level.levelText_et,
      score: level.levelScore_upperThreshold,
      fullMark: 5 // Assuming 5 is the maximum score
    }));
  }, [categoryLevels]);

  const overallScore = useMemo(() => {
    if (categoryScores.length === 0) return 0;
    return categoryScores.reduce((sum, category) =>
      sum + category.averageScore, 0
    ) / categoryScores.length;
  }, [categoryScores]);

  const questionCounts = useMemo(() => {
    const totalQuestions = filteredCategories.reduce((sum, category) =>
      sum + category.questions.length, 0
    );
    return {
      total: totalQuestions,
      answered: Object.keys(answers).length
    };
  }, [filteredCategories, answers]);

  const saveResults = useCallback(async () => {
    if (!goal.recordId) {
      console.error('No record ID found');
      return;
    }

    try {
      const response = await updateAssessmentResults({
        recordId: goal.recordId,
        responseContent: {
          metadata: {
            overallScore,
            totalQuestions: questionCounts.total,
            answeredQuestions: questionCounts.answered
          },
          categories: categoryScores
        }
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      console.log('Results saved successfully');
    } catch (error) {
      console.error('Error saving results:', error);
    }
  }, [goal.recordId, overallScore, questionCounts, categoryScores]);

  // Redirect if no goal record ID is found
  useEffect(() => {
    if (!goal.recordId) {
      console.log('No record ID found, redirecting to assessment');
      router.push('/assessment');
      return;
    }
  }, [goal.recordId, router]);

  // Use initialData to set up reference data if needed
  useEffect(() => {
    if (initialData.categories.length > 0) {
      dispatch({
        type: 'SET_REFERENCE',
        payload: {
          categories: initialData.categories,
          methodAnswers: initialData.answers
        }
      });
    }
  }, [initialData, dispatch]);

  // Save results when component mounts
  useEffect(() => {
    saveResults();
  }, [saveResults]);

  const handleUserDetailsSubmit = async (data: { name: string; email: string; companyName: string }) => {
    setIsSubmittingDetails(true);
    try {
      // Update the setup form data in state
      dispatch({
        type: 'SET_SETUP_FORM',
        payload: {
          ...data,
          companyType: setup.companyType
        }
      });

      // Save results again with the updated user details
      await saveResults();

      // TODO: Generate and download PDF report
      console.log('Generating PDF report...');

      setShowUserDetailsForm(false);
    } catch (error) {
      console.error('Error saving user details:', error);
    } finally {
      setIsSubmittingDetails(false);
    }
  };

  // If no record ID, don't render anything while redirecting
  if (!goal.recordId) {
    return null;
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardContent className="p-6">
        <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
        <div className="space-y-6">
          {/* Radar Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{t('categoryLevels')}</h2>
            <div className="w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid gridType="circle" />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#2563eb"
                    fill="#2563eb"
                    fillOpacity={0.6}
                    isAnimationActive={false}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Levels */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{t('categoryDetails')}</h2>
            <div className="space-y-4">
              {categoryLevels.map(({ category, level }) => (
                <div key={category.id} className="border-b pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{category.name}</h3>
                    <span className="text-lg font-semibold text-primary">
                      {level.levelText_et}
                    </span>
                  </div>
                  <p className="text-gray-600">
                    {level.levelDescription_et}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* User Details Form */}
          {!showUserDetailsForm ? (
            <div className="flex flex-col space-y-4">
              <Button
                onClick={() => setShowUserDetailsForm(true)}
                className="w-full py-3 text-lg font-semibold"
              >
                {t('downloadReport')}
              </Button>
              <p className="text-sm text-gray-600 text-center">
                {t('downloadReportDescription')}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">{t('userDetails.title')}</h2>
              <p className="text-gray-600 mb-4">{t('userDetails.description')}</p>
              <UserDetailsForm
                onSubmit={handleUserDetailsSubmit}
                isSubmitting={isSubmittingDetails}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 