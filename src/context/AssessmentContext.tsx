'use client';

import React, {createContext, useContext, useState, ReactNode} from 'react';

type FormData = {
  name: string;
  company: string;
  email: string;
  companyType: string;
};

type AssessmentState = {
  goal: string;
  formData: FormData;
  answers: Record<string, string>;
};

type AssessmentContextType = {
  state: AssessmentState;
  setGoal: (goal: string) => void;
  setFormData: (data: FormData) => void;
  setAnswer: (questionId: string, answerId: string) => void;
  resetState: () => void;
};

const initialState: AssessmentState = {
  goal: '',
  formData: {
    name: '',
    company: '',
    email: '',
    companyType: ''
  },
  answers: {}
};

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function AssessmentProvider({children}: {children: ReactNode}) {
  const [state, setState] = useState<AssessmentState>(initialState);

  const setGoal = (goal: string) => {
    setState(prev => ({...prev, goal}));
  };

  const setFormData = (formData: FormData) => {
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