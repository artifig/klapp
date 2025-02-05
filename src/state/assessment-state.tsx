'use client';

import { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import type { Answer, CompanyType, Category as AirtableCategory, Question as AirtableQuestion } from '@/lib/airtable/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { AssessmentState as IAssessmentState, AssessmentAction, Category, SetupFormData } from './types';
import { assessmentReducer, defaultState } from './reducer';
import { persistenceManager } from './persistence';

// Form Types
export interface GoalFormData {
  goal: string;
}

export interface EmailUpdateFormData {
  email: string;
}

// Types
export interface Category {
  id: string;
  key: string;
  name: string;
  order: number;
  questions: Question[];
  companyType: string[];
  description?: string;
}

export interface Question {
  id: string;
  airtableId: string;
  text: string;
  categories: string[];
  answerId: string[];
  order: number;
}

export interface FormData {
  name: string;
  email: string;
  companyName: string;
  companyType: string;
}

export interface UserAnswer {
  questionId: string;
  answerId: string;
  score: number;
  categoryId: string;
  companyType: string;
  timestamp: string;
}

export interface AssessmentState {
  currentStep: 'home' | 'setup' | 'assessment' | 'results';
  goal: string | null;
  formData: FormData;
  companyTypes: CompanyType[];
  categories: Category[];
  currentCategory: Category | null;
  currentQuestion: Question | null;
  completedCategories: string[];
  answers: Record<string, UserAnswer>;
  methodAnswers: Answer[];
  error: string | null;
  progress: number;
  forms: {
    goal: GoalFormData;
    setup: SetupFormData;
    emailUpdate: EmailUpdateFormData;
  };
  isLoading: boolean;
}

type AssessmentContextType = {
  state: IAssessmentState;
  dispatch: React.Dispatch<AssessmentAction>;
};

const AssessmentContext = createContext<AssessmentContextType | null>(null);

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [state, dispatch] = useReducer(assessmentReducer, defaultState, persistenceManager.load);

  // Sync with localStorage
  useEffect(() => {
    persistenceManager.save(state);
  }, [state]);

  // Reset state when landing on home page
  useEffect(() => {
    if (pathname === '/' || pathname.endsWith('/home')) {
      dispatch({ type: 'RESET_STATE' });
    }
  }, [pathname]);

  // Update step based on pathname
  useEffect(() => {
    const step = pathname.endsWith('/setup') ? 'setup'
      : pathname.endsWith('/assessment') ? 'assessment'
        : pathname.endsWith('/results') ? 'results'
          : 'home';

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

  const actions = useMemo(() => ({
    setGoal: (goal: string) => dispatch({ type: 'SET_GOAL', payload: goal }),

    setSetupForm: (data: SetupFormData) =>
      dispatch({ type: 'SET_SETUP_FORM', payload: data }),

    setEmailUpdate: (email: string) =>
      dispatch({ type: 'SET_EMAIL', payload: email }),

    setAnswer: (questionId: string, answerId: string, score: number) =>
      dispatch({ type: 'SET_ANSWER', payload: { questionId, answerId, score } }),

    setCategory: (category: IAssessmentState['assessment']['currentCategory']) => {
      if (category) {
        dispatch({ type: 'SET_CATEGORY', payload: category });
      }
    },

    nextQuestion: () => dispatch({ type: 'NEXT_QUESTION' }),

    nextCategory: () => dispatch({ type: 'NEXT_CATEGORY' }),

    resetState: () => dispatch({ type: 'RESET_STATE' }),

    resetForms: () => dispatch({ type: 'RESET_FORMS' }),

    resetProgress: () => dispatch({ type: 'RESET_PROGRESS' })
  }), [dispatch]);

  return {
    ...state,
    ...actions
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
    categories,
    currentCategory,
    completedCategories,
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
          {categories.map((category) => (
            <CategoryItem
              key={category.id}
              name={category.name}
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
  const { goal, setGoal } = useAssessment();
  const router = useRouter();
  const locale = useLocale();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal) return;

    setGoal(goal);
    router.push(`/${locale}/setup`);
  };

  return {
    goal,
    handleSubmit,
    setGoal
  };
}

export function useSetupForm() {
  const { forms, setSetupForm, companyTypes } = useAssessment();
  const router = useRouter();
  const locale = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const { setup } = forms;
    if (!setup.name || !setup.email || !setup.companyName || !setup.companyType) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSetupForm(setup);
      router.push(`/${locale}/assessment`);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('An error occurred while submitting the form');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData: forms.setup,
    companyTypes,
    handleSubmit,
    setSetupForm,
    isSubmitting,
    error
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