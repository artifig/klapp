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

  const currentCategory = categories[currentCategoryIndex];
  
  // Check if categories array is empty
  if (!categories || categories.length === 0) {
    return (
      <div>
        <p>Küsimusi ei leitud. Palun proovige uuesti.</p>
        <button onClick={() => router.push('/assessment')}>
          Tagasi algusesse
        </button>
      </div>
    );
  }

  // Check if current category exists
  if (!currentCategory) {
    console.error('Current category is undefined:', { currentCategoryIndex, categoriesLength: categories.length });
    return (
      <div>
        <p>Viga kategooria laadimisel. Palun proovige uuesti.</p>
        <button onClick={() => router.push('/assessment')}>
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
      <h2>{currentCategory.categoryText_et}</h2>
      <p>Kategooria {currentCategoryIndex + 1} / {categories.length}</p>
      <div className="progress-bar">
        <div 
          className="progress-indicator"
          style={{ width: `${((currentCategoryIndex + 1) / categories.length) * 100}%` }} 
        />
      </div>

      {currentCategory.questions.map((question) => (
        <div key={question.id} className="question-section">
          <h3>{question.questionText_et}</h3>
          {question.questionDescription_et && (
            <p>{question.questionDescription_et}</p>
          )}
          <div className="radio-group">
            {question.answers.map((answer) => (
              <label 
                key={answer.id}
                className={`radio-label ${
                  responses.some(r => r.questionId === question.id && r.answerId === answer.id)
                    ? 'selected'
                    : ''
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
                />
                <span>{answer.answerText_et}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="nav-buttons">
        <button
          onClick={() => setCurrentCategoryIndex(prev => prev - 1)}
          disabled={currentCategoryIndex === 0}
          className="secondary"
        >
          Eelmine
        </button>
        {isLastCategory ? (
          <button
            onClick={handleSubmit}
            disabled={!isCurrentCategoryComplete() || isSubmitting}
          >
            {isSubmitting ? 'Salvestamine...' : 'Lõpeta hindamine'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!isCurrentCategoryComplete()}
          >
            Järgmine
          </button>
        )}
      </div>
    </div>
  );
} 