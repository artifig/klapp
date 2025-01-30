'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { routes } from '@/navigation';

export interface AssessmentState {
  formData: {
    name: string;
    email: string;
    company: string;
    companyType: string;
  };
  goal: string;
  answers: Record<string, string>;
  results: Record<string, number>;
  recommendations: Record<string, {
    title: string;
    text: string;
    score: number;
    provider: string;
    offer: string;
  }>;
}

const defaultState: AssessmentState = {
  formData: {
    name: '',
    email: '',
    company: '',
    companyType: ''
  },
  goal: '',
  answers: {},
  results: {},
  recommendations: {}
};

interface AssessmentContextType {
  state: AssessmentState;
  setGoal: (goal: string) => void;
  setFormData: (data: AssessmentState['formData']) => void;
  setAnswer: (questionId: string, answerId: string) => void;
  resetState: () => void;
  isStepAccessible: (path: string) => boolean;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = usePersistentState<AssessmentState>('assessment_state', defaultState);

  const setGoal = useCallback((goal: string) => {
    setState(prev => ({ ...prev, goal }));
  }, [setState]);

  const setFormData = useCallback((formData: AssessmentState['formData']) => {
    setState(prev => ({ ...prev, formData }));
  }, [setState]);

  const setAnswer = useCallback((questionId: string, answerId: string) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answerId }
    }));
  }, [setState]);

  const resetState = useCallback(() => {
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
          Boolean(state.formData.company) &&
          Boolean(state.formData.companyType);
      case routes.results:
        return Boolean(state.goal?.trim()) &&
          Boolean(state.formData.name) &&
          Object.keys(state.answers).length > 0;
      default:
        return false;
    }
  }, [state]);

  return (
    <AssessmentContext.Provider value={{
      state,
      setGoal,
      setFormData,
      setAnswer,
      resetState,
      isStepAccessible
    }}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within AssessmentProvider');
  }
  return context;
} 