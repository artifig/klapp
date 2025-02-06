import type { Answer, CompanyType, LocalizedText } from '@/lib/airtable/types';

// Navigation
export type AssessmentStep = 'home' | 'assessment' | 'results';

export interface NavigationState {
  currentStep: AssessmentStep;
  isLoading: boolean;
  error: string | null;
}

// Forms
export interface InitialFormData {
  goal: string;
  companyType: string;
  responseId?: string;
  recordId?: string;
}

export interface UserDetailsFormData {
  name: string;
  email: string;
  companyName: string;
}

export interface FormsState {
  initial: InitialFormData;
  userDetails: UserDetailsFormData;
}

// Assessment
export interface Category {
  id: string;
  text: LocalizedText;
  description?: LocalizedText;
  isActive: boolean;
  companyType: string[];
  questions: string[];
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
  currentQuestion: string | null;
  completedCategories: string[];
  answers: Record<string, UserAnswer>;
}

// Reference Data
export interface ReferenceDataState {
  companyTypes: CompanyType[];
  categories: Category[];
  methodAnswers: Answer[];
}

// Add validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface StateValidation {
  isValid: boolean;
  errors: ValidationError[];
}

// Combined State
export interface AssessmentState {
  navigation: NavigationState;
  forms: FormsState;
  assessment: AssessmentProgressState;
  reference: ReferenceDataState;
  version: string;
  validation?: StateValidation;
  lastValidated?: string;
}

// Action Types
export type AssessmentAction =
  | { type: 'SET_STEP'; payload: AssessmentStep }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INITIAL_FORM'; payload: InitialFormData }
  | { type: 'SET_USER_DETAILS'; payload: UserDetailsFormData }
  | { type: 'SET_ANSWER'; payload: { questionId: string; answerId: string; score: number } }
  | { type: 'SET_CATEGORY'; payload: Category }
  | { type: 'NEXT_QUESTION' }
  | { type: 'NEXT_CATEGORY' }
  | { type: 'RESET_STATE' }
  | { type: 'RESET_FORMS' }
  | { type: 'RESET_PROGRESS' }
  | { type: 'LOAD_STATE'; payload: AssessmentState }
  | { type: 'SET_REFERENCE'; payload: Partial<ReferenceDataState> }
  | { type: 'VALIDATE_STATE'; payload: StateValidation }
  | { type: 'RECOVER_STATE'; payload: Partial<AssessmentState> }; 