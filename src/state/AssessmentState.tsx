'use client';

import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import type { Answer, CompanyType } from '@/lib/airtable/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

// Form Types
export interface GoalFormData {
  goal: string;
}

export interface SetupFormData {
  name: string;
  email: string;
  companyName: string;
  companyType: string;
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
  categoryId: string[];
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

const defaultState: AssessmentState = {
  currentStep: 'home',
  goal: null,
  formData: { name: '', email: '', companyName: '', companyType: '' },
  companyTypes: [],
  categories: [],
  currentCategory: null,
  currentQuestion: null,
  completedCategories: [],
  answers: {},
  methodAnswers: [],
  error: null,
  progress: 0,
  forms: {
    goal: { goal: '' },
    setup: { name: '', email: '', companyName: '', companyType: '' },
    emailUpdate: { email: '' }
  },
  isLoading: false
};

const AssessmentContext = createContext<ReturnType<typeof useAssessmentState> | null>(null);

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const assessmentState = useAssessmentState();
  return (
    <AssessmentContext.Provider value={assessmentState}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
}

export function useAssessmentState() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [state, setState] = useState<AssessmentState>(() => {
    if (typeof window === 'undefined') return defaultState;
    try {
      const saved = localStorage.getItem('assessment-state');
      return saved ? JSON.parse(saved) : defaultState;
    } catch {
      return defaultState;
    }
  });

