'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { AirtableMethodAnswer, AirtableMethodCompanyType } from '@/lib/airtable';
import ClientOnly from '@/components/ClientOnly';
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

export interface AssessmentState {
  currentStep: 'home' | 'setup' | 'assessment' | 'results';
  goal: string | null;
  formData: FormData;
  companyTypes: AirtableMethodCompanyType[];
  categories: Category[];
  currentCategory: Category | null;
  currentQuestion: Question | null;
  completedCategories: string[];
  answers: Record<string, number>;
  methodAnswers: AirtableMethodAnswer[];
  error: string | null;
  progress: number;
  forms: {
    goal: GoalFormData;
    setup: SetupFormData;
    emailUpdate: EmailUpdateFormData;
  };
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
  }
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

  return {
    // State
    ...state,

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
    setCompanyTypes: (types: AirtableMethodCompanyType[]) => 
      setState(prev => ({ ...prev, companyTypes: types })),
    setAssessmentData: (categories: Category[], answers: AirtableMethodAnswer[]) => 
      setState(prev => ({
        ...prev,
        categories,
        methodAnswers: answers,
        currentCategory: categories[0] || null,
        currentQuestion: categories[0]?.questions[0] || null
      })),
    setError: (error: string | null) => setState(prev => ({ ...prev, error })),

    // Form Actions
    setGoalForm: (data: GoalFormData) => setState(prev => ({ 
      ...prev, 
      goal: data.goal,
      forms: { ...prev.forms, goal: data }
    })),
    
    setSetupForm: (data: SetupFormData) => setState(prev => ({
      ...prev,
      formData: data,
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
      
      setState(prev => ({
        ...prev,
        currentCategory: nextCategory || null,
        currentQuestion: nextCategory 
          ? nextCategory.questions.find(q => !state.answers[q.id]) || nextCategory.questions[0]
          : null,
        completedCategories: !prev.completedCategories.includes(state.currentCategory!.id)
          ? [...prev.completedCategories, state.currentCategory!.id]
          : prev.completedCategories
      }));
    },

    // Assessment
    setAnswer: (questionId: string, value: number) => 
      setState(prev => ({ ...prev, answers: { ...prev.answers, [questionId]: value } })),
    getAnswerForQuestion: (questionId: string) => state.answers[questionId],

    // Reset
    reset: () => setState(defaultState)
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
  const { 
    categories,
    currentCategory,
    completedCategories,
    setCurrentCategory
  } = useAssessment();
  const t = useTranslations('assessment');

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
                onClick={() => setCurrentCategory(category)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </ClientOnly>
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