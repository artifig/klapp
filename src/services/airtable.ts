import Airtable from 'airtable';

// Method Definition Interfaces
export interface MethodCategory {
  id?: string;
  name: string;
  description: string;
  companyType: 'Startup' | 'SME' | 'Enterprise';
  displayOrder: number;
  isActive: boolean;
  MethodQuestions?: string[]; // Linked records
  AssesmentScores?: string[]; // Linked records
}

export interface MethodQuestion {
  id?: string;
  categoryId: string; // Links to MethodCategories
  questionText: string;
  displayOrder: number;
  isActive: boolean;
  companyType?: 'Startup' | 'SME' | 'Enterprise';
  MethodAnswers?: string[]; // Linked records
  AssessmentResponses?: string[]; // Linked records
}

export interface MethodAnswer {
  id?: string;
  questionId: string; // Links to MethodQuestions
  answerText: string;
  score: number;
  level: 'Never' | 'Occasionally' | 'Often' | 'Always';
  AssessmentResponses?: string[]; // Linked records
  AssesmentScores?: string; // Single line text reference
}

// Assessment Data Interfaces
export interface AssessmentSetup {
  id?: string;
  companyName: string;
  contactName: string;
  email: string;
  companyType: 'Startup' | 'SME' | 'Enterprise';
  initialGoal: string;
  status: 'InProgress' | 'Completed';
  createdAt?: string;
  updatedAt?: string;
  AssessmentResponses?: string[]; // Linked records
  AssesmentScores?: string[]; // Linked records
}

export interface AssessmentResponse {
  id?: string;
  assessmentId: string; // Links to AssessmentSetups
  questionId: string; // Links to MethodQuestions
  answerId: string; // Links to MethodAnswers
  'score (from answerId)'?: number; // Lookup field
  'level (from answerId)'?: 'Never' | 'Occasionally' | 'Often' | 'Always'; // Lookup field
  score?: number;
  timestamp: string;
}

export interface AssessmentScore {
  id?: string;
  assessmentId: string; // Links to AssessmentSetups
  categoryId: string; // Links to MethodCategories
  score: number;
  level: 'Red' | 'Yellow' | 'Green';
  recommendations: string;
  calculatedAt: string;
}

// Table names constants
const TABLES = {
  METHOD_CATEGORIES: 'MethodCategories',
  METHOD_QUESTIONS: 'MethodQuestions',
  METHOD_ANSWERS: 'MethodAnswers',
  ASSESSMENT_SETUPS: 'AssessmentSetups',
  ASSESSMENT_RESPONSES: 'AssessmentResponses',
  ASSESSMENT_SCORES: 'AssesmentScores'
} as const;

// Configure Airtable globally
Airtable.configure({
  apiKey: process.env.NEXT_PUBLIC_AIRTABLE_PERSONAL_ACCESS_TOKEN,
  endpointUrl: 'https://api.airtable.com',
  requestTimeout: 300000, // default is 5 minutes
});

const base = Airtable.base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '');

// Service class for Airtable operations
export class AirtableService {
  // Method Categories
  static async getMethodCategories(companyType?: 'Startup' | 'SME' | 'Enterprise'): Promise<MethodCategory[]> {
    try {
      const filterFormula = companyType 
        ? `AND({isActive}, {companyType} = '${companyType}')`
        : '{isActive}';
      
      const query = base(TABLES.METHOD_CATEGORIES).select({
        filterByFormula: filterFormula,
        sort: [{ field: 'displayOrder', direction: 'asc' }]
      });

      const records = await query.all();
      return records.map(record => ({
        id: record.id,
        name: record.fields.name as string,
        description: record.fields.description as string,
        companyType: record.fields.companyType as 'Startup' | 'SME' | 'Enterprise',
        displayOrder: record.fields.displayOrder as number,
        isActive: record.fields.isActive as boolean,
        MethodQuestions: record.fields.MethodQuestions as string[],
        AssesmentScores: record.fields.AssesmentScores as string[]
      }));
    } catch (error) {
      console.error('Error fetching method categories:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch method categories');
    }
  }

  // Method Questions
  static async getQuestionsForCategory(categoryId: string): Promise<MethodQuestion[]> {
    try {
      const query = base(TABLES.METHOD_QUESTIONS).select({
        filterByFormula: `AND({categoryId} = '${categoryId}', {isActive})`,
        sort: [{ field: 'displayOrder', direction: 'asc' }]
      });

      const records = await query.all();
      return records.map(record => ({
        id: record.id,
        categoryId: record.fields.categoryId as string,
        questionText: record.fields.questionText as string,
        displayOrder: record.fields.displayOrder as number,
        isActive: record.fields.isActive as boolean,
        companyType: record.fields.companyType as 'Startup' | 'SME' | 'Enterprise' | undefined,
        MethodAnswers: record.fields.MethodAnswers as string[],
        AssessmentResponses: record.fields.AssessmentResponses as string[]
      }));
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch questions');
    }
  }

