'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { routes } from '@/navigation';
import { getCategories, getQuestions, saveResult, AirtableMethodCategory, AirtableMethodQuestion, getMethodAnswers, AirtableMethodAnswer } from '@/lib/airtable';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui/Loading';

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
  answerId: string[];
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
  methodAnswers: AirtableMethodAnswer[];
  progress: number;
  isLoading: boolean;
  error: string | null;
}

interface CacheData {
  categories: AirtableMethodCategory[];
  questions: AirtableMethodQuestion[];
  answers: AirtableMethodAnswer[];
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
  methodAnswers: AirtableMethodAnswer[];
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
  methodAnswers: [],
  progress: 0,
  isLoading: true,
  error: null
};

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = usePersistentState<AssessmentState>('assessment_state', defaultState);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const locale = useLocale();
  const router = useRouter();

  // Reset state on initial load
  useEffect(() => {
    if (isInitialLoad) {
      setState(defaultState);
      setIsInitialLoad(false);
    }
  }, [isInitialLoad, setState]);

  // Calculate progress whenever answers change
  useEffect(() => {
    const totalQuestions = state.categories.reduce(
      (acc, category) => acc + category.questions.length,
      0
    );

    // Get only valid answers that correspond to current questions
    const validAnswers = Object.entries(state.answers).filter(([questionId]) => 
      state.categories.some(cat => 
        cat.questions.some(q => q.id === questionId)
      )
    );
    const answeredQuestions = validAnswers.length;
    const newProgress = Math.min(totalQuestions > 0 ? answeredQuestions / totalQuestions : 0, 1);

    console.log('Progress Debug:', {
      totalQuestions,
      answeredQuestions,
      validAnswerCount: validAnswers.length,
      totalAnswerCount: Object.keys(state.answers).length,
      newProgress,
      categoriesLength: state.categories.length,
      isInitialLoad,
      formData: {
        name: !!state.formData.name,
        email: !!state.formData.email,
        companyName: !!state.formData.companyName,
        companyType: !!state.formData.companyType
      }
    });

    if (newProgress !== state.progress) {
      setState(prev => ({ ...prev, progress: newProgress }));
    }

    const allQuestionsAnswered = validAnswers.length >= totalQuestions;
    const shouldNavigate = allQuestionsAnswered && 
        state.categories.length > 0 && 
        !isInitialLoad &&
        state.formData.name && 
        state.formData.email && 
        state.formData.companyName && 
        state.formData.companyType;

    console.log('Navigation Check:', {
      allQuestionsAnswered,
      validAnswersCount: validAnswers.length,
      totalQuestions,
      hasCategories: state.categories.length > 0,
      notInitialLoad: !isInitialLoad,
      hasFormData: {
        name: !!state.formData.name,
        email: !!state.formData.email,
        companyName: !!state.formData.companyName,
        companyType: !!state.formData.companyType
      },
      shouldNavigate
    });
    
    // Only proceed with save if not already saving
    if (shouldNavigate && !isSaving) {
      console.log('Attempting to save and navigate to results...');
      setIsSaving(true);
      
      // Clean up answers before saving - only include valid answers
      const cleanAnswers = Object.fromEntries(validAnswers);
      
      // Save results before navigating
      saveResult({
        name: state.formData.name,
        email: state.formData.email,
        companyName: state.formData.companyName,
        companyType: state.formData.companyType,
        goal: state.goal || '',
        answers: cleanAnswers,
        categories: state.categories.map(cat => ({
          id: cat.id,
          key: cat.key,
          name: cat.name,
          questions: cat.questions.map(q => ({
            id: q.id,
            text: q.text
          }))
        }))
      }).then(() => {
        console.log('Save successful, navigating to results...');
        router.push(routes.results);
      }).catch(error => {
        console.error('Error saving assessment results:', error);
        setIsSaving(false); // Reset saving state on error
      });
    }
  }, [state.answers, state.categories, state.progress, state.formData, isInitialLoad, setState, router, state.goal, isSaving]);

  // Fetch categories and questions from Airtable with caching
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Starting data fetch, company type:', state.formData.companyType);
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Force fresh data fetch by clearing cache
        localStorage.removeItem('assessment_data');
        console.log('Cache cleared, fetching fresh data...');

        // Fetch fresh data
        console.log('Fetching fresh data from Airtable');
        const [categoriesData, questionsData, answersData] = await Promise.all([
          getCategories(),
          getQuestions(),
          getMethodAnswers()
        ]);

        console.log('Raw Airtable response:', {
          categories: categoriesData,
          questions: questionsData,
          answers: answersData
        });

        console.log('Fetched data counts:', {
          categoriesCount: categoriesData?.length || 0,
          questionsCount: questionsData?.length || 0,
          answersCount: answersData?.length || 0
        });

        // Log answers data structure if available
        if (answersData && answersData.length > 0) {
          console.log('First answer example:', {
            id: answersData[0].id,
            answerId: answersData[0].answerId,
            answerText: answersData[0].answerText_en,
            score: answersData[0].answerScore,
            questionIds: answersData[0].questionId
          });
        } else {
          console.error('No answers data available from Airtable');
        }

        // Cache the fresh data only if we have all the data
        localStorage.setItem('assessment_data', JSON.stringify({
          categories: categoriesData,
          questions: questionsData,
          answers: answersData,
          timestamp: Date.now()
        }));

        processData(categoriesData, questionsData, answersData);
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

    const processData = (
      categoriesData: AirtableMethodCategory[], 
      questionsData: AirtableMethodQuestion[],
      answersData: AirtableMethodAnswer[]
    ) => {
      // Use company type directly from form data without mapping
      const companyType = state.formData.companyType;

      // Normalize company type to match Airtable format
      const companyTypeMap: Record<string, string> = {
        'startup': 'Startup',
        'scale-up': 'Scaleup',
        'scaleup': 'Scaleup',
        'sme': 'SME',
        'enterprise': 'Enterprise'
      };
      const normalizedCompanyType = companyTypeMap[companyType.toLowerCase().trim()] || companyType;

      console.log('Processing data:', {
        rawCompanyType: companyType,
        normalizedCompanyType,
        totalCategories: categoriesData.length,
        totalQuestions: questionsData.length,
        totalAnswers: answersData?.length || 0
      });

      // Transform categories and questions based on locale and company type
      const categories: Category[] = categoriesData
        .filter(cat => {
          if (!normalizedCompanyType) return false; // Don't show any categories if no company type selected
          const includes = cat.companyType.some(type => 
            type.trim().toUpperCase() === normalizedCompanyType.trim().toUpperCase()
          );
          console.log(`Category ${cat.categoryId} (${cat.categoryText_en}) company types:`, cat.companyType, 'includes type:', includes);
          return includes;
        })
        .map(cat => {
          const questions = questionsData
            .filter(q => q.categoryId.includes(cat.id))
            .map(q => ({
              id: q.id,
              text: locale === 'et' ? q.questionText_et : q.questionText_en,
              categoryId: q.categoryId,
              order: parseInt(q.id, 10),
              answerId: q.answerId || []
            }))
            .sort((a, b) => a.order - b.order);

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

      console.log('Filtered categories for company type:', {
        companyType: normalizedCompanyType,
        totalFilteredCategories: categories.length,
        categoryNames: categories.map(c => c.name)
      });

      // Reset answers when company type changes to avoid keeping answers from other company types
      const currentAnswers = { ...state.answers };
      const validQuestionIds = new Set(categories.flatMap(cat => cat.questions.map(q => q.id)));
      const cleanedAnswers: Record<string, number> = {};
      Object.entries(currentAnswers).forEach(([qId, value]) => {
        if (validQuestionIds.has(qId)) {
          cleanedAnswers[qId] = value;
        }
      });

      setState(prev => {
        const newState = {
          ...prev,
          categories,
          answers: cleanedAnswers, // Use cleaned answers
          methodAnswers: answersData || [],
          isLoading: false,
          ...((!prev.currentCategory && categories.length > 0) && {
            currentCategory: categories[0],
            currentQuestion: categories[0].questions[0] || null
          })
        };

        console.log('Setting new state:', {
          categoryCount: newState.categories.length,
          currentCategory: newState.currentCategory?.name,
          currentQuestion: newState.currentQuestion?.text,
          methodAnswersCount: newState.methodAnswers?.length || 0,
          answerCount: Object.keys(newState.answers).length
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
    console.log('Selected company type:', formData.companyType);
    setState(prev => ({ ...prev, formData }));
  }, [setState]);

  const setCurrentCategory = useCallback((category: Category) => {
    console.log('Selected category:', {
      name: category.name,
      id: category.id,
      questionCount: category.questions.length
    });
    setState(prev => ({
      ...prev,
      currentCategory: category,
      currentQuestion: category.questions[0] || null
    }));
  }, [setState]);

  const setAnswer = useCallback((questionId: string, value: number) => {
    setState(prev => {
      const currentCategory = prev.currentCategory;
      const currentQuestion = prev.currentQuestion;
      
      if (!currentCategory || !currentQuestion) return prev;

      console.log('Selected answer:', {
        category: currentCategory.name,
        question: currentQuestion.text,
        answerScore: value
      });

      // Update answers
      const newAnswers = { ...prev.answers, [questionId]: value };
      
      // Check if this was the last question in the category
      const currentQuestionIndex = currentCategory.questions.findIndex(q => q.id === questionId);
      const isLastQuestion = currentQuestionIndex === currentCategory.questions.length - 1;
      
      // Check if all questions in current category are now answered
      const allCategoryQuestionsAnswered = currentCategory.questions.every(q => 
        q.id === questionId ? true : !!newAnswers[q.id]
      );

      console.log('Answer state check:', {
        currentQuestionIndex,
        isLastQuestion,
        allCategoryQuestionsAnswered,
        totalQuestions: currentCategory.questions.length,
        answeredQuestions: Object.keys(newAnswers).length
      });

      // Just update the answer, navigation will be handled by moveToNextQuestion
      return { ...prev, answers: newAnswers };
    });
  }, [setState]);

  const getAnswerForQuestion = useCallback((questionId: string) => {
    return state.answers[questionId];
  }, [state.answers]);

  const moveToNextQuestion = useCallback(() => {
    if (!state.currentCategory || !state.currentQuestion) return;

    const currentCategory = state.currentCategory;
    const currentQuestionIndex = currentCategory.questions.findIndex(
      q => q.id === state.currentQuestion?.id
    );
    
    if (currentQuestionIndex === -1) return;

    setState(prev => {
      const nextQuestion = currentCategory.questions[currentQuestionIndex + 1];
      
      // Check if all questions in current category are answered
      const categoryAnswers = currentCategory.questions.map(q => ({
        questionId: q.id,
        hasAnswer: !!prev.answers[q.id],
        answer: prev.answers[q.id]
      }));

      const allCategoryQuestionsAnswered = categoryAnswers.every(q => q.hasAnswer);
      const isLastQuestion = !nextQuestion;

      console.log('Navigation state:', {
        currentCategory: currentCategory.name,
        currentQuestionIndex,
        isLastQuestion,
        allCategoryQuestionsAnswered,
        categoryAnswers
      });

      // If there's a next question and not all questions are answered, move to it
      if (nextQuestion && !allCategoryQuestionsAnswered) {
        return { ...prev, currentQuestion: nextQuestion };
      }

      // If all questions are answered or this is the last question, try to move to next category
      if (allCategoryQuestionsAnswered || isLastQuestion) {
        const currentCategoryIndex = prev.categories.findIndex(c => c.id === currentCategory.id);
        const nextCategory = prev.categories[currentCategoryIndex + 1];

        // Only add to completed categories if not already there
        const newCompletedCategories = prev.completedCategories.includes(currentCategory.id)
          ? prev.completedCategories
          : [...prev.completedCategories, currentCategory.id];

        if (nextCategory) {
          return {
            ...prev,
            completedCategories: newCompletedCategories,
            currentCategory: nextCategory,
            currentQuestion: nextCategory.questions[0]
          };
        } else {
          return {
            ...prev,
            completedCategories: newCompletedCategories,
            currentCategory: null,
            currentQuestion: null
          };
        }
      }

      return prev;
    });
  }, [state.currentCategory, state.currentQuestion]);

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