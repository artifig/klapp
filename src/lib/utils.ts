import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CategoryScore } from "./types";
import type { SolutionProvider, MethodCategory } from "./airtable";
import { getAssessmentResponse, getCategories, getQuestions, getAnswers } from "./airtable";

/**
 * Combines multiple class values and merges Tailwind classes efficiently.
 * Uses clsx for conditional classes and tailwind-merge to handle conflicting classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getTopProviders(categoryScores: CategoryScore[], limit: number = 3): SolutionProvider[] {
  const providerCounts = new Map<string, { count: number; provider: SolutionProvider }>();
  
  categoryScores.forEach(category => {
    // Count providers from recommendations
    category.recommendations.forEach(rec => {
      rec.providers.forEach(provider => {
        const existing = providerCounts.get(provider.id);
        if (existing) {
          existing.count += 1;
        } else {
          providerCounts.set(provider.id, { count: 1, provider });
        }
      });
    });
    
    // Count providers from solutions
    category.solutions.forEach(solution => {
      solution.providers.forEach(provider => {
        const existing = providerCounts.get(provider.id);
        if (existing) {
          existing.count += 1;
        } else {
          providerCounts.set(provider.id, { count: 1, provider });
        }
      });
    });
  });

  return Array.from(providerCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(item => item.provider);
}

export function calculateMaturityLevel(score: number): {
  level: string;
  color: 'red' | 'yellow' | 'green';
} {
  if (score < 40) {
    return { level: 'Punane', color: 'red' };
  } else if (score < 70) {
    return { level: 'Kollane', color: 'yellow' };
  } else {
    return { level: 'Roheline', color: 'green' };
  }
}

export function calculateAverageScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export interface QuestionAnswer {
  id: string;
  answerText_et: string;
  answerScore: number;
  MethodQuestions: string[];
}

export interface Question {
  id: string;
  questionText_et: string;
  questionDescription_et?: string;
  MethodCategories: string[];
  isActive: boolean;
  answers: QuestionAnswer[];
  selectedAnswer?: string;
}

export interface ProcessedCategory extends MethodCategory {
  questions: Question[];
}

export interface AssessmentResponse {
  questionId: string;
  answerId: string;
}

export interface Assessment {
  id: string;
  isActive: boolean;
  initialGoal: string;
  responseContent: string;
}

export async function fetchQuestionsData(assessmentId: string): Promise<{
  assessment: Assessment;
  questionsByCategory: ProcessedCategory[];
  responses: AssessmentResponse[];
}> {
  // Fetch the assessment response
  const assessment = await getAssessmentResponse(assessmentId);
  if (!assessment || !assessment.isActive) {
    throw new Error('Assessment not found or inactive');
  }

  // Parse the response content
  const content = JSON.parse(assessment.responseContent);
  const { companyType, responses } = content;
  
  // Fetch categories for the company type
  const categories = await getCategories(companyType);
  if (!categories.length) {
    throw new Error('No categories found for company type');
  }
  
  // Fetch questions for all categories
  const questions = await getQuestions(categories.map(c => c.id));
  
  // Fetch answers for all questions
  const answers = await getAnswers(questions.map(q => q.id));

  // Group questions by category
  const questionsByCategory = categories.map(category => ({
    ...category,
    questions: questions
      .filter(q => q.MethodCategories.includes(category.id))
      .map(question => ({
        ...question,
        answers: answers.filter(a => a.MethodQuestions.includes(question.id)),
        selectedAnswer: responses.find((r: AssessmentResponse) => r.questionId === question.id)?.answerId
      }))
  }));

  if (!questionsByCategory.some(cat => cat.questions.length > 0)) {
    throw new Error('No questions found for categories');
  }

  return { assessment, questionsByCategory, responses };
}

/**
 * Formats a number as currency
 */
export function formatCurrency(value: number, currency = 'EUR', locale = 'et-EE') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Debounce function to limit how often a function can be called
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function(...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Truncates a string if it's longer than the specified length
 */
export function truncateString(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Parse URL search params into an object
 */
export function parseSearchParams(search: string): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(search));
}

/**
 * Gets a nested value from an object using a path string
 * Example: getNestedValue(obj, 'user.profile.name')
 */
export function getNestedValue<T>(obj: any, path: string, defaultValue?: T): T | undefined {
  try {
    return path.split('.').reduce((a, b) => a[b], obj) as T;
  } catch (e) {
    return defaultValue;
  }
}