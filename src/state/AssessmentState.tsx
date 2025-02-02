'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { AirtableMethodAnswer, AirtableMethodCompanyType } from '@/lib/airtable';

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
  progress: 0
};

export function useAssessmentState() {
  const locale = useLocale();
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
    setGoal: (goal: string) => setState(prev => ({ ...prev, goal })),
    setFormData: (formData: FormData) => setState(prev => ({ ...prev, formData })),
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