'use client';

import React, {createContext, useContext, ReactNode} from 'react';
import { usePersistedState } from '@/hooks/usePersistedState';

export interface AssessmentState {
  formData: {
    name?: string;
    email?: string;
    company?: string;
    companyType?: string;
  };
  goal?: string;
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

type AssessmentContextType = {
  state: AssessmentState;
  setGoal: (goal: string) => void;
  setFormData: (data: {name: string; company: string; email: string; companyType: string}) => void;
  setAnswer: (questionId: string, answerId: string) => void;
  resetState: () => void;
};

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function AssessmentProvider({children}: {children: ReactNode}) {
  const [state, setState] = usePersistedState<AssessmentState>('assessment_state', {
    goal: '',
    formData: {
      name: '',
      company: '',
      email: '',
      companyType: ''
    },
    answers: {},
    results: {},
    recommendations: {}
  });

  const setGoal = (goal: string) => {
    setState(prev => ({...prev, goal}));
  };

  const setFormData = (formData: {name: string; company: string; email: string; companyType: string}) => {
    setState(prev => ({...prev, formData}));
  };

  const setAnswer = (questionId: string, answerId: string) => {
    setState(prev => ({
      ...prev,
      answers: {...prev.answers, [questionId]: answerId}
    }));
  };

  const resetState = () => {
    setState(initialState);
  };

  return (
    <AssessmentContext.Provider 
      value={{
        state,
        setGoal,
        setFormData,
        setAnswer,
        resetState
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
} 