  // Sync with localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('assessment-state', JSON.stringify(state));
    }
  }, [state]);

  // Sync step with pathname
  useEffect(() => {
    const step = pathname.endsWith('/setup') ? 'setup'
      : pathname.endsWith('/assessment') ? 'assessment'
        : pathname.endsWith('/results') ? 'results'
          : 'home';

    if (step !== state.currentStep) {
      setState(prev => ({ ...prev, currentStep: step }));
      if (step === 'home') setState(defaultState);
    }
  }, [pathname, state.currentStep]);

  // Add loading state management
  useEffect(() => {
    setState(prev => ({ ...prev, isLoading: true }));

    const timer = setTimeout(() => {
      setState(prev => ({ ...prev, isLoading: false }));
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Calculate filtered categories based on selected company type
  const filteredCategories = useMemo(() => {
    // Only filter and log when we have both categories and a selected company type
    if (state.categories.length === 0 || !state.formData.companyType) {
      return state.categories;
    }

    const filtered = state.categories.filter(category =>
      category.companyType.includes(state.formData.companyType)
    );

    console.log('🎯 Filtering categories:', {
      selectedCompanyType: state.formData.companyType,
      totalCategories: state.categories.length,
      filteredCategories: filtered.length,
      details: filtered.map(cat => ({
        id: cat.id,
        name: cat.name,
        companyTypes: cat.companyType,
        matchedWith: state.formData.companyType
      }))
    });

    return filtered;
  }, [state.categories, state.formData.companyType]);

  // Update currentCategory and currentQuestion when filteredCategories changes
  useEffect(() => {
    if (filteredCategories.length > 0 && !state.currentCategory) {
      setState(prev => ({
        ...prev,
        currentCategory: filteredCategories[0],
        currentQuestion: filteredCategories[0]?.questions[0] || null
      }));
    }
  }, [filteredCategories, state.currentCategory]);

  // Memoize answer-related functions
  const answerFunctions = useMemo(() => ({
    getAnswer: (questionId: string, context?: string): Answer | undefined => {
      const answer = state.answers[questionId];
      if (context) {
        console.log('🔍 Getting answer:', {
          context,
          questionId,
          found: !!answer,
          answer: answer || 'Not found'
        });
      }
      return answer;
    },

    setAnswer: (questionId: string, answerId: string, score: number) => {
      setState(prev => {
        if (!prev.currentCategory) return prev;

        const answer: Answer = {
          questionId,
          answerId,
          score,
          categoryId: prev.currentCategory.id,
          timestamp: new Date().toISOString()
        };

        console.log('💾 Saving answer:', {
          categoryName: prev.currentCategory.name,
          questionId,
          answerId,
          score,
          existingAnswers: Object.keys(prev.answers).length,
        });

        return {
          ...prev,
          answers: {
            ...prev.answers,
            [questionId]: answer
          }
        };
      });
    },

    updateAnswer: (questionId: string, answerId: string, score: number) => {
      setState(prev => {
        const existingAnswer = prev.answers[questionId];
        if (!existingAnswer || !prev.currentCategory) return prev;

        const updatedAnswer: Answer = {
          ...existingAnswer,
          answerId,
          score,
          timestamp: new Date().toISOString()
        };

        console.log('✏️ Updating answer:', {
          questionId,
          oldAnswer: existingAnswer,
          newAnswer: updatedAnswer
        });

        return {
          ...prev,
          answers: {
            ...prev.answers,
            [questionId]: updatedAnswer
          }
        };
      });
    },

    getCategoryAnswers: (categoryId: string): Answer[] => {
      const answers = Object.values(state.answers).filter(answer => answer.categoryId === categoryId);
      console.log('📊 Category answers:', {
        categoryId,
        totalAnswers: answers.length,
        answers: answers.map(a => ({
          questionId: a.questionId,
          score: a.score,
          timestamp: a.timestamp
        }))
      });
      return answers;
    }
  }), [state.answers, state.currentCategory]);

  return {
    // State
    currentStep: state.currentStep,
    goal: state.goal,
    formData: state.formData,
    companyTypes: state.companyTypes,
    categories: filteredCategories, // Use filtered categories instead of all categories
    currentCategory: state.currentCategory,
    currentQuestion: state.currentQuestion,
    completedCategories: state.completedCategories,
    answers: state.answers,
    methodAnswers: state.methodAnswers,
    error: state.error,
    progress: state.progress,
    forms: state.forms,
    isLoading: state.isLoading,

    // Basic setters
    setGoal: (goal: string) => setState(prev => ({
      ...prev,
      goal,
      forms: { ...prev.forms, goal: { goal } }
    })),
    setFormData: (formData: FormData) => setState(prev => ({
      ...prev,
      formData,
      forms: { ...prev.forms, setup: formData }
    })),
    setCompanyTypes: (types: CompanyType[]) =>
      setState(prev => ({ ...prev, companyTypes: types })),
    setAssessmentData: (categories: Category[], answers: Answer[]) =>
      setState(prev => {
        // Get filtered categories based on current company type
        const filtered = categories.filter(category =>
          category.companyType.includes(prev.formData.companyType)
        );
        return {
          ...prev,
          categories,
          methodAnswers: answers,
          currentCategory: filtered[0] || null,
          currentQuestion: filtered[0]?.questions[0] || null
        };
      }),
    setError: (error: string | null) => setState(prev => ({ ...prev, error })),

    // Form Actions
    setGoalForm: (data: GoalFormData) => setState(prev => ({
      ...prev,
      goal: data.goal,
      forms: { ...prev.forms, goal: data }
    })),

    setSetupForm: (data: SetupFormData) => setState(prev => ({
      ...prev,
      formData: { ...data },
      forms: { ...prev.forms, setup: data }
    })),

    setEmailUpdateForm: (data: EmailUpdateFormData) => setState(prev => ({
      ...prev,
      formData: { ...prev.formData, email: data.email },
      forms: { ...prev.forms, emailUpdate: data }
    })),

    // Navigation
    setCurrentCategory: (category: Category) => {
      const firstUnansweredQuestion = category.questions.find(q => !state.answers[q.id]);
      setState(prev => ({
        ...prev,
        currentCategory: category,
        currentQuestion: firstUnansweredQuestion || category.questions[0] || null
      }));
    },
    moveToNextQuestion: () => {
      if (!state.currentCategory || !state.currentQuestion) return;
      const currentIndex = state.currentCategory.questions.findIndex(q => q.id === state.currentQuestion?.id);
      const nextQuestion = state.currentCategory.questions[currentIndex + 1];
      if (nextQuestion) setState(prev => ({ ...prev, currentQuestion: nextQuestion }));
    },
    moveToNextCategory: () => {
      if (!state.currentCategory) return;
      const currentIndex = state.categories.findIndex(c => c.id === state.currentCategory?.id);
      const nextCategory = state.categories[currentIndex + 1];

      // Find first unanswered question in next category without logging
      const firstUnansweredQuestion = nextCategory?.questions.find(q => !state.answers[q.id]);

      setState(prev => ({
        ...prev,
        currentCategory: nextCategory || null,
        currentQuestion: nextCategory
          ? firstUnansweredQuestion || nextCategory.questions[0]
          : null,
        completedCategories: !prev.completedCategories.includes(state.currentCategory!.id)
          ? [...prev.completedCategories, state.currentCategory!.id]
          : prev.completedCategories
      }));
    },

    // Assessment
    ...answerFunctions,

    // Reset
    reset: () => setState(defaultState),

    // Add loading setter
    setLoading: (isLoading: boolean) => setState(prev => ({ ...prev, isLoading })),
  };
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
  const { goal, setGoalForm } = useAssessment();
  const router = useRouter();
  const locale = useLocale();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal) return;

    setGoalForm({ goal });
    router.push(`/${locale}/setup`);
  };

  return {
    goal,
    handleSubmit,
    setGoalForm
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
  const { forms, setEmailUpdateForm } = useAssessment();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { emailUpdate } = forms;

    if (!emailUpdate.email) return;

    try {
      setIsSubmitting(true);
      setEmailUpdateForm(emailUpdate);
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
    setEmailUpdateForm
  };
}

export function AssessmentStateProvider({ children }: { children: React.ReactNode }) {
  return (
    <AssessmentProvider>
      {children}
    </AssessmentProvider>
  );
} 