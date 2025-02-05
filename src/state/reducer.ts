import type { AssessmentState, AssessmentAction } from './types';

export const defaultState: AssessmentState = {
  version: '1.0',
  navigation: {
    currentStep: 'home',
    isLoading: false,
    error: null
  },
  forms: {
    goal: { goal: '' },
    setup: { name: '', email: '', companyName: '', companyType: '' },
    emailUpdate: { email: '' }
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

    case 'SET_GOAL':
      return {
        ...state,
        forms: {
          ...state.forms,
          goal: { goal: action.payload }
        }
      };

    case 'SET_SETUP_FORM':
      return {
        ...state,
        forms: {
          ...state.forms,
          setup: action.payload
        }
      };

    case 'SET_EMAIL':
      return {
        ...state,
        forms: {
          ...state.forms,
          emailUpdate: { email: action.payload }
        }
      };

    case 'SET_ANSWER': {
      const { questionId, answerId, score } = action.payload;
      const currentCategory = state.assessment.currentCategory;
      
      if (!currentCategory) return state;

      const answer = {
        questionId,
        answerId,
        score,
        categoryId: currentCategory.id,
        companyType: state.forms.setup.companyType,
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
      const firstUnansweredQuestion = action.payload.questions.find(
        q => !state.assessment.answers[q.id]
      );

      return {
        ...state,
        assessment: {
          ...state.assessment,
          currentCategory: action.payload,
          currentQuestion: firstUnansweredQuestion || action.payload.questions[0] || null
        }
      };

    case 'NEXT_QUESTION': {
      if (!state.assessment.currentCategory || !state.assessment.currentQuestion) {
        return state;
      }

      const currentIndex = state.assessment.currentCategory.questions.findIndex(
        q => q.id === state.assessment.currentQuestion?.id
      );
      const nextQuestion = state.assessment.currentCategory.questions[currentIndex + 1];

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
      const firstUnansweredQuestion = nextCategory?.questions.find(
        q => !state.assessment.answers[q.id]
      );

      return {
        ...state,
        assessment: {
          ...state.assessment,
          currentCategory: nextCategory || null,
          currentQuestion: nextCategory
            ? firstUnansweredQuestion || nextCategory.questions[0]
            : null,
          completedCategories: state.assessment.currentCategory
            ? [...state.assessment.completedCategories, state.assessment.currentCategory.id]
            : state.assessment.completedCategories
        }
      };
    }

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