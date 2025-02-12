"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/UiButton";
import type { ProcessedCategory, AssessmentResponse } from "@/lib/utils";
import { QuestionDisplay } from "./QuestionDisplay";
import { saveResponses } from "@/lib/api";

interface QuestionsFormProps {
  assessmentId: string;
  categories: ProcessedCategory[];
  existingResponses: AssessmentResponse[];
}

export function QuestionsForm({ assessmentId, categories, existingResponses }: QuestionsFormProps) {
  const router = useRouter();
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState(existingResponses);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentCategory = categories[currentCategoryIndex];
  const currentQuestion = currentCategory?.questions[currentQuestionIndex];
  
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

  if (!currentCategory || !currentQuestion) {
    console.error('Current category or question is undefined:', { 
      currentCategoryIndex, 
      currentQuestionIndex,
      categoriesLength: categories.length 
    });
    return (
      <div>
        <p>Viga küsimuste laadimisel. Palun proovige uuesti.</p>
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
    setError(null);
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
    setError(null);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
      setCurrentQuestionIndex(categories[currentCategoryIndex - 1].questions.length - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await saveResponses(assessmentId, responses);
      router.push(`/assessment/results?id=${assessmentId}`);
    } catch (error) {
      console.error('Error saving responses:', error);
      setError('Viga vastuste salvestamisel. Palun proovige uuesti.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAnswerId = responses.find(r => r.questionId === currentQuestion.id)?.answerId;

  return (
    <div>
      <div>
        <h2>{currentCategory.categoryText_et}</h2>
        <div>
          <span>Küsimus {currentQuestionNumber} / {totalQuestions}</span>
          <span>{Math.round((currentQuestionNumber / totalQuestions) * 100)}%</span>
        </div>
      </div>

      {error && <div role="alert">{error}</div>}

      <QuestionDisplay
        question={currentQuestion}
        onAnswerSelect={handleAnswerSelect}
        selectedAnswerId={selectedAnswerId}
      />

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