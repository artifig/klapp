import type { Answer, CompanyType } from '@/lib/airtable/types';

// Navigation
export type AssessmentStep = 'home' | 'setup' | 'assessment' | 'results';

export interface NavigationState {
  currentStep: AssessmentStep;
  isLoading: boolean;
  error: string | null;
}

// Forms
export interface GoalFormData {
  goal: string;
  responseId?: string;
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

export interface FormsState {
  goal: GoalFormData;
  setup: SetupFormData;
  emailUpdate: EmailUpdateFormData;
}

// Assessment
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

export interface UserAnswer {
  questionId: string;
  answerId: string;
  score: number;
  categoryId: string;
  companyType: string;
  timestamp: string;
}

export interface AssessmentProgressState {
  currentCategory: Category | null;
  currentQuestion: Question | null;
  completedCategories: string[];
  answers: Record<string, UserAnswer>;
}

// Reference Data
export interface ReferenceDataState {
  companyTypes: CompanyType[];
  categories: Category[];
  methodAnswers: Answer[];
}

// Combined State
export interface AssessmentState {
  navigation: NavigationState;
  forms: FormsState;
  assessment: AssessmentProgressState;
  reference: ReferenceDataState;
  version: string;
}

// Action Types
export type AssessmentAction =
  | { type: 'SET_STEP'; payload: AssessmentStep }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_GOAL'; payload: { goal: string; responseId: string } }
  | { type: 'SET_SETUP_FORM'; payload: SetupFormData }
  | { type: 'SET_EMAIL'; payload: string }
  | { type: 'SET_ANSWER'; payload: { questionId: string; answerId: string; score: number } }
  | { type: 'SET_CATEGORY'; payload: Category }
  | { type: 'NEXT_QUESTION' }
  | { type: 'NEXT_CATEGORY' }
  | { type: 'RESET_STATE' }
  | { type: 'RESET_FORMS' }
  | { type: 'RESET_PROGRESS' }
  | { type: 'LOAD_STATE'; payload: AssessmentState }; 