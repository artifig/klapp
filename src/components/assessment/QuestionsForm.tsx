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
      <div className="text-center py-8">
        <p className="text-gray-700 mb-4">Küsimusi ei leitud. Palun proovige uuesti.</p>
        <Button variant="primary" onClick={() => router.push('/assessment')}>
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
      <div className="text-center py-8">
        <p className="text-gray-700 mb-4">Viga küsimuste laadimisel. Palun proovige uuesti.</p>
        <Button variant="primary" onClick={() => router.push('/assessment')}>
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

  const handleAnswerSelect = (answerId: string) => {
    setError(null);
    setResponses(prev => {
      const existing = prev.find(r => r.questionId === currentQuestion.id);
      if (existing) {
        return prev.map(r => r.questionId === currentQuestion.id ? { ...r, answerId } : r);
      }
      return [...prev, { questionId: currentQuestion.id, answerId }];
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
  const progressPercentage = Math.round((currentQuestionNumber / totalQuestions) * 100);

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-secondary">{currentCategory.categoryText_et}</h2>
          <div className="text-sm text-gray-600">
            Küsimus {currentQuestionNumber} / {totalQuestions}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-primary h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg" role="alert">
          {error}
        </div>
      )}

      <QuestionDisplay
        question={currentQuestion}
        onAnswerSelect={handleAnswerSelect}
        selectedAnswerId={selectedAnswerId}
      />

      <div className="flex justify-between pt-6 border-t border-gray-200 mt-8">
        <Button
          variant="secondary"
          onClick={handlePrevious}
          disabled={currentCategoryIndex === 0 && currentQuestionIndex === 0}
          className="px-6"
        >
          Eelmine
        </Button>
        
        {isLastCategory && isLastQuestionInCategory && (
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6"
          >
            {isSubmitting ? 'Salvestamine...' : 'Lõpeta hindamine'}
          </Button>
        )}
      </div>
    </div>
  );
} 