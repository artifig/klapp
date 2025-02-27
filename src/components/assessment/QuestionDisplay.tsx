'use client';

import { useMemo } from 'react';
import type { Question } from '@/lib/utils';

interface QuestionDisplayProps {
  question: Question;
  onAnswerSelect: (answerId: string) => void;
  selectedAnswerId?: string;
}

export function QuestionDisplay({
  question,
  onAnswerSelect,
  selectedAnswerId,
}: QuestionDisplayProps) {
  // Shuffle answers when component mounts or when question changes, but keep them in the same order during re-renders
  const shuffledAnswers = useMemo(() => {
    return [...question.answers].sort(() => Math.random() - 0.5);
  }, [question]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-secondary mb-2">{question.questionText_et}</h2>
        {question.questionDescription_et && (
          <p className="text-gray-600 mb-4">{question.questionDescription_et}</p>
        )}
      </div>

      <div className="space-y-3">
        {shuffledAnswers.map((answer) => (
          <div 
            key={answer.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 
              ${selectedAnswerId === answer.id 
                ? 'border-primary bg-primary/5 shadow-md' 
                : 'border-gray-200 hover:border-primary/30 hover:bg-gray-50'}`}
            onClick={() => onAnswerSelect(answer.id)}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <div 
                  className={`w-5 h-5 rounded-full border flex items-center justify-center
                    ${selectedAnswerId === answer.id 
                      ? 'border-primary' 
                      : 'border-gray-300'}`}
                >
                  {selectedAnswerId === answer.id && (
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                  )}
                </div>
              </div>
              <div>
                <p className={`font-medium ${selectedAnswerId === answer.id ? 'text-secondary' : 'text-gray-700'}`}>
                  {answer.answerText_et}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 