import Airtable from 'airtable';

export const airtableBase = new Airtable({ 
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN 
}).base(process.env.AIRTABLE_BASE_ID!);

export const TABLES = {
  CATEGORIES: 'MethodCategories',
  QUESTIONS: 'MethodQuestions',
  ANSWERS: 'MethodAnswers',
  RESPONSES: 'AssessmentResponses',
  COMPANY_TYPES: 'MethodCompanyTypes'
} as const; 