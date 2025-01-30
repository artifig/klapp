'use client';

import {useTranslations} from 'next-intl';
import {Link, routes} from '@/navigation';
import {useState, useEffect} from 'react';
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
import {ChevronLeft, ChevronRight} from 'lucide-react';

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
  const progress = questions.length > 0 ? (currentQuestionIndex / questions.length) * 100 : 0;

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
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestionIndex].question.questionId]: answer
    }));
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-semibold mb-4">{t('common.loading')}</div>
            <div className="text-gray-400">{t('assessment.loadingQuestions')}</div>
          </div>
        </div>
      </PageWrapper>
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
    <PageWrapper>
      <div className="h-full flex flex-col max-w-3xl mx-auto">
        <Card className="flex-1">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>{t('assessment.title')}</CardTitle>
              <span className="text-gray-400">
                {t('assessment.progress')}: {currentQuestionIndex + 1} / {questions.length}
              </span>
            </div>
            
            {/* Category Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t(`results.categories.${currentQuestion?.categoryId}`)}</span>
                <span className="text-gray-400">{Math.round(currentCategoryProgress?.progress || 0)}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-bar-fill"
                  style={{ width: `${currentCategoryProgress?.progress || 0}%` }}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Question */}
            <div className={`space-y-6 ${isTransitioning ? 'opacity-0' : 'animate-fade-in'}`}>
              <h2 className="text-xl font-medium text-white">
                {currentQuestion?.question.questionText}
              </h2>

              {/* Answer Options */}
              <div className="space-y-3">
                {currentQuestion?.answers.map((answer, index) => (
                  <AnswerOption
                    key={index}
                    text={answer.answerText}
                    selected={selectedAnswer === answer.answerId}
                    onSelect={() => handleAnswerSelect(answer.answerId)}
                    className="animate-slide-in"
                    style={{
                      animationDelay: `${index * 50}ms`
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="secondary-button flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                {t('assessment.previousQuestion')}
              </button>

              <button
                onClick={handleNext}
                disabled={!selectedAnswer || currentQuestionIndex === questions.length - 1}
                className="primary-button flex items-center gap-2"
              >
                {t('assessment.nextQuestion')}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
} 