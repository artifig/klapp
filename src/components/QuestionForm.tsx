"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { MethodCategory, MethodQuestion, MethodAnswer } from "@/lib/airtable";
import { Card, CardContent } from "@/components/ui/card";

interface QuestionWithAnswers extends MethodQuestion {
  answers: MethodAnswer[];
  selectedAnswer?: string;
}

interface CategoryWithQuestions extends MethodCategory {
  questions: QuestionWithAnswers[];
}

interface QuestionFormProps {
  assessmentId: string;
  categories: CategoryWithQuestions[];
  existingResponses: Array<{ questionId: string; answerId: string; }>;
}

export function QuestionForm({ assessmentId, categories, existingResponses }: QuestionFormProps) {
  const router = useRouter();
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState(existingResponses);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentCategory = categories[currentCategoryIndex];
  
  // Check if categories array is empty
  if (!categories || categories.length === 0) {
    return (
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">Küsimusi ei leitud. Palun proovige uuesti.</p>
        <Button 
          variant="default" 
          onClick={() => router.push('/assessment')}
        >
          Tagasi algusesse
        </Button>
      </div>
    );
  }

  // Check if current category exists
  if (!currentCategory) {
    console.error('Current category is undefined:', { currentCategoryIndex, categoriesLength: categories.length });
    return (
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">Viga kategooria laadimisel. Palun proovige uuesti.</p>
        <Button 
          variant="default" 
          onClick={() => router.push('/assessment')}
        >
          Tagasi algusesse
        </Button>
      </div>
    );
  }

  const currentQuestion = currentCategory.questions[currentQuestionIndex];
  const isLastCategory = currentCategoryIndex === categories.length - 1;
  const isLastQuestionInCategory = currentQuestionIndex === currentCategory.questions.length - 1;

  // Calculate total questions and current question number across all categories
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
  };

  const isCurrentQuestionAnswered = () => {
    return responses.some(r => r.questionId === currentQuestion.id);
  };

  const handleNext = () => {
    if (!isCurrentQuestionAnswered()) return;

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
    if (!isCurrentQuestionAnswered()) return;

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
    <div className="space-y-6">
      <div className="flex flex-col space-y-1.5">
        <h2 className="text-sm font-medium text-muted-foreground">{currentCategory.categoryText_et}</h2>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Küsimus {currentQuestionNumber} / {totalQuestions}</span>
          <span>{Math.round((currentQuestionNumber / totalQuestions) * 100)}%</span>
        </div>
        <div className="h-1 w-full bg-muted overflow-hidden rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-[#FF6600] to-[#EB8B00] transition-all duration-300"
            style={{ width: `${(currentQuestionNumber / totalQuestions) * 100}%` }} 
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="text-base font-medium">{currentQuestion.questionText_et}</h3>
            {currentQuestion.questionDescription_et && (
              <p className="text-sm text-muted-foreground">{currentQuestion.questionDescription_et}</p>
            )}
            <div className="grid gap-2">
              {currentQuestion.answers.map((answer) => (
                <label 
                  key={answer.id}
                  className={`relative flex cursor-pointer rounded-lg border p-4 hover:border-tehnopol focus:outline-none ${
                    responses.some(r => r.questionId === currentQuestion.id && r.answerId === answer.id)
                      ? 'border-tehnopol bg-tehnopol/5'
                      : 'border-muted'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={answer.id}
                    checked={responses.some(
                      r => r.questionId === currentQuestion.id && r.answerId === answer.id
                    )}
                    onChange={() => handleAnswerSelect(currentQuestion.id, answer.id)}
                    className="sr-only"
                  />
                  <span className="text-sm">{answer.answerText_et}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentCategoryIndex === 0 && currentQuestionIndex === 0}
        >
          Eelmine
        </Button>
        {isLastCategory && isLastQuestionInCategory ? (
          <Button
            variant="default"
            onClick={handleSubmit}
            disabled={!isCurrentQuestionAnswered() || isSubmitting}
          >
            {isSubmitting ? 'Salvestamine...' : 'Lõpeta hindamine'}
          </Button>
        ) : (
          <Button
            variant="default"
            onClick={handleNext}
            disabled={!isCurrentQuestionAnswered()}
          >
            Järgmine
          </Button>
        )}
      </div>
    </div>
  );
} 