  // Get answers for a question
  static async getAnswersForQuestion(questionId: string): Promise<MethodAnswer[]> {
    try {
      const query = base(TABLES.METHOD_ANSWERS).select({
        filterByFormula: `{questionId} = '${questionId}'`
      });

      const records = await query.all();
      return records.map(record => ({
        id: record.id,
        questionId: record.fields.questionId as string,
        answerText: record.fields.answerText as string,
        score: record.fields.score as number,
        level: record.fields.level as 'Never' | 'Occasionally' | 'Often' | 'Always',
        AssessmentResponses: record.fields.AssessmentResponses as string[],
        AssesmentScores: record.fields.AssesmentScores as string
      }));
    } catch (error) {
      console.error('Error fetching answers:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch answers');
    }
  }

  // Assessment Setup
  static async createAssessment(setup: Omit<AssessmentSetup, 'id' | 'createdAt' | 'updatedAt' | 'AssessmentResponses' | 'AssesmentScores'>): Promise<AssessmentSetup> {
    try {
      const records = await base(TABLES.ASSESSMENT_SETUPS).create([
        {
          fields: {
            companyName: setup.companyName,
            contactName: setup.contactName,
            email: setup.email,
            companyType: setup.companyType,
            initialGoal: setup.initialGoal,
            status: 'InProgress'
          }
        }
      ]);

      if (!records || records.length === 0) {
        throw new Error('No record was created');
      }

      const record = records[0];
      return {
        id: record.id,
        companyName: record.fields.companyName as string,
        contactName: record.fields.contactName as string,
        email: record.fields.email as string,
        companyType: record.fields.companyType as 'Startup' | 'SME' | 'Enterprise',
        initialGoal: record.fields.initialGoal as string,
        status: record.fields.status as 'InProgress' | 'Completed',
        createdAt: record.fields.createdAt as string,
        updatedAt: record.fields.updatedAt as string,
        AssessmentResponses: record.fields.AssessmentResponses as string[],
        AssesmentScores: record.fields.AssesmentScores as string[]
      };
    } catch (error) {
      console.error('Error creating assessment:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create assessment');
    }
  }

  // Assessment Responses
  static async saveResponse(response: Omit<AssessmentResponse, 'id' | 'score (from answerId)' | 'level (from answerId)'>): Promise<AssessmentResponse> {
    try {
      const records = await base(TABLES.ASSESSMENT_RESPONSES).create([
        {
          fields: {
            assessmentId: response.assessmentId,
            questionId: response.questionId,
            answerId: response.answerId,
            score: response.score,
            timestamp: response.timestamp || new Date().toISOString()
          }
        }
      ]);

      if (!records || records.length === 0) {
        throw new Error('No record was created');
      }

      const record = records[0];
      return {
        id: record.id,
        assessmentId: record.fields.assessmentId as string,
        questionId: record.fields.questionId as string,
        answerId: record.fields.answerId as string,
        'score (from answerId)': record.fields['score (from answerId)'] as number,
        'level (from answerId)': record.fields['level (from answerId)'] as 'Never' | 'Occasionally' | 'Often' | 'Always',
        score: record.fields.score as number,
        timestamp: record.fields.timestamp as string
      };
    } catch (error) {
      console.error('Error saving response:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to save response');
    }
  }

  // Assessment Scores
  static async saveScore(score: Omit<AssessmentScore, 'id'>): Promise<AssessmentScore> {
    try {
      const records = await base(TABLES.ASSESSMENT_SCORES).create([
        {
          fields: {
            assessmentId: score.assessmentId,
            categoryId: score.categoryId,
            score: score.score,
            level: score.level,
            recommendations: score.recommendations,
            calculatedAt: score.calculatedAt || new Date().toISOString()
          }
        }
      ]);

      if (!records || records.length === 0) {
        throw new Error('No record was created');
      }

      const record = records[0];
      return {
        id: record.id,
        assessmentId: record.fields.assessmentId as string,
        categoryId: record.fields.categoryId as string,
        score: record.fields.score as number,
        level: record.fields.level as 'Red' | 'Yellow' | 'Green',
        recommendations: record.fields.recommendations as string,
        calculatedAt: record.fields.calculatedAt as string
      };
    } catch (error) {
      console.error('Error saving score:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to save score');
    }
  }
} 
