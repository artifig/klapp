'use client';

import {useTranslations} from 'next-intl';
import {Link, routes} from '@/navigation';
import {useState, useEffect, useMemo, useCallback, useRef} from 'react';
import {PageWrapper} from '@/components/ui/PageWrapper';
import {Card, CardHeader, CardTitle, CardDescription, CardContent} from '@/components/ui/Card';
import {useAssessment} from '@/context/AssessmentContext';
import {
  AirtableService,
  CategoryWithQuestions,
  MethodQuestion,
  MethodAnswer,
  CompanyType,
  CompanyTypeMapping
} from '@/services/airtable';
import {AnswerOption} from '@/components/ui/AnswerOption';
import {ChevronLeft, ChevronRight, WifiOff} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

type AssessmentQuestion = {
  categoryId: string;
  question: MethodQuestion;
  answers: MethodAnswer[];
};

export default function AssessmentPage() {
  const t = useTranslations();
  const {state, setAnswer} = useAssessment();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessmentStructure, setAssessmentStructure] = useState<CategoryWithQuestions[]>([]);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'error'>('synced');
  const syncTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const syncDebounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    async function loadAssessmentData() {
      try {
        console.log('Starting to load assessment data');
        const formCompanyType = state.formData.companyType;
        console.log('Form company type:', formCompanyType);
        
        if (!formCompanyType) {
          throw new Error('Company type not selected');
        }

        const mappedCompanyType = CompanyTypeMapping[formCompanyType as keyof typeof CompanyTypeMapping];
        console.log('Mapped company type:', mappedCompanyType);
        
        setIsLoading(true);
        setError(null);
        
        // Get assessment structure for the company type
        const structure = await AirtableService.getAssessmentStructure(mappedCompanyType);
        console.log('Received structure:', structure);
        setAssessmentStructure(structure);

        // Transform structure into flat list of questions
        const allQuestions: AssessmentQuestion[] = [];
        const seenQuestionIds = new Set<string>(); // Track seen question IDs

        for (const category of structure) {
          console.log(`Processing category: ${category.category.categoryId}`);
          console.log('Questions in category:', category.questions);
          
          for (const question of category.questions) {
            if (seenQuestionIds.has(question.questionId)) {
              console.warn(`Duplicate question ID found: ${question.questionId}`);
              continue; // Skip duplicate questions
            }
            
            seenQuestionIds.add(question.questionId);
            console.log(`Processing question: ${question.questionId}`);
            console.log('Available answers:', category.answers[question.questionId]);
            
            allQuestions.push({
              categoryId: category.category.categoryId,
              question,
              answers: category.answers[question.questionId] || []
            });
          }
        }
        
        // Sort questions by their ID to ensure consistent order
        allQuestions.sort((a, b) => {
          const aNum = parseInt(a.question.questionId.replace('Q', ''));
          const bNum = parseInt(b.question.questionId.replace('Q', ''));
          return aNum - bNum;
        });
        
        console.log('Final questions array:', allQuestions);
        setQuestions(allQuestions);
      } catch (err) {
        console.error('Error loading assessment data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load assessment data');
      } finally {
        setIsLoading(false);
      }
    }

    loadAssessmentData();
  }, [state.formData.companyType]);

  // Load cached answers from localStorage
  useEffect(() => {
    const cachedAnswers = localStorage.getItem('assessment_answers');
    if (cachedAnswers) {
      const parsed = JSON.parse(cachedAnswers);
      setAnswers(parsed);
      // Replay cached answers to context
      Object.entries(parsed).forEach(([questionId, answerId]) => {
        if (typeof answerId === 'string') {
          setAnswer(questionId, answerId);
        }
      });
    }
  }, [setAnswer]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      syncAnswers(); // Try to sync when coming back online
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      setSyncStatus('pending');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!window.navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync answers with backend
  const syncAnswers = useCallback(async () => {
    if (isOffline || !Object.keys(answers).length) return;

    try {
      // Clear any existing debounce timeout
      if (syncDebounceRef.current) {
        clearTimeout(syncDebounceRef.current);
      }

      // Debounce the sync operation
      syncDebounceRef.current = setTimeout(async () => {
        setSyncStatus('pending');
        
        // Clear any existing sync retry timeout
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }

        try {
          // Simulate API call - replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          setSyncStatus('synced');
          localStorage.setItem('assessment_answers', JSON.stringify(answers));
        } catch (err) {
          console.error('Error syncing answers:', err);
          setSyncStatus('error');
          // Retry sync after delay
          syncTimeoutRef.current = setTimeout(syncAnswers, 5000);
        }
      }, 2000); // Debounce for 2 seconds
    } catch (err) {
      console.error('Error in sync operation:', err);
      setSyncStatus('error');
    }
  }, [answers, isOffline]);

  // Sync answers whenever they change, but with a debounce
  useEffect(() => {
    syncAnswers();
    
    // Cleanup timeouts
    return () => {
      if (syncDebounceRef.current) {
        clearTimeout(syncDebounceRef.current);
      }
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [answers, syncAnswers]);

  // Add logging for render-time variables
  console.log('Current render state:', {
    isLoading,
    error,
    questionsCount: questions.length,
    currentQuestionIndex,
    currentQuestion: questions[currentQuestionIndex],
    progress: questions.length > 0 ? (currentQuestionIndex / questions.length) * 100 : 0
  });

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = (Object.keys(answers).length / questions.length) * 100;

  // Calculate category-specific progress
  const getCategoryProgress = (categoryId: string) => {
    const categoryQuestions = questions.filter(q => q.categoryId === categoryId);
    const answeredInCategory = categoryQuestions.filter(q => answers[q.question.questionId]).length;
    return {
      total: categoryQuestions.length,
      answered: answeredInCategory,
      progress: categoryQuestions.length > 0 ? (answeredInCategory / categoryQuestions.length) * 100 : 0
    };
  };

  // Get unique categories and their progress
  const categories = Array.from(new Set(questions.map(q => q.categoryId))).map(categoryId => ({
    categoryId,
    ...getCategoryProgress(categoryId)
  }));

  // Get current category progress
  const currentCategoryProgress = currentQuestion ? getCategoryProgress(currentQuestion.categoryId) : null;

  // Function to shuffle array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Memoize shuffled answers for each question
  const shuffledAnswers = useMemo(() => {
    const shuffled = new Map<string, MethodAnswer[]>();
    questions.forEach(q => {
      shuffled.set(q.question.questionId, shuffleArray(q.answers));
    });
    return shuffled;
  }, [questions]);

  const handleAnswer = (questionId: string, answerId: string) => {
    const newAnswers = {...answers, [questionId]: answerId};
    setAnswers(newAnswers);
    setAnswer(questionId, answerId);
    setShowError(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev - 1);
        setSelectedAnswer(answers[questions[currentQuestionIndex - 1].question.questionId] || null);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(answers[questions[currentQuestionIndex + 1].question.questionId] || null);
        setIsTransitioning(false);
      }, 300);
    } else {
      // This is the last question and it's answered, navigate to results
      window.location.href = routes.results;
    }
  };

  const handleAnswerSelect = (answerId: string) => {
    try {
      // Save the answer
      setSelectedAnswer(answerId);
      const newAnswers = {
        ...answers,
        [questions[currentQuestionIndex].question.questionId]: answerId
      };
      setAnswers(newAnswers);
      setAnswer(questions[currentQuestionIndex].question.questionId, answerId);
      
      // Cache answers locally
      localStorage.setItem('assessment_answers', JSON.stringify(newAnswers));

      // Auto-advance with animation
      if (currentQuestionIndex < questions.length - 1) {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentQuestionIndex(prev => prev + 1);
          setSelectedAnswer(answers[questions[currentQuestionIndex + 1]?.question.questionId] || null);
          setIsTransitioning(false);
        }, 300);
      } else {
        // If this is the last question, navigate to results after a brief delay
        setTimeout(() => {
          window.location.href = routes.results;
        }, 500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save answer');
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="lg" />
        <p className="loading-text">Loading assessment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-semibold mb-4 text-red-500">{t('common.error')}</div>
            <div className="text-gray-400">{error}</div>
            <Link
              href={routes.setup}
              className="mt-6 inline-block px-6 py-2 bg-gray-800 text-white font-medium 
                hover:bg-gray-700 transition-colors"
            >
              {t('nav.back')}
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 animate-fade">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Offline/Sync Status */}
        {(isOffline || syncStatus !== 'synced') && (
          <div className={cn(
            'flex items-center justify-between p-4 rounded-lg animate-fade-in',
            isOffline ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-blue-500/10 border border-blue-500/20'
          )}>
            <div className="flex items-center gap-2">
              {isOffline && <WifiOff className="w-4 h-4 text-yellow-500" />}
              <span className={isOffline ? 'text-yellow-500' : 'text-blue-500'}>
                {isOffline 
                  ? 'You are offline. Your answers will be saved locally.'
                  : syncStatus === 'pending' 
                    ? 'Syncing your answers...' 
                    : 'Failed to sync answers. Retrying...'}
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <ErrorMessage 
            message={error}
            className="animate-shake"
          />
        )}

        {/* Progress Section */}
        <div className="space-y-4 animate-slide-down">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h2>
            <span className="text-primary font-medium">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF6600] to-[#FFCC00] transition-all duration-500 ease-out"
              style={{
                width: `${progressPercentage}%`,
              }}
              role="progressbar"
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        {/* Question Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 space-y-6 animate-scale border border-gray-700">
          <h1 className="text-2xl font-bold text-white">{currentQuestion.question.questionText}</h1>
          
          {showError && (
            <ErrorMessage 
              message="Please select an answer before proceeding"
              className="mb-4"
            />
          )}
          
          <div 
            className="space-y-4"
            role="radiogroup"
            aria-labelledby="question-options"
          >
            {shuffledAnswers.get(currentQuestion.question.questionId)?.map((answer, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(answer.answerId)}
                className={cn(
                  'w-full p-4 text-left rounded-lg transition-standard hover-lift',
                  'border-2 focus:outline-none focus:ring-2 focus:ring-primary/50',
                  'text-white',
                  selectedAnswer === answer.answerId
                    ? 'border-primary bg-primary/20'
                    : 'border-gray-700 bg-gray-800/30 hover:border-primary/30 hover:bg-gray-800/50'
                )}
                role="radio"
                aria-checked={selectedAnswer === answer.answerId}
                tabIndex={0}
              >
                {answer.answerText}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex justify-between items-center animate-slide-up">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={cn(
              'px-6 py-2 rounded-lg transition-standard',
              'focus:outline-none focus:ring-2 focus:ring-primary/50',
              currentQuestionIndex === 0
                ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                : 'bg-gray-800 hover:bg-gray-700 text-white'
            )}
          >
            Previous
          </button>
          
          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!selectedAnswer}
              className={cn(
                'px-6 py-2 rounded-lg transition-standard',
                'focus:outline-none focus:ring-2 focus:ring-primary/50',
                !selectedAnswer
                  ? 'bg-primary/30 text-white/50 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary/90 text-white',
                'font-medium'
              )}
            >
              View Results
            </button>
          ) : null}
        </div>
      </div>
    </main>
  );
} 