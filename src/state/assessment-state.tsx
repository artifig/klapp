'use client';

import { createContext, useContext, useReducer, useEffect, useMemo, useCallback, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { AssessmentState, SetupFormData, Category, AssessmentAction } from './types';
import { assessmentReducer, defaultState } from './reducer';
import { persistenceManager } from './persistence';

// Types
export interface FormData {
  name: string;
  email: string;
  companyName: string;
  companyType: string;
}

interface AssessmentContextType {
  state: AssessmentState;
  dispatch: React.Dispatch<AssessmentAction>;
}

const AssessmentContext = createContext<AssessmentContextType | null>(null);

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(assessmentReducer, defaultState);
  const pathname = usePathname();

  // Load state from storage on mount
  useEffect(() => {
    const savedState = persistenceManager.load();
    if (savedState) {
      dispatch({ type: 'LOAD_STATE', payload: savedState });
    }
  }, []);

  // Save state to storage on change
  useEffect(() => {
    persistenceManager.save(state);
  }, [state]);

  // Handle navigation state
  useEffect(() => {
    const step = pathname.split('/')[2] as AssessmentState['navigation']['currentStep'] || 'home';
    dispatch({ type: 'SET_STEP', payload: step });
  }, [pathname]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }

  const { state, dispatch } = context;

  const setGoal = useCallback((payload: { goal: string; responseId: string }) => {
    dispatch({ type: 'SET_GOAL', payload });
  }, [dispatch]);

  const setSetupForm = useCallback((data: SetupFormData) => {
    dispatch({ type: 'SET_SETUP_FORM', payload: data });
  }, [dispatch]);

  const setEmailUpdate = useCallback((email: string) => {
    dispatch({ type: 'SET_EMAIL', payload: email });
  }, [dispatch]);

  const setAnswer = useCallback((questionId: string, answerId: string, score: number) => {
    dispatch({
      type: 'SET_ANSWER',
      payload: { questionId, answerId, score }
    });
  }, [dispatch]);

  const setCurrentCategory = useCallback((category: Category) => {
    dispatch({ type: 'SET_CATEGORY', payload: category });
  }, [dispatch]);

  const nextQuestion = useCallback(() => {
    dispatch({ type: 'NEXT_QUESTION' });
  }, [dispatch]);

  const nextCategory = useCallback(() => {
    dispatch({ type: 'NEXT_CATEGORY' });
  }, [dispatch]);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, [dispatch]);

  const resetForms = useCallback(() => {
    dispatch({ type: 'RESET_FORMS' });
  }, [dispatch]);

  const resetProgress = useCallback(() => {
    dispatch({ type: 'RESET_PROGRESS' });
  }, [dispatch]);

  return {
    ...state,
    setGoal,
    setSetupForm,
    setEmailUpdate,
    setAnswer,
    setCurrentCategory,
    nextQuestion,
    nextCategory,
    resetState,
    resetForms,
    resetProgress,
    dispatch
  } as const;
}

// Progress Component Types
interface CategoryItemProps {
  name: string;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

// Progress UI Components
const CategoryItem = ({ name, isActive, isCompleted, onClick }: CategoryItemProps) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-2 rounded-md transition-colors ${isActive
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
  const {
    assessment: { currentCategory },
    reference: { categories },
    assessment: { completedCategories },
    setCurrentCategory
  } = useAssessment();

  const t = useTranslations('assessment');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('progress.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category: Category) => (
            <CategoryItem
              key={category.id}
              name={category.text.et}
              isActive={category.id === currentCategory?.id}
              isCompleted={completedCategories.includes(category.id)}
              onClick={() => setCurrentCategory(category)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Form-specific hooks
export function useGoalForm() {
  const { forms: { goal }, setGoal } = useAssessment();
  const router = useRouter();
  const locale = useLocale();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal) return;

    setGoal({ goal: goal.goal, responseId: '' });
    router.push(`/${locale}/assessment`);
  };

  return {
    goal,
    handleSubmit,
    setGoal
  };
}

export function useEmailUpdateForm() {
  const { forms, setEmailUpdate } = useAssessment();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { emailUpdate } = forms;

    if (!emailUpdate.email) return;

    try {
      setIsSubmitting(true);
      setEmailUpdate(emailUpdate.email);
      // Here you would typically call an API to send results
      // await sendResultsToEmail(emailUpdate.email);
    } catch {
      setError('Failed to update email');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    email: forms.emailUpdate.email,
    isSubmitting,
    error,
    handleSubmit,
    setEmailUpdate
  };
}

// Export a simpler provider component
export function AssessmentStateProvider({ children }: { children: React.ReactNode }) {
  return (
    <AssessmentProvider>
      {children}
    </AssessmentProvider>
  );
} 