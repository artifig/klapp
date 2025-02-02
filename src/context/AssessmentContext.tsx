'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { routes } from '@/navigation';
import { saveResult, getDataForCompanyType, AirtableMethodCategory, AirtableMethodQuestion, AirtableMethodAnswer } from '@/lib/airtable';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Loading } from '@/components/ui/Loading';

interface Category {
  id: string;
  key: string;
  name: string;
  order: number;
  questions: Question[];
  companyType: string[]; // Match Airtable schema
  description?: string;
}

interface Question {
  id: string;
  airtableId: string;
  text: string;
  categoryId: string[];
  answerId: string[];
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
  methodAnswers: AirtableMethodAnswer[];
  progress: number;
  isLoading: boolean;
  error: string | null;
}

// Export types
export type { Category, Question, FormData, Provider, AssessmentState };

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
  setState: (updater: (prev: AssessmentState) => AssessmentState) => void;
  moveToNextCategory: () => void;
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
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = usePersistentState<AssessmentState>('assessment-state', defaultState);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);

  // Clear state when returning to home page
  useEffect(() => {
    const isHomePage = pathname === `/${locale}` || pathname === `/${locale}/`;
    if (isHomePage) {
      console.log('🏠 Returning to home page - clearing assessment state');
      resetAssessment();
    }
  }, [pathname, locale]);

  // Modified data fetching effect to only run when needed
  useEffect(() => {
    const fetchData = async () => {
      // Check if we're on the assessment page
      const isAssessmentPage = window.location.pathname.includes('/assessment');
      
      console.log('🔍 Checking data fetch conditions:', {
        companyType: state.formData.companyType,
        isAssessmentPage,
        currentCategories: state.categories.length,
        pathname: window.location.pathname
      });

      // Only fetch if we have a company type and we're on the assessment page
      if (!state.formData.companyType || !isAssessmentPage) {
        return;
      }

      try {
        setIsLoading(true);
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        console.log('📥 Fetching data for company type:', state.formData.companyType);
        const data = await getDataForCompanyType(state.formData.companyType);

        // Transform categories and questions into the format we need
        const transformedCategories = data.categories
          .map((category, index) => {
            const categoryQuestions = data.questions
              .filter(q => category.questionId.includes(q.id))
              .map(question => ({
                id: question.questionId,
                airtableId: question.id,
                text: locale === 'et' ? question.questionText_et : question.questionText_en,
                categoryId: [category.categoryId],
                answerId: question.answerId || [], // Ensure we have an array even if empty
                order: parseInt(question.questionId.replace('Q', ''), 10) || 0
              }))
              .sort((a, b) => a.order - b.order);

            return {
              id: category.categoryId,
              key: category.categoryId,
              name: locale === 'et' ? category.categoryText_et : category.categoryText_en,
              description: locale === 'et' ? category.categoryDescription_et : category.categoryDescription_en,
              order: parseInt(category.categoryId.replace('C', ''), 10) || index + 1,
              questions: categoryQuestions,
              companyType: category.companyType
            };
          })
          .sort((a, b) => a.order - b.order);

        console.log('✨ Data transformation complete:', {
          categoriesCount: transformedCategories.length,
          firstCategory: transformedCategories[0]?.name,
          totalQuestions: transformedCategories.reduce((sum, cat) => sum + cat.questions.length, 0)
        });

        // Auto-select first category if we have the required form data
        const hasRequiredFormData = state.formData.name && 
          state.formData.email && 
          state.formData.companyName && 
          state.formData.companyType;

        const firstCategory = transformedCategories[0];

        setState(prev => ({
          ...prev,
          categories: transformedCategories,
          methodAnswers: data.answers,
          isLoading: false,
          currentCategory: hasRequiredFormData && firstCategory ? firstCategory : null,
          currentQuestion: hasRequiredFormData && firstCategory ? firstCategory.questions[0] : null
        }));

      } catch (error) {
        console.error('Error fetching assessment data:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load assessment data. Please try again.'
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [state.formData.companyType, locale, setState]);

  // Calculate progress and handle completion
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

    // Update progress if changed
    if (newProgress !== state.progress) {
      setState(prev => ({ ...prev, progress: newProgress }));
    }

    // Only check completion if we have categories and not in initial load
    if (state.categories.length === 0 || isLoading || hasCompletedAssessment) return;

    // Check if assessment is complete
    const allQuestionsAnswered = validAnswers.length >= totalQuestions;
    const allCategoriesCompleted = state.categories.every(cat => 
      state.completedCategories.includes(cat.id)
    );
    
    const isComplete = allQuestionsAnswered && allCategoriesCompleted;
    const hasRequiredFields = state.formData.name && 
      state.formData.email && 
      state.formData.companyName && 
      state.formData.companyType;

    console.log('Completion Check:', {
      allQuestionsAnswered,
      allCategoriesCompleted,
      validAnswersCount: validAnswers.length,
      totalQuestions,
      hasCategories: state.categories.length > 0,
      hasRequiredFields,
      isLoading,
      hasCompletedAssessment,
      currentCategory: state.currentCategory?.name
    });
    
    // Only save and navigate if:
    // 1. All questions are answered AND all categories are completed
    // 2. We have all required form data
    // 3. We're not already saving
    // 4. We've finished the last category (currentCategory is null)
    // 5. We haven't already completed the assessment
    if (isComplete && hasRequiredFields && !isLoading && state.currentCategory === null && !hasCompletedAssessment) {
      console.log('Assessment complete, saving results...');
      setHasCompletedAssessment(true);
      
      // Clean up answers before saving
      const cleanAnswers = Object.fromEntries(validAnswers);
      
      // Save results
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
            airtableId: q.airtableId,
            text: q.text
          }))
        }))
      }).then(() => {
        console.log('Save successful, navigating to results...');
        router.push(`/${locale}${routes.results}`);
      }).catch(error => {
        console.error('Error saving assessment results:', error);
        setHasCompletedAssessment(false);
      });
    }
  }, [
    state.answers,
    state.categories,
    state.completedCategories,
    state.currentCategory,
    state.formData,
    isLoading,
    hasCompletedAssessment,
    locale,
    router,
    setState
  ]);

  const setGoal = useCallback((goal: string) => {
    setState(prev => ({ ...prev, goal }));
  }, [setState]);

  const setFormData = useCallback((formData: FormData) => {
    setState(prev => {
      // Reset assessment state when company type changes
      if (formData.companyType !== prev.formData.companyType) {
        return {
          ...prev,
          formData,
          currentCategory: null,
          currentQuestion: null,
          completedCategories: [],
          answers: {}
        };
      }
      return { ...prev, formData };
    });
  }, [setState]);

  const setCurrentCategory = useCallback((category: Category) => {
    console.log('Selected category:', {
      name: category.name,
      id: category.id,
      questionCount: category.questions.length,
      existingAnswers: category.questions
        .filter(q => state.answers[q.id])
        .map(q => ({ id: q.id, answer: state.answers[q.id] }))
    });

    // When selecting a category, always start with the first unanswered question
    // If all questions are answered, start with the first question
    const firstUnansweredQuestion = category.questions.find(q => !state.answers[q.id]);
    
    setState(prev => ({
      ...prev,
      currentCategory: category,
      currentQuestion: firstUnansweredQuestion || category.questions[0] || null
    }));
  }, [setState, state.answers]);

  const setAnswer = useCallback((questionId: string, value: number) => {
    setState(prev => {
      const currentCategory = prev.currentCategory;
      const currentQuestion = prev.currentQuestion;
      
      if (!currentCategory || !currentQuestion) return prev;

      console.log('💬 Answer update:', {
        category: currentCategory.name,
        questionId,
        newValue: value,
        previousValue: prev.answers[questionId]
      });

      // Just update the answer - navigation is handled separately
      return { 
        ...prev, 
        answers: { ...prev.answers, [questionId]: value }
      };
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
      
      // Check category completion status
      const categoryAnswers = currentCategory.questions.map(q => ({
        questionId: q.id,
        hasAnswer: !!prev.answers[q.id],
        answer: prev.answers[q.id]
      }));

      const allCategoryQuestionsAnswered = categoryAnswers.every(q => q.hasAnswer);
      const isLastQuestion = !nextQuestion;

      // If we're on the last question and all questions are answered,
      // mark the category as completed if not already
      if (isLastQuestion && allCategoryQuestionsAnswered) {
        const newCompletedCategories = prev.completedCategories.includes(currentCategory.id)
          ? prev.completedCategories
          : [...prev.completedCategories, currentCategory.id];

        console.log(`✅ Category status:`, {
          name: currentCategory.name,
          isComplete: allCategoryQuestionsAnswered,
          answeredQuestions: categoryAnswers.filter(q => q.hasAnswer).length,
          totalQuestions: categoryAnswers.length
        });

        return {
          ...prev,
          completedCategories: newCompletedCategories,
          // Stay on the last question
          currentQuestion: currentCategory.questions[currentQuestionIndex]
        };
      }

      // If there's a next question, move to it
      if (nextQuestion) {
        return { ...prev, currentQuestion: nextQuestion };
      }

      // Otherwise stay on current question
      return prev;
    });
  }, [state.currentCategory, state.currentQuestion]);

  // Add a new function for manual category navigation
  const moveToNextCategory = useCallback(() => {
    if (!state.currentCategory) return;

    setState(prev => {
      const currentCategoryIndex = prev.categories.findIndex(c => c.id === prev.currentCategory?.id);
      const nextCategory = prev.categories[currentCategoryIndex + 1];

      if (nextCategory) {
        console.log(`➡️ Moving to next category: "${nextCategory.name}"`);
        // Find first unanswered question in next category
        const firstUnansweredQuestion = nextCategory.questions.find(q => !prev.answers[q.id]);
        return {
          ...prev,
          currentCategory: nextCategory,
          currentQuestion: firstUnansweredQuestion || nextCategory.questions[0]
        };
      }

      // If no next category, we're done
      console.log('🎉 Assessment completed!');
      return {
        ...prev,
        currentCategory: null,
        currentQuestion: null
      };
    });
  }, [state.currentCategory]);

  const resetAssessment = useCallback(() => {
    console.log('🔄 Resetting assessment state to default');
    setHasCompletedAssessment(false);
    setState({
      ...defaultState,
      isLoading: false // Ensure we don't show loading state after reset
    });
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
    isStepAccessible,
    setState,
    moveToNextCategory
  };

  // Show loading state only on initial load
  if (isLoading && state.isLoading) {
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