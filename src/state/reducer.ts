import type { AssessmentState, AssessmentAction, UserAnswer } from './types';

export const defaultState: AssessmentState = {
  version: '1.0',
  navigation: {
    currentStep: 'home',
    isLoading: false,
    error: null
  },
  forms: {
    initial: {
      goal: '',
      companyType: '',
    },
    userDetails: {
      name: '',
      email: '',
      companyName: ''
    }
  },
  assessment: {
    currentCategory: null,
    currentQuestion: null,
    completedCategories: [],
    answers: {}
  },
  reference: {
    companyTypes: [],
    categories: [],
    methodAnswers: []
  }
};

export function assessmentReducer(state: AssessmentState, action: AssessmentAction): AssessmentState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;

    case 'SET_STEP':
      return {
        ...state,
        navigation: {
          ...state.navigation,
          currentStep: action.payload
        }
      };

    case 'SET_LOADING':
      return {
        ...state,
        navigation: {
          ...state.navigation,
          isLoading: action.payload
        }
      };

    case 'SET_ERROR':
      return {
        ...state,
        navigation: {
          ...state.navigation,
          error: action.payload
        }
      };

    case 'SET_INITIAL_FORM':
      return {
        ...state,
        forms: {
          ...state.forms,
          initial: action.payload
        }
      };

    case 'SET_USER_DETAILS':
      return {
        ...state,
        forms: {
          ...state.forms,
          userDetails: action.payload
        }
      };

    case 'SET_ANSWER': {
      const { questionId, answerId, score } = action.payload;
      
      // Find the category that contains this question
      const category = state.reference.categories.find(cat => 
        Array.isArray(cat.questions) && cat.questions.includes(questionId)
      );

      if (!category) {
        console.warn('No category found for question:', questionId);
        return state;
      }

      const answer: UserAnswer = {
        questionId,
        answerId,
        score,
        categoryId: category.id,
        companyType: state.forms.initial.companyType,
        timestamp: new Date().toISOString()
      };

      return {
        ...state,
        assessment: {
          ...state.assessment,
          answers: {
            ...state.assessment.answers,
            [questionId]: answer
          }
        }
      };
    }

    case 'SET_CATEGORY':
      return {
        ...state,
        assessment: {
          ...state.assessment,
          currentCategory: action.payload,
          currentQuestion: action.payload.questions[0] || null
        }
      };

    case 'NEXT_QUESTION': {
      if (!state.assessment.currentCategory || !state.assessment.currentQuestion) {
        return state;
      }

      const currentQuestions = state.assessment.currentCategory.questions;
      const currentIndex = currentQuestions.indexOf(state.assessment.currentQuestion);
      const nextQuestion = currentQuestions[currentIndex + 1];

      return {
        ...state,
        assessment: {
          ...state.assessment,
          currentQuestion: nextQuestion || null
        }
      };
    }

    case 'NEXT_CATEGORY': {
      if (!state.assessment.currentCategory) {
        return state;
      }

      const currentIndex = state.reference.categories.findIndex(
        c => c.id === state.assessment.currentCategory?.id
      );
      const nextCategory = state.reference.categories[currentIndex + 1];

      return {
        ...state,
        assessment: {
          ...state.assessment,
          currentCategory: nextCategory || null,
          currentQuestion: nextCategory?.questions[0] || null,
          completedCategories: [
            ...state.assessment.completedCategories,
            state.assessment.currentCategory.id
          ]
        }
      };
    }

    case 'SET_REFERENCE':
      return {
        ...state,
        reference: {
          ...state.reference,
          ...action.payload
        }
      };

    case 'VALIDATE_STATE':
      return {
        ...state,
        validation: action.payload,
        lastValidated: new Date().toISOString()
      };

    case 'RESET_STATE':
      return defaultState;

    case 'RESET_FORMS':
      return {
        ...state,
        forms: defaultState.forms
      };

    case 'RESET_PROGRESS':
      return {
        ...state,
        assessment: defaultState.assessment
      };

    default:
      return state;
  }
} 