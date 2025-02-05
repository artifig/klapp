import type { AssessmentState, AssessmentAction, UserAnswer } from './types';

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

    case 'SET_GOAL':
      return {
        ...state,
        forms: {
          ...state.forms,
          goal: action.payload
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
        companyType: state.forms.setup.companyType,
        timestamp: new Date().toISOString()
      };

      console.log('Saving answer to state:', answer);
      console.log('Previous answers:', state.assessment.answers);

      const newState = {
        ...state,
        assessment: {
          ...state.assessment,
          answers: {
            ...state.assessment.answers,
            [questionId]: answer
          }
        }
      };

      console.log('New state answers:', newState.assessment.answers);
      return newState;
    }

    case 'SET_CATEGORY': {
      const category = action.payload;
      const firstUnansweredQuestion = category.questions.find(
        questionId => !state.assessment.answers[questionId]
      );

      return {
        ...state,
        assessment: {
          ...state.assessment,
          currentCategory: category,
          currentQuestion: firstUnansweredQuestion || category.questions[0] || null
        }
      };
    }

    case 'NEXT_QUESTION': {
      if (!state.assessment.currentCategory) {
        return state;
      }

      const currentQuestionId = state.assessment.currentQuestion;
      if (!currentQuestionId) {
        return state;
      }

      const currentCategory = state.assessment.currentCategory;
      const currentIndex = currentCategory.questions.indexOf(currentQuestionId);
      const nextQuestionId = currentCategory.questions[currentIndex + 1];

      return {
        ...state,
        assessment: {
          ...state.assessment,
          currentQuestion: nextQuestionId || null
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
        questionId => !state.assessment.answers[questionId]
      );

      return {
        ...state,
        assessment: {
          ...state.assessment,
          currentCategory: nextCategory || null,
          currentQuestion: nextCategory
            ? firstUnansweredQuestion || nextCategory.questions[0] || null
            : null,
          completedCategories: state.assessment.currentCategory
            ? [...state.assessment.completedCategories, state.assessment.currentCategory.id]
            : state.assessment.completedCategories
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