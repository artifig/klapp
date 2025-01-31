'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { routes } from '@/navigation';
import { getCategories, getQuestions, saveResult, AirtableMethodCategory, AirtableMethodQuestion } from '@/lib/airtable';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui/Loading';

// Map company types to their assessment categories
const COMPANY_TYPE_MAPPING = {
  startup: 'STARTUP',
  scaleup: 'SME', // Map scaleup to SME
  sme: 'SME',
  enterprise: 'ENTERPRISE'
} as const;

interface Category {
  id: string;
  key: string;
  name: string;
  order: number;
  questions: Question[];
  companyType: string[]; // Match Airtable schema
}

interface Question {
  id: string;
  text: string;
  categoryId: string[];
  order: number;
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

interface CacheData {
  categories: AirtableMethodCategory[];
  questions: AirtableMethodQuestion[];
  timestamp: number;
}

const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const locale = useLocale();
  const router = useRouter();

  // Calculate progress whenever answers change
  useEffect(() => {
    const totalQuestions = state.categories.reduce(
      (acc, category) => acc + category.questions.length,
      0
    );
    const answeredQuestions = Object.keys(state.answers).length;
    const newProgress = totalQuestions > 0 ? answeredQuestions / totalQuestions : 0;

    if (newProgress !== state.progress) {
      setState(prev => ({ ...prev, progress: newProgress }));
    }

    // Auto-navigate to results when all questions are answered
    if (newProgress === 1 && state.categories.length > 0) {
      router.push(routes.results);
    }
  }, [state.answers, state.categories, state.progress, setState, router]);

  // Fetch categories and questions from Airtable with caching
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Starting data fetch, company type:', state.formData.companyType);
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Check cache first
        const cachedData = localStorage.getItem('assessment_data');
        if (cachedData) {
          console.log('Found cached data');
          const { categories, questions, timestamp }: CacheData = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_DURATION) {
            processData(categories, questions);
            setIsInitialLoad(false);
            return;
          }
          console.log('Cache expired, fetching fresh data');
        }

        // Fetch fresh data if cache is invalid or missing
        console.log('Fetching fresh data from Airtable');
        const [categoriesData, questionsData] = await Promise.all([
          getCategories(),
          getQuestions()
        ]);

        console.log('Fetched data:', {
          categoriesCount: categoriesData.length,
          questionsCount: questionsData.length
        });

        // Cache the fresh data
        localStorage.setItem('assessment_data', JSON.stringify({
          categories: categoriesData,
          questions: questionsData,
          timestamp: Date.now()
        }));

        processData(categoriesData, questionsData);
        setIsInitialLoad(false);
      } catch (error) {
        console.error('Error fetching assessment data:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load assessment data'
        }));
      }
    };

    const processData = (categoriesData: AirtableMethodCategory[], questionsData: AirtableMethodQuestion[]) => {
      // Get the mapped company type for filtering
      const mappedCompanyType = state.formData.companyType 
        ? COMPANY_TYPE_MAPPING[state.formData.companyType as keyof typeof COMPANY_TYPE_MAPPING]
        : null;

      console.log('Processing data:', {
        originalCompanyType: state.formData.companyType,
        mappedCompanyType,
        totalCategories: categoriesData.length,
        totalQuestions: questionsData.length
      });

      // Transform categories and questions based on locale and company type
      const categories: Category[] = categoriesData
        .filter(cat => {
          if (!mappedCompanyType) return true;
          const includes = cat.companyType.some(type => 
            type.toUpperCase() === mappedCompanyType.toUpperCase()
          );
          console.log(`Category ${cat.categoryId} company types:`, cat.companyType, 'includes mapped type:', includes);
          return includes;
        })
        .map(cat => {
          const questions = questionsData
            .filter(q => q.categoryId.includes(cat.id))
            .map(q => ({
              id: q.id,
              text: locale === 'et' ? q.questionText_et : q.questionText_en,
              categoryId: q.categoryId,
              order: parseInt(q.id, 10)
            }))
            .sort((a, b) => a.order - b.order);

          console.log(`Category ${cat.categoryId} has ${questions.length} questions`);

          return {
            id: cat.id,
            key: cat.categoryId,
            name: locale === 'et' ? cat.categoryText_et : cat.categoryText_en,
            order: parseInt(cat.id, 10),
            companyType: cat.companyType,
            questions
          };
        })
        .sort((a, b) => a.order - b.order);

      console.log('Processed categories:', {
        totalCategories: categories.length,
        categoriesWithQuestions: categories.map(c => ({
          id: c.id,
          name: c.name,
          questionCount: c.questions.length
        }))
      });

      setState(prev => {
        const newState = {
          ...prev,
          categories,
          isLoading: false,
          ...((!prev.currentCategory && categories.length > 0) && {
            currentCategory: categories[0],
            currentQuestion: categories[0].questions[0] || null
          })
        };

        console.log('Setting new state:', {
          categoryCount: newState.categories.length,
          currentCategory: newState.currentCategory?.name,
          currentQuestion: newState.currentQuestion?.text
        });

        return newState;
      });
    };

    fetchData();
  }, [setState, locale, state.formData.companyType]);

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
    setState(prev => {
      const newAnswers = { ...prev.answers, [questionId]: value };
      
      // Find next category if current category is completed
      const currentCategory = prev.currentCategory;
      if (currentCategory) {
        const allCategoryQuestionsAnswered = currentCategory.questions.every(
          q => newAnswers[q.id]
        );
        
        if (allCategoryQuestionsAnswered) {
          const currentIndex = prev.categories.findIndex(c => c.id === currentCategory.id);
          const nextCategory = prev.categories[currentIndex + 1];
          
          return {
            ...prev,
            answers: newAnswers,
            completedCategories: [...prev.completedCategories, currentCategory.id],
            currentCategory: nextCategory || null,
            currentQuestion: nextCategory ? nextCategory.questions[0] : null
          };
        }
      }
      
      return { ...prev, answers: newAnswers };
    });
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

  // Show loading state only on initial load
  if (isInitialLoad && state.isLoading) {
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