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
      <div className="tehnopol-card text-center py-8">
        <p className="tehnopol-text text-lg mb-4">
          Küsimusi ei leitud. Palun proovige uuesti.
        </p>
        <button
          onClick={() => router.push('/assessment')}
          className="tehnopol-btn tehnopol-btn-primary"
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
      <div className="tehnopol-card text-center py-8">
        <p className="tehnopol-text text-lg mb-4">
          Viga kategooria laadimisel. Palun proovige uuesti.
        </p>
        <button
          onClick={() => router.push('/assessment')}
          className="tehnopol-btn tehnopol-btn-primary"
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
    <div className="tehnopol-content-group-lg">
      {/* Progress indicator */}
      <div className="tehnopol-content-group">
        <div className="tehnopol-flex-between">
          <h2 className="tehnopol-heading text-xl">
            {currentCategory.categoryText_et}
          </h2>
          <span className="tehnopol-text-sm">
            Kategooria {currentCategoryIndex + 1} / {categories.length}
          </span>
        </div>

        <div className="tehnopol-progress-bar">
          <div
            className="tehnopol-progress-indicator"
            style={{
              width: `${((currentCategoryIndex + 1) / categories.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="tehnopol-stack-lg">
        {currentCategory.questions.map((question) => (
          <div key={question.id} className="tehnopol-card">
            <div className="tehnopol-content-group">
              <h3 className="tehnopol-heading text-xl">{question.questionText_et}</h3>
              {question.questionDescription_et && (
                <p className="tehnopol-text">
                  {question.questionDescription_et}
                </p>
              )}
              <div className="tehnopol-radio-group">
                {question.answers.map((answer) => (
                  <label
                    key={answer.id}
                    className={`tehnopol-radio-label ${
                      responses.some(r => r.questionId === question.id && r.answerId === answer.id)
                        ? 'tehnopol-radio-label-selected'
                        : 'tehnopol-radio-label-unselected'
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
                    <span className="tehnopol-text">{answer.answerText_et}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="tehnopol-flex-between">
        <button
          onClick={() => setCurrentCategoryIndex(prev => prev - 1)}
          disabled={currentCategoryIndex === 0}
          className={`tehnopol-btn ${
            currentCategoryIndex === 0
              ? 'opacity-50 cursor-not-allowed'
              : 'tehnopol-btn-secondary'
          }`}
        >
          Eelmine
        </button>
        {isLastCategory ? (
          <button
            onClick={handleSubmit}
            disabled={!isCurrentCategoryComplete() || isSubmitting}
            className={`tehnopol-btn ${
              !isCurrentCategoryComplete() || isSubmitting
                ? 'opacity-50 cursor-not-allowed'
                : 'tehnopol-btn-primary'
            }`}
          >
            {isSubmitting ? 'Salvestamine...' : 'Lõpeta hindamine'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!isCurrentCategoryComplete()}
            className={`tehnopol-btn ${
              !isCurrentCategoryComplete()
                ? 'opacity-50 cursor-not-allowed'
                : 'tehnopol-btn-primary'
            }`}
          >
            Järgmine
          </button>
        )}
      </div>
    </div>
  );
} 