'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { routes } from '@/navigation';
import { getCategories, getQuestions, saveResult, getDataForCompanyType, AirtableMethodCategory, AirtableMethodQuestion, getMethodAnswers, AirtableMethodAnswer } from '@/lib/airtable';
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

interface CacheData {
  categories: AirtableMethodCategory[];
  questions: AirtableMethodQuestion[];
  answers: AirtableMethodAnswer[];
  timestamp: number;
}

const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

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
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);
  const locale = useLocale();
  const router = useRouter();

  // Reset state on initial load
  useEffect(() => {
    if (isInitialLoad) {
      setState(defaultState);
      setIsInitialLoad(false);
    }
  }, [isInitialLoad, setState]);

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
    if (state.categories.length === 0 || isInitialLoad || hasCompletedAssessment) return;

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
      isSaving,
      hasCompletedAssessment,
      currentCategory: state.currentCategory?.name
    });
    
    // Only save and navigate if:
    // 1. All questions are answered AND all categories are completed
    // 2. We have all required form data
    // 3. We're not already saving
    // 4. We've finished the last category (currentCategory is null)
    // 5. We haven't already completed the assessment
    if (isComplete && hasRequiredFields && !isSaving && state.currentCategory === null && !hasCompletedAssessment) {
      console.log('Assessment complete, saving results...');
      setIsSaving(true);
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
        setIsSaving(false);
        router.push(`/${locale}${routes.results}`);
      }).catch(error => {
        console.error('Error saving assessment results:', error);
        setIsSaving(false);
        setHasCompletedAssessment(false);
      });
    }
  }, [
    state.answers,
    state.categories,
    state.completedCategories,
    state.currentCategory,
    state.formData,
    isInitialLoad,
    isSaving,
    hasCompletedAssessment,
    locale,
    router,
    setState
  ]);

  // Fetch categories and questions from Airtable with caching
  useEffect(() => {
    // Skip fetching if we're in the process of saving results
    if (isSaving) {
      console.log('⏳ Skipping data fetch while saving results');
      return;
    }

    // Skip fetching if we don't have a company type yet
    if (!state.formData.companyType) {
      console.log('ℹ️ No company type selected yet');
      return;
    }

    const fetchData = async () => {
      try {
        console.log('🔄 Fetching data for company type:', state.formData.companyType);
        
        const { categories, questions, answers } = await getDataForCompanyType(state.formData.companyType);
        
        console.log('Raw data received:', {
          categoriesCount: categories.length,
          questionsCount: questions.length,
          answersCount: answers.length
        });

        // Transform and sort categories
        const transformedCategories = categories
          .filter((cat: AirtableMethodCategory) => cat.isActive)
          .map((cat: AirtableMethodCategory) => {
            // Find questions for this category
            const categoryQuestions = questions
              .filter(q => cat.questionId.includes(q.id))
              .map(q => ({
                id: q.questionId, // Logical ID (Q1, Q2, etc.)
                airtableId: q.id, // Airtable record ID
                text: locale === 'et' ? q.questionText_et : q.questionText_en,
                categoryId: [cat.categoryId],
                answerId: q.answerId,
                order: parseInt(q.questionId.replace('Q', ''), 10) || 0
              }))
              .sort((a, b) => a.order - b.order);

            console.log(`Category ${cat.categoryId} has ${categoryQuestions.length} questions:`, 
              categoryQuestions.map(q => q.id));

            return {
              id: cat.categoryId,
              key: cat.categoryId,
              name: locale === 'et' ? cat.categoryText_et : cat.categoryText_en,
              description: locale === 'et' ? cat.categoryDescription_et : cat.categoryDescription_en,
              companyType: cat.companyType,
              questions: categoryQuestions,
              order: parseInt(cat.categoryId.replace('C', ''), 10) || 0
            };
          })
          .sort((a, b) => a.order - b.order);

        console.log('📊 Transformed data:', {
          categoriesCount: transformedCategories.length,
          firstCategory: transformedCategories[0] ? {
            id: transformedCategories[0].id,
            questionCount: transformedCategories[0].questions.length,
            sampleQuestions: transformedCategories[0].questions.slice(0, 3).map(q => q.id)
          } : null,
          totalQuestions: transformedCategories.reduce((sum, cat) => sum + cat.questions.length, 0)
        });

        // Store the transformed data in state
        setState(prev => ({
          ...prev,
          categories: transformedCategories,
          methodAnswers: answers.filter((a: AirtableMethodAnswer) => a.isActive),
          isLoading: false,
          error: null
        }));

        console.log('📊 Loaded', transformedCategories.length, 'categories for', state.formData.companyType);
      } catch (error) {
        console.error('Error fetching assessment data:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load assessment data'
        }));
      }
    };

    fetchData();
  }, [state.formData.companyType, locale, isSaving]);

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

      console.log(`💬 Answer selected: ${value} for question in category "${currentCategory.name}"`);

      // Update answers
      const newAnswers = { ...prev.answers, [questionId]: value };
      
      // Check if this was the last question in the category
      const currentQuestionIndex = currentCategory.questions.findIndex(q => q.id === questionId);
      const isLastQuestion = currentQuestionIndex === currentCategory.questions.length - 1;
      
      // Check if all questions in current category are now answered
      const allCategoryQuestionsAnswered = currentCategory.questions.every(q => 
        q.id === questionId ? true : !!newAnswers[q.id]
      );

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

      if (isLastQuestion) {
        console.log(`✅ Category "${currentCategory.name}" completed`);
      }

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
          console.log(`➡️ Moving to next category: "${nextCategory.name}"`);
          return {
            ...prev,
            completedCategories: newCompletedCategories,
            currentCategory: nextCategory,
            currentQuestion: nextCategory.questions[0]
          };
        } else {
          console.log('🎉 Assessment completed!');
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
    setHasCompletedAssessment(false);
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
    isStepAccessible,
    setState
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