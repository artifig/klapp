'use client';

import {useTranslations} from 'next-intl';
import {Link, routes} from '@/navigation';
import {useState, useEffect} from 'react';
import {PageWrapper} from '@/components/ui/PageWrapper';
import {Card, CardHeader, CardTitle, CardDescription, CardContent} from '@/components/ui/Card';
import {useAssessment} from '@/context/AssessmentContext';
import {AirtableService, CategoryWithQuestions, MethodQuestion, MethodAnswer, CompanyType} from '@/services/airtable';

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
        console.log('Company type:', state.formData.companyType);
        
        setIsLoading(true);
        setError(null);
        
        // Get assessment structure for the company type
        const structure = await AirtableService.getAssessmentStructure(state.formData.companyType as CompanyType);
        console.log('Received structure:', structure);
        setAssessmentStructure(structure);

        // Transform structure into flat list of questions
        const allQuestions: AssessmentQuestion[] = [];
        for (const category of structure) {
          console.log(`Processing category: ${category.category.categoryId}`);
          console.log('Questions in category:', category.questions);
          for (const question of category.questions) {
            console.log(`Processing question: ${question.questionId}`);
            console.log('Available answers:', category.answers[question.questionId]);
            allQuestions.push({
              categoryId: category.category.categoryId,
              question,
              answers: category.answers[question.questionId] || []
            });
          }
        }
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
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-400 text-right">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </p>
                </div>

                {/* Previous Answers */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">{t('assessment.yourAnswers')}</h3>
                  <div className="space-y-3">
                    {questions.map((q, index) => {
                      const answered = answers[q.question.questionId];
                      const answer = q.answers.find(a => a.answerId === answered);
                      return (
                        <div 
                          key={q.question.questionId}
                          className={`p-3 border rounded-sm transition-colors
                            ${index === currentQuestionIndex 
                              ? 'border-orange-500 bg-orange-500/10' 
                              : answered 
                                ? 'border-gray-700 bg-gray-800/50'
                                : 'border-gray-800 bg-gray-900/50'}`}
                        >
                          <div className="text-sm font-medium text-gray-300">{q.categoryId}</div>
                          <div className="mt-1 text-sm">
                            {answered ? (
                              <span className="text-orange-500">{answer?.answerText}</span>
                            ) : (
                              <span className="text-gray-500">{t('assessment.notAnswered')}</span>
                            )}
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
                  className="w-full px-6 py-2 bg-gray-800 text-white font-medium 
                    hover:bg-gray-700 transition-colors text-center"
                >
                  {t('nav.back')}
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Current Question */}
          {currentQuestion && (
            <Card className="flex flex-col">
              <CardHeader>
                <div className="text-sm text-orange-500 uppercase tracking-wider mb-2">
                  {currentQuestion.categoryId}
                </div>
                <CardTitle>{currentQuestion.question.questionText}</CardTitle>
                {showError && (
                  <p className="text-red-500 text-sm mt-2">
                    {t('assessment.completeAllQuestions')}
                  </p>
                )}
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <div className="grid gap-3">
                    {currentQuestion.answers.map(answer => (
                      <button
                        key={answer.answerId}
                        onClick={() => handleAnswer(currentQuestion.question.questionId, answer.answerId)}
                        className={`w-full p-4 text-left border transition-all duration-300 ${
                          answers[currentQuestion.question.questionId] === answer.answerId
                            ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/10'
                            : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'
                        }`}
                      >
                        {answer.answerText}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-6">
                  {Object.keys(answers).length === questions.length ? (
                    <Link
                      href={routes.results}
                      onClick={handleNext}
                      className="w-full px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-700 text-white font-medium
                        shadow-lg hover:from-orange-600 hover:to-orange-800 transition-all text-center"
                    >
                      {t('nav.results')}
                    </Link>
                  ) : (
                    <div className="flex space-x-4">
                      {currentQuestionIndex > 0 && (
                        <button
                          onClick={handlePrevious}
                          className="flex-1 px-8 py-3 bg-gray-800 text-white font-medium
                            hover:bg-gray-700 transition-all text-center"
                        >
                          {t('assessment.previousQuestion')}
                        </button>
                      )}
                      <button
                        onClick={() => handleAnswer(
                          currentQuestion.question.questionId,
                          currentQuestion.answers[0].answerId
                        )}
                        className="flex-1 px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-700 text-white font-medium
                          shadow-lg hover:from-orange-600 hover:to-orange-800 transition-all text-center"
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