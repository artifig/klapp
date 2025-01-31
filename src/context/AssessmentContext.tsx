'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { routes } from '@/navigation';
import { getCategories, getQuestions, saveResult, AirtableCategory, AirtableQuestion } from '@/lib/airtable';
import { useLocale } from 'next-intl';
import { Loading } from '@/components/ui/Loading';

interface Category extends Omit<AirtableCategory, 'name_en' | 'name_et'> {
  name: string;
  questions: Question[];
}

interface Question extends Omit<AirtableQuestion, 'text_en' | 'text_et'> {
  text: string;
}

interface FormData {
  name: string;
  email: string;
  companyName: string;
  companyType: string;
}

interface Provider {
  id: string;
  name: string;
  description: string;
  matchScore: number;
  contactEmail: string;
}

interface AssessmentState {
  formData: FormData;
  goal: string | null;
  currentCategory: Category | null;
  currentQuestion: Question | null;
  categories: Category[];
  completedCategories: string[];
  answers: Record<string, number>;
  matchedProviders: Provider[];
  progress: number;
  isLoading: boolean;
  error: string | null;
}

interface AssessmentContextType {
  goal: string | null;
  formData: FormData | null;
  currentCategory: Category | null;
  currentQuestion: Question | null;
  categories: Category[];
  completedCategories: string[];
  answers: Record<string, number>;
  matchedProviders: Provider[];
  progress: number;
  setGoal: (goal: string) => void;
  setFormData: (data: FormData) => void;
  setCurrentCategory: (category: Category) => void;
  setAnswer: (questionId: string, value: number) => void;
  getAnswerForQuestion: (questionId: string) => number | undefined;
  moveToNextQuestion: () => void;
  resetAssessment: () => void;
  isStepAccessible: (path: string) => boolean;
}

const defaultState: AssessmentState = {
  formData: {
    name: '',
    email: '',
    companyName: '',
    companyType: ''
  },
  goal: null,
  currentCategory: null,
  currentQuestion: null,
  categories: [],
  completedCategories: [],
  answers: {},
  matchedProviders: [],
  progress: 0,
  isLoading: true,
  error: null
};

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = usePersistentState<AssessmentState>('assessment_state', defaultState);
  const locale = useLocale();

  // Fetch categories and questions from Airtable
  useEffect(() => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        const [categoriesData, questionsData] = await Promise.all([
          getCategories(),
          getQuestions()
        ]);

        // Transform categories and questions based on locale
        const categories: Category[] = categoriesData.map(cat => ({
          id: cat.id,
          key: cat.key,
          name: locale === 'et' ? cat.name_et : cat.name_en,
          order: cat.order,
          questions: questionsData
            .filter(q => q.categoryId === cat.id)
            .map(q => ({
              id: q.id,
              text: locale === 'et' ? q.text_et : q.text_en,
              categoryId: q.categoryId,
              order: q.order
            }))
            .sort((a, b) => a.order - b.order)
        }));

        setState(prev => ({
          ...prev,
          categories: categories.sort((a, b) => a.order - b.order),
          isLoading: false
        }));
      } catch (error) {
        console.error('Error fetching assessment data:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load assessment data'
        }));
      }
    };

    fetchData();
  }, [setState, locale]);

  const setGoal = useCallback((goal: string) => {
    setState(prev => ({ ...prev, goal }));
  }, [setState]);

  const setFormData = useCallback((formData: FormData) => {
    setState(prev => ({ ...prev, formData }));
  }, [setState]);

  const setCurrentCategory = useCallback((category: Category) => {
    setState(prev => ({
      ...prev,
      currentCategory: category,
      currentQuestion: category.questions[0] || null
    }));
  }, [setState]);

  const setAnswer = useCallback((questionId: string, value: number) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: value }
    }));
  }, [setState]);

  const getAnswerForQuestion = useCallback((questionId: string) => {
    return state.answers[questionId];
  }, [state.answers]);

  const moveToNextQuestion = useCallback(() => {
    if (!state.currentCategory || !state.currentQuestion) return;

    const currentQuestionIndex = state.currentCategory.questions.findIndex(
      q => q.id === state.currentQuestion?.id
    );
    
    if (currentQuestionIndex === -1) return;

    const nextQuestion = state.currentCategory.questions[currentQuestionIndex + 1];

    if (nextQuestion) {
      setState(prev => ({ ...prev, currentQuestion: nextQuestion }));
    } else {
      const currentCategoryId = state.currentCategory.id;
      setState(prev => ({
        ...prev,
        completedCategories: [...prev.completedCategories, currentCategoryId],
        currentQuestion: null,
        currentCategory: null
      }));
    }
  }, [state.currentCategory, state.currentQuestion, setState]);

  const resetAssessment = useCallback(() => {
    setState(defaultState);
  }, [setState]);

  const isStepAccessible = useCallback((path: string) => {
    switch (path) {
      case routes.home:
        return true;
      case routes.setup:
        return Boolean(state.goal?.trim());
      case routes.assessment:
        return Boolean(state.goal?.trim()) &&
          Boolean(state.formData.name) &&
          Boolean(state.formData.email) &&
          Boolean(state.formData.companyName) &&
          Boolean(state.formData.companyType);
      case routes.results:
        return Boolean(state.goal?.trim()) &&
          Boolean(state.formData.name) &&
          Object.keys(state.answers).length > 0;
      default:
        return false;
    }
  }, [state]);

  const value: AssessmentContextType = {
    ...state,
    setGoal,
    setFormData,
    setCurrentCategory,
    setAnswer,
    getAnswerForQuestion,
    moveToNextQuestion,
    resetAssessment,
    isStepAccessible
  };

  if (state.isLoading) {
    return <Loading type="full" />;
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <h2 className="text-xl font-semibold mb-2">Error Loading Assessment</h2>
          <p>{state.error}</p>
        </div>
      </div>
    );
  }

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessmentContext() {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessmentContext must be used within AssessmentProvider');
  }
  return context;
} 