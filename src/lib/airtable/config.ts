import Airtable from 'airtable';

if (!process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN) {
  throw new Error('AIRTABLE_PERSONAL_ACCESS_TOKEN is not set');
}

if (!process.env.AIRTABLE_BASE_ID) {
  throw new Error('AIRTABLE_BASE_ID is not set');
}

export const airtableBase = new Airtable({ 
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN,
  endpointUrl: 'https://api.airtable.com'
}).base(process.env.AIRTABLE_BASE_ID);

export const TABLES = {
  CATEGORIES: 'MethodCategories',
  QUESTIONS: 'MethodQuestions',
  ANSWERS: 'MethodAnswers',
  SOLUTION_LEVELS: 'MethodSolutionLevels',
  EXAMPLE_SOLUTIONS: 'MethodExampleSolutions',
  RECOMMENDATIONS: 'MethodRecommendations',
  COMPANY_TYPES: 'MethodCompanyTypes',
  RESPONSES: 'AssessmentResponses'
} as const;

export type TableNames = typeof TABLES[keyof typeof TABLES]; 