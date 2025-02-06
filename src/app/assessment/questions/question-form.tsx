"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MethodCategory, MethodQuestion, MethodAnswer } from "@/lib/airtable";

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
  const [responses, setResponses] = useState(existingResponses);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if categories array is empty
  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-red-600 mb-4">
          Küsimusi ei leitud. Palun proovige uuesti.
        </p>
        <button
          onClick={() => router.push('/assessment')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Tagasi algusesse
        </button>
      </div>
    );
  }

  const currentCategory = categories[currentCategoryIndex];
  
  // Check if current category exists
  if (!currentCategory) {
    console.error('Current category is undefined:', { currentCategoryIndex, categoriesLength: categories.length });
    return (
      <div className="text-center py-8">
        <p className="text-lg text-red-600 mb-4">
          Viga kategooria laadimisel. Palun proovige uuesti.
        </p>
        <button
          onClick={() => router.push('/assessment')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Tagasi algusesse
        </button>
      </div>
    );
  }

  const isLastCategory = currentCategoryIndex === categories.length - 1;

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setResponses(prev => {
      const existing = prev.find(r => r.questionId === questionId);
      if (existing) {
        return prev.map(r => r.questionId === questionId ? { ...r, answerId } : r);
      }
      return [...prev, { questionId, answerId }];
    });
  };

  const isCurrentCategoryComplete = () => {
    return currentCategory.questions.every(question =>
      responses.some(r => r.questionId === question.id)
    );
  };

  const handleNext = () => {
    if (isCurrentCategoryComplete()) {
      setCurrentCategoryIndex(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (!isCurrentCategoryComplete()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/assessment/${assessmentId}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses }),
      });

      if (!res.ok) throw new Error('Failed to save responses');

      router.push(`/assessment/${assessmentId}/results`);
    } catch (error) {
      console.error('Error saving responses:', error);
      alert('Viga vastuste salvestamisel. Palun proovige uuesti.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">
            Kategooria {currentCategoryIndex + 1} / {categories.length}
          </span>
          <span className="text-sm font-medium">
            {Math.round(((currentCategoryIndex + 1) / categories.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${((currentCategoryIndex + 1) / categories.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Category header */}
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6">
        <h2 className="text-2xl font-bold mb-2">{currentCategory.categoryText_et}</h2>
        <p className="text-gray-600 dark:text-gray-300">
          {currentCategory.categoryDescription_et}
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {currentCategory.questions.map((question) => (
          <div key={question.id} className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">{question.questionText_et}</h3>
            {question.questionDescription_et && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {question.questionDescription_et}
              </p>
            )}
            <div className="space-y-3">
              {question.answers.map((answer) => (
                <label
                  key={answer.id}
                  className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    responses.some(r => r.questionId === question.id && r.answerId === answer.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={answer.id}
                    checked={responses.some(
                      r => r.questionId === question.id && r.answerId === answer.id
                    )}
                    onChange={() => handleAnswerSelect(question.id, answer.id)}
                    className="sr-only"
                  />
                  <span className="ml-2">{answer.answerText_et}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setCurrentCategoryIndex(prev => prev - 1)}
          disabled={currentCategoryIndex === 0}
          className={`px-6 py-2 rounded-lg font-medium ${
            currentCategoryIndex === 0
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Eelmine
        </button>
        {isLastCategory ? (
          <button
            onClick={handleSubmit}
            disabled={!isCurrentCategoryComplete() || isSubmitting}
            className={`px-6 py-2 rounded-lg font-medium ${
              !isCurrentCategoryComplete() || isSubmitting
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Salvestamine...' : 'Lõpeta hindamine'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!isCurrentCategoryComplete()}
            className={`px-6 py-2 rounded-lg font-medium ${
              !isCurrentCategoryComplete()
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Järgmine
          </button>
        )}
      </div>
    </div>
  );
} 