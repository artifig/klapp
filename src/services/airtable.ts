import Airtable from 'airtable';

// Method Definition Interfaces
export interface MethodCategory {
  id?: string;
  categoryId: string;
  categoryText: string;
  categoryDescription: string;
  companyType: ('Startup' | 'SME' | 'Enterprise')[];
  isActive: boolean;
  questionId?: string[]; // Linked records to MethodQuestions
}

export interface MethodQuestion {
  id?: string;
  questionId: string;
  questionText: string;
  isActive: boolean;
  answerId?: string[]; // Linked records to MethodAnswers
  categoryId?: string[]; // Linked records to MethodCategories
}

export interface MethodAnswer {
  id?: string;
  answerId: string;
  answerText: string;
  answerDescription: string;
  answerScore: number;
  questionId?: string[]; // Linked records to MethodQuestions
}

// Assessment Response Interface
export interface AssessmentResponse {
  id?: string;
  responseId: number; // Auto-incrementing number
  companyName: string;
  contactName: string;
  contactEmail: string;
  companyType: 'Startup' | 'SME' | 'Enterprise';
  initialGoal: string;
  responseStatus: 'InProgress' | 'Completed';
  responseContent: string;
  createdAt?: string;
  updatedAt?: string;
}

// Table names constants
const TABLES = {
  METHOD_CATEGORIES: 'MethodCategories',
  METHOD_QUESTIONS: 'MethodQuestions',
  METHOD_ANSWERS: 'MethodAnswers',
  ASSESSMENT_RESPONSES: 'AssessmentResponses'
} as const;

// Configure Airtable
Airtable.configure({
  apiKey: process.env.NEXT_PUBLIC_AIRTABLE_PERSONAL_ACCESS_TOKEN,
  endpointUrl: 'https://api.airtable.com',
  requestTimeout: 300000, // 5 minutes
});

const base = Airtable.base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '');

// Service class for Airtable operations
export class AirtableService {
  // Method Categories
  static async getMethodCategories(companyType?: 'Startup' | 'SME' | 'Enterprise'): Promise<MethodCategory[]> {
    try {
      const filterFormula = companyType 
        ? `AND({isActive}, FIND("${companyType}", ARRAYJOIN({companyType}, ",")))`
        : '{isActive}';
      
      const query = base(TABLES.METHOD_CATEGORIES).select({
        filterByFormula: filterFormula
      });

      const records = await query.all();
      return records.map(record => ({
        id: record.id,
        categoryId: record.fields.categoryId as string,
        categoryText: record.fields.categoryText as string,
        categoryDescription: record.fields.categoryDescription as string,
        companyType: record.fields.companyType as ('Startup' | 'SME' | 'Enterprise')[],
        isActive: record.fields.isActive as boolean,
        questionId: record.fields.questionId as string[]
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
        filterByFormula: `AND({isActive}, FIND("${categoryId}", ARRAYJOIN({categoryId}, ",")))`
      });

      const records = await query.all();
      return records.map(record => ({
        id: record.id,
        questionId: record.fields.questionId as string,
        questionText: record.fields.questionText as string,
        isActive: record.fields.isActive as boolean,
        answerId: record.fields.answerId as string[],
        categoryId: record.fields.categoryId as string[]
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
        filterByFormula: `FIND("${questionId}", ARRAYJOIN({questionId}, ","))`
      });

      const records = await query.all();
      return records.map(record => ({
        id: record.id,
        answerId: record.fields.answerId as string,
        answerText: record.fields.answerText as string,
        answerDescription: record.fields.answerDescription as string,
        answerScore: record.fields.answerScore as number,
        questionId: record.fields.questionId as string[]
      }));
    } catch (error) {
      console.error('Error fetching answers:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch answers');
    }
  }

  // Create Assessment Response
  static async createAssessmentResponse(response: Omit<AssessmentResponse, 'id' | 'responseId' | 'createdAt' | 'updatedAt'>): Promise<AssessmentResponse> {
    try {
      const records = await base(TABLES.ASSESSMENT_RESPONSES).create([
        {
          fields: {
            companyName: response.companyName,
            contactName: response.contactName,
            contactEmail: response.contactEmail,
            companyType: response.companyType,
            initialGoal: response.initialGoal,
            responseStatus: 'InProgress',
            responseContent: response.responseContent
          }
        }
      ]);

      if (!records || records.length === 0) {
        throw new Error('No record was created');
      }

      const record = records[0];
      return {
        id: record.id,
        responseId: record.fields.responseId as number,
        companyName: record.fields.companyName as string,
        contactName: record.fields.contactName as string,
        contactEmail: record.fields.contactEmail as string,
        companyType: record.fields.companyType as 'Startup' | 'SME' | 'Enterprise',
        initialGoal: record.fields.initialGoal as string,
        responseStatus: record.fields.responseStatus as 'InProgress' | 'Completed',
        responseContent: record.fields.responseContent as string,
        createdAt: record.fields.createdAt as string,
        updatedAt: record.fields.updatedAt as string
      };
    } catch (error) {
      console.error('Error creating assessment response:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create assessment response');
    }
  }

  // Update Assessment Response
  static async updateAssessmentResponse(id: string, update: Partial<AssessmentResponse>): Promise<AssessmentResponse> {
    try {
      const records = await base(TABLES.ASSESSMENT_RESPONSES).update([
        {
          id,
          fields: {
            ...(update.companyName && { companyName: update.companyName }),
            ...(update.contactName && { contactName: update.contactName }),
            ...(update.contactEmail && { contactEmail: update.contactEmail }),
            ...(update.companyType && { companyType: update.companyType }),
            ...(update.initialGoal && { initialGoal: update.initialGoal }),
            ...(update.responseStatus && { responseStatus: update.responseStatus }),
            ...(update.responseContent && { responseContent: update.responseContent })
          }
        }
      ]);

      if (!records || records.length === 0) {
        throw new Error('No record was updated');
      }

      const record = records[0];
      return {
        id: record.id,
        responseId: record.fields.responseId as number,
        companyName: record.fields.companyName as string,
        contactName: record.fields.contactName as string,
        contactEmail: record.fields.contactEmail as string,
        companyType: record.fields.companyType as 'Startup' | 'SME' | 'Enterprise',
        initialGoal: record.fields.initialGoal as string,
        responseStatus: record.fields.responseStatus as 'InProgress' | 'Completed',
        responseContent: record.fields.responseContent as string,
        createdAt: record.fields.createdAt as string,
        updatedAt: record.fields.updatedAt as string
      };
    } catch (error) {
      console.error('Error updating assessment response:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update assessment response');
    }
  }

  // Get Assessment Response by ID
  static async getAssessmentResponse(id: string): Promise<AssessmentResponse> {
    try {
      const record = await base(TABLES.ASSESSMENT_RESPONSES).find(id);
      
      return {
        id: record.id,
        responseId: record.fields.responseId as number,
        companyName: record.fields.companyName as string,
        contactName: record.fields.contactName as string,
        contactEmail: record.fields.contactEmail as string,
        companyType: record.fields.companyType as 'Startup' | 'SME' | 'Enterprise',
        initialGoal: record.fields.initialGoal as string,
        responseStatus: record.fields.responseStatus as 'InProgress' | 'Completed',
        responseContent: record.fields.responseContent as string,
        createdAt: record.fields.createdAt as string,
        updatedAt: record.fields.updatedAt as string
      };
    } catch (error) {
      console.error('Error fetching assessment response:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch assessment response');
    }
  }
} 
