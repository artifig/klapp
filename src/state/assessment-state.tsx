'use client';

import { createContext, useContext, useReducer, useEffect, useMemo, useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import type { AssessmentState, Category, AssessmentAction, InitialFormData, UserDetailsFormData } from './types';
import { assessmentReducer, defaultState } from './reducer';
import { persistenceManager } from './persistence';

// Types

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

function useSyncedState() {
  const { state, dispatch } = useContext(AssessmentContext)!;
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  // Debounced save to localStorage
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isSyncing) {
        persistenceManager.save(state);
        setLastSynced(new Date());
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timeoutId);
  }, [state, isSyncing]);

  // Load state from localStorage
  const loadState = useCallback(() => {
    setIsSyncing(true);
    try {
      const savedState = persistenceManager.load();
      if (savedState) {
        dispatch({ type: 'LOAD_STATE', payload: savedState });
      }
    } finally {
      setIsSyncing(false);
    }
  }, [dispatch]);

  // Reset both in-memory and persisted state
  const resetState = useCallback(() => {
    setIsSyncing(true);
    try {
      persistenceManager.clear();
      dispatch({ type: 'RESET_STATE' });
    } finally {
      setIsSyncing(false);
    }
  }, [dispatch]);

  return {
    isSyncing,
    lastSynced,
    loadState,
    resetState
  };
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }

  const { state, dispatch } = context;
  const { isSyncing, lastSynced, loadState, resetState } = useSyncedState();

  const setInitialForm = useCallback((data: InitialFormData) => {
    dispatch({ type: 'SET_INITIAL_FORM', payload: data });
  }, [dispatch]);

  const setUserDetails = useCallback((data: UserDetailsFormData) => {
    dispatch({ type: 'SET_USER_DETAILS', payload: data });
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

  const resetForms = useCallback(() => {
    dispatch({ type: 'RESET_FORMS' });
  }, [dispatch]);

  const resetProgress = useCallback(() => {
    dispatch({ type: 'RESET_PROGRESS' });
  }, [dispatch]);

  return {
    ...state,
    isSyncing,
    lastSynced,
    loadState,
    resetState,
    setInitialForm,
    setUserDetails,
    setAnswer,
    setCurrentCategory,
    nextQuestion,
    nextCategory,
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

// Export the AssessmentStateProvider
export function AssessmentStateProvider({ children }: { children: React.ReactNode }) {
  return (
    <AssessmentProvider>
      {children}
    </AssessmentProvider>
  );
} 