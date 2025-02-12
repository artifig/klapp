"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/UiButton";
import type { MethodCategory, MethodQuestion, MethodAnswer } from "@/lib/airtable";
import { Card, CardContent } from "@/components/ui/UiCard";

// Shuffle array function using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface QuestionWithAnswers extends MethodQuestion {
  answers: MethodAnswer[];
  selectedAnswer?: string;
}

interface CategoryWithQuestions extends MethodCategory {
  questions: QuestionWithAnswers[];
}

interface QuestionsFormProps {
  assessmentId: string;
  categories: CategoryWithQuestions[];
  existingResponses: Array<{ questionId: string; answerId: string; }>;
}

export function QuestionsForm({ assessmentId, categories, existingResponses }: QuestionsFormProps) {
  const router = useRouter();
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState(existingResponses);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentCategory = categories[currentCategoryIndex];
  const currentQuestion = currentCategory?.questions[currentQuestionIndex];
  
  // Memoize shuffled answers for the current question
  const shuffledAnswers = useMemo(
    () => currentQuestion ? shuffleArray(currentQuestion.answers) : [],
    [currentQuestion]
  );
  
  if (!categories || categories.length === 0) {
    return (
      <div>
        <p>Küsimusi ei leitud. Palun proovige uuesti.</p>
        <Button onClick={() => router.push('/assessment')}>
          Tagasi algusesse
        </Button>
      </div>
    );
  }

  if (!currentCategory) {
    console.error('Current category is undefined:', { currentCategoryIndex, categoriesLength: categories.length });
    return (
      <div>
        <p>Viga kategooria laadimisel. Palun proovige uuesti.</p>
        <Button onClick={() => router.push('/assessment')}>
          Tagasi algusesse
        </Button>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div>
        <p>Viga küsimuse laadimisel. Palun proovige uuesti.</p>
        <Button onClick={() => router.push('/assessment')}>
          Tagasi algusesse
        </Button>
      </div>
    );
  }

  const isLastCategory = currentCategoryIndex === categories.length - 1;
  const isLastQuestionInCategory = currentQuestionIndex === currentCategory.questions.length - 1;

  const totalQuestions = categories.reduce((sum, cat) => sum + cat.questions.length, 0);
  const currentQuestionNumber = categories.slice(0, currentCategoryIndex).reduce(
    (sum, cat) => sum + cat.questions.length, 0
  ) + currentQuestionIndex + 1;

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setResponses(prev => {
      const existing = prev.find(r => r.questionId === questionId);
      if (existing) {
        return prev.map(r => r.questionId === questionId ? { ...r, answerId } : r);
      }
      return [...prev, { questionId, answerId }];
    });

    // Automatically advance to next question after selection
    if (isLastQuestionInCategory) {
      if (!isLastCategory) {
        setCurrentCategoryIndex(prev => prev + 1);
        setCurrentQuestionIndex(0);
      }
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
      setCurrentQuestionIndex(categories[currentCategoryIndex - 1].questions.length - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/assessment/${assessmentId}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses }),
      });

      if (!res.ok) throw new Error('Failed to save responses');

      router.push(`/assessment/results?id=${assessmentId}`);
    } catch (error) {
      console.error('Error saving responses:', error);
      alert('Viga vastuste salvestamisel. Palun proovige uuesti.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div>
        <h2>{currentCategory.categoryText_et}</h2>
        <div>
          <span>Küsimus {currentQuestionNumber} / {totalQuestions}</span>
          <span>{Math.round((currentQuestionNumber / totalQuestions) * 100)}%</span>
        </div>
        <div>
          <div />
        </div>
      </div>

      <Card>
        <CardContent>
          <div>
            <h3>{currentQuestion.questionText_et}</h3>
            {currentQuestion.questionDescription_et && (
              <p>{currentQuestion.questionDescription_et}</p>
            )}
            <div>
              {shuffledAnswers.map((answer) => (
                <label key={answer.id}>
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={answer.id}
                    checked={responses.some(
                      r => r.questionId === currentQuestion.id && r.answerId === answer.id
                    )}
                    onChange={() => handleAnswerSelect(currentQuestion.id, answer.id)}
                  />
                  <span>{answer.answerText_et}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        {!isLastCategory || !isLastQuestionInCategory ? (
          <Button
            onClick={handlePrevious}
            disabled={currentCategoryIndex === 0 && currentQuestionIndex === 0}
          >
            Eelmine
          </Button>
        ) : (
          <div>
            <Button
              onClick={handlePrevious}
              disabled={currentCategoryIndex === 0 && currentQuestionIndex === 0}
            >
              Eelmine
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvestamine...' : 'Lõpeta hindamine'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 