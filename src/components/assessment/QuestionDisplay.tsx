'use client';

import { useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/UiCard";
import type { Question, QuestionAnswer } from '@/lib/utils';

interface QuestionDisplayProps {
  question: Question;
  onAnswerSelect: (questionId: string, answerId: string) => void;
  selectedAnswerId?: string;
}

export function QuestionDisplay({ 
  question, 
  onAnswerSelect,
  selectedAnswerId 
}: QuestionDisplayProps) {
  // Shuffle answers on mount and when question changes
  const shuffledAnswers = useMemo(
    () => {
      const answers = [...question.answers];
      for (let i = answers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [answers[i], answers[j]] = [answers[j], answers[i]];
      }
      return answers;
    },
    [question.answers]
  );

  return (
    <Card>
      <CardContent>
        <div>
          <h3>{question.questionText_et}</h3>
          {question.questionDescription_et && (
            <p>{question.questionDescription_et}</p>
          )}
          <div>
            {shuffledAnswers.map((answer: QuestionAnswer) => (
              <label key={answer.id}>
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={answer.id}
                  checked={selectedAnswerId === answer.id}
                  onChange={() => onAnswerSelect(question.id, answer.id)}
                />
                <span>{answer.answerText_et}</span>
              </label>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 