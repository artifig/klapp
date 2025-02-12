import type { 
  MethodCategory, 
  MethodRecommendation, 
  MethodExampleSolution, 
  SolutionProvider 
} from "./airtable";

export interface CategoryScore extends MethodCategory {
  score: number;
  questionCount: number;
  answeredCount: number;
  maturityLevel: string;
  maturityColor: 'red' | 'yellow' | 'green';
  recommendations: (MethodRecommendation & { providers: SolutionProvider[] })[];
  solutions: (MethodExampleSolution & { providers: SolutionProvider[] })[];
} 