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

type AssessmentQuestion = {
  categoryId: string;
  question: MethodQuestion;
  answers: MethodAnswer[];
};

export default function AssessmentPage() {
  const t = useTranslations();
  const {state, setAnswer} = useAssessment();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(state.answers);
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessmentStructure, setAssessmentStructure] = useState<CategoryWithQuestions[]>([]);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);

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
      setCurrentQuestionIndex(prev => prev - 1);
      setShowError(false);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    if (Object.keys(answers).length < questions.length) {
      e.preventDefault();
      setShowError(true);
      return;
    }
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
      <div className="h-full flex flex-col">
        <div className="flex-1 grid lg:grid-cols-2 gap-4">
          {/* Left Column - Progress and Information */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-4xl">{t('assessment.title')}</CardTitle>
              <CardDescription className="text-lg">
                {t('assessment.progress')}: {Math.round(progress)}%
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto flex flex-col">
              <div className="flex-1 space-y-6">
                {/* Overall Progress Bar */}
                <div className="space-y-2">
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Overall Progress</span>
                    <span>{Math.round(progress)}% Complete</span>
                  </div>
                </div>

                {/* Category Progress */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Categories Progress</h3>
                  <div className="space-y-3">
                    {categories.map(cat => {
                      const isCurrentCategory = currentQuestion?.categoryId === cat.categoryId;
                      const categoryData = assessmentStructure.find(s => s.category.categoryId === cat.categoryId)?.category;
                      return (
                        <div 
                          key={cat.categoryId}
                          className={`p-4 border rounded-sm transition-colors
                            ${isCurrentCategory 
                              ? 'border-orange-500 bg-orange-500/10' 
                              : cat.progress === 100
                                ? 'border-green-500/50 bg-green-500/5'
                                : cat.progress > 0
                                  ? 'border-gray-700 bg-gray-800/50'
                                  : 'border-gray-800 bg-gray-900/50'}`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-sm font-medium text-gray-300">{categoryData?.categoryText}</div>
                            <div className="text-sm text-gray-400">{cat.answered}/{cat.total}</div>
                          </div>
                          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                cat.progress === 100 
                                  ? 'bg-green-500' 
                                  : isCurrentCategory 
                                    ? 'bg-orange-500'
                                    : 'bg-gray-600'
                              }`}
                              style={{ width: `${cat.progress}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-800">
                <Link
                  href={routes.setup}
                  className="secondary-button block w-full text-center"
                >
                  {t('nav.back')}
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Current Question */}
          {currentQuestion && (
            <Card className="flex flex-col">
              <CardHeader className="space-y-6">
                {/* Title and Progress Stats */}
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-white">
                    {t('assessment.title')}
                  </h2>
                  <div className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-400">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </div>
                </div>

                {/* Compact Progress Statistics */}
                <div className="space-y-4 p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                  {/* Main Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* Overall Progress */}
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Overall</div>
                      <div className="text-lg font-medium text-orange-500">
                        {Math.round(progress)}%
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Category Progress */}
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Category</div>
                      <div className="text-lg font-medium text-orange-500">
                        {currentCategoryProgress?.answered || 0}
                        <span className="text-gray-600">/</span>
                        {currentCategoryProgress?.total || 0}
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 transition-all duration-300"
                          style={{ width: `${currentCategoryProgress?.progress || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Current Category */}
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Section</div>
                      <div className="text-sm font-medium text-orange-500 truncate" title={currentQuestion.categoryId}>
                        {currentQuestion.categoryId}
                      </div>
                      <div className="text-sm text-gray-300 truncate" title={assessmentStructure.find(cat => cat.category.categoryId === currentQuestion.categoryId)?.category.categoryText}>
                        {assessmentStructure.find(cat => cat.category.categoryId === currentQuestion.categoryId)?.category.categoryText}
                      </div>
                    </div>
                  </div>

                  {/* Category Completion Overview */}
                  <div className="border-t border-gray-800 pt-3">
                    <div className="text-xs text-gray-400 mb-2">Categories Completion</div>
                    <div className="flex flex-wrap gap-1.5">
                      {categories.map(cat => {
                        const isCurrentCategory = currentQuestion?.categoryId === cat.categoryId;
                        return (
                          <div
                            key={cat.categoryId}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-help
                              ${cat.progress === 100
                                ? 'bg-green-500'
                                : isCurrentCategory
                                  ? 'bg-orange-500'
                                  : cat.progress > 0
                                    ? 'bg-gray-600'
                                    : 'bg-gray-800'
                              }`}
                            title={`${assessmentStructure.find(s => s.category.categoryId === cat.categoryId)?.category.categoryText}: ${Math.round(cat.progress)}%`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Category Description */}
                <div className="text-sm text-gray-400 bg-gray-900/30 p-3 rounded-lg border border-gray-800">
                  {assessmentStructure.find(cat => cat.category.categoryId === currentQuestion.categoryId)?.category.categoryDescription}
                </div>

                {/* Current Question */}
                <div className="space-y-4">
                  <div className="text-xl font-medium text-white">
                    {currentQuestion.question.questionText}
                  </div>
                  {showError && (
                    <p className="text-red-500 text-sm">
                      {t('assessment.completeAllQuestions')}
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <div className="grid gap-3">
                    {currentQuestion.answers.map(answer => (
                      <button
                        key={answer.answerId}
                        onClick={() => handleAnswer(currentQuestion.question.questionId, answer.answerId)}
                        className={`w-full p-4 text-left border rounded-lg transition-all duration-300 
                          ${answers[currentQuestion.question.questionId] === answer.answerId
                            ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/10'
                            : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0
                            ${answers[currentQuestion.question.questionId] === answer.answerId
                              ? 'border-orange-500 bg-orange-500'
                              : 'border-gray-600'
                            }`}
                          />
                          <span className="text-lg">{answer.answerText}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-6">
                  {Object.keys(answers).length === questions.length ? (
                    <Link
                      href={routes.results}
                      onClick={handleNext}
                      className="primary-button block w-full text-center"
                    >
                      {t('nav.results')}
                    </Link>
                  ) : (
                    <div className="flex space-x-4">
                      {currentQuestionIndex > 0 && (
                        <button
                          onClick={handlePrevious}
                          className="secondary-button flex-1"
                        >
                          {t('assessment.previousQuestion')}
                        </button>
                      )}
                      <button
                        onClick={() => handleAnswer(
                          currentQuestion.question.questionId,
                          currentQuestion.answers[0].answerId
                        )}
                        className="primary-button flex-1"
                      >
                        {t('assessment.nextQuestion')}
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageWrapper>
  );
} 