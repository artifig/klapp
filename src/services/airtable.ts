import Airtable from 'airtable';

// Enums for standardization
export enum CompanyType {
  Startup = 'Startup',
  SME = 'SME',
  Enterprise = 'Enterprise'
}

export enum ResponseStatus {
  InProgress = 'InProgress',
  Completed = 'Completed'
}

export enum AnswerLevel {
  Never = 'Never',
  Occasionally = 'Occasionally',
  Often = 'Often',
  Always = 'Always'
}

export enum CategoryLevel {
  Red = 'Red',
  Yellow = 'Yellow',
  Green = 'Green'
}

// Add after the enums and before the constants
export const SCORE_VALUES = [0, 33, 67, 100] as const;
export type StandardScore = typeof SCORE_VALUES[number];

export const ANSWER_SCORES: Record<AnswerLevel, StandardScore> = {
  [AnswerLevel.Never]: 0,
  [AnswerLevel.Occasionally]: 33,
  [AnswerLevel.Often]: 67,
  [AnswerLevel.Always]: 100
};

// Constants
export const LEVEL_THRESHOLDS = {
  [CategoryLevel.Red]: { min: 0, max: 39 },
  [CategoryLevel.Yellow]: { min: 40, max: 69 },
  [CategoryLevel.Green]: { min: 70, max: 100 }
} as const;

// Response content types
export interface CategoryMetadata {
  isApplicable: boolean;
  averageScore: number;
  level: CategoryLevel;
  lastUpdated: string;
}

export interface QuestionAnswer {
  answerId: string;
  score: StandardScore;
}

export interface CategoryResponse {
  metadata: CategoryMetadata;
  answers: {
    [questionId: string]: QuestionAnswer;
  };
}

export interface ResponseContent {
  [categoryId: string]: CategoryResponse;
}

// Method Definition Interfaces
export interface MethodCategory {
  id?: string;
  categoryId: string;
  categoryText: string;
  categoryDescription: string;
  companyType: CompanyType[];
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
  answerText: AnswerLevel;
  answerDescription: string;
  answerScore: StandardScore;
  questionId?: string[]; // Linked records to MethodQuestions
}

// Assessment Response Interface
export interface AssessmentResponse {
  id?: string;
  responseId: number;
  companyName: string;
  contactName: string;
  contactEmail: string;
  companyType: CompanyType;
  initialGoal: string;
  responseStatus: ResponseStatus;
  responseContent: string; // JSON string of ResponseContent
  createdAt?: string;
  updatedAt?: string;
}

// Validation Errors
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
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

// Utility functions
function calculateCategoryLevel(score: number): CategoryLevel {
  if (score <= LEVEL_THRESHOLDS[CategoryLevel.Red].max) return CategoryLevel.Red;
  if (score <= LEVEL_THRESHOLDS[CategoryLevel.Yellow].max) return CategoryLevel.Yellow;
  return CategoryLevel.Green;
}

function calculateAverageScore(answers: { [questionId: string]: QuestionAnswer }): StandardScore {
  if (Object.keys(answers).length === 0) return 0;
  
  // Calculate sum using explicit number type
  let sum = 0;
  for (const answer of Object.values(answers)) {
    sum += answer.score;
  }
  
  const average = Math.round(sum / Object.keys(answers).length);
  
  // Map to nearest standard score
  if (average <= 16) return 0;
  if (average <= 50) return 33;
  if (average <= 83) return 67;
  return 100;
}

// Service class for Airtable operations
export class AirtableService {
  // Method Categories
  static async getMethodCategories(companyType?: CompanyType): Promise<MethodCategory[]> {
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
        companyType: record.fields.companyType as CompanyType[],
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
        answerText: record.fields.answerText as AnswerLevel,
        answerDescription: record.fields.answerDescription as string,
        answerScore: record.fields.answerScore as StandardScore,
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
        companyType: record.fields.companyType as CompanyType,
        initialGoal: record.fields.initialGoal as string,
        responseStatus: record.fields.responseStatus as ResponseStatus,
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
        companyType: record.fields.companyType as CompanyType,
        initialGoal: record.fields.initialGoal as string,
        responseStatus: record.fields.responseStatus as ResponseStatus,
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
        companyType: record.fields.companyType as CompanyType,
        initialGoal: record.fields.initialGoal as string,
        responseStatus: record.fields.responseStatus as ResponseStatus,
        responseContent: record.fields.responseContent as string,
        createdAt: record.fields.createdAt as string,
        updatedAt: record.fields.updatedAt as string
      };
    } catch (error) {
      console.error('Error fetching assessment response:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch assessment response');
    }
  }

  // Validation methods
  static async validateAssessmentResponse(response: AssessmentResponse): Promise<void> {
    const content: ResponseContent = JSON.parse(response.responseContent);
    
    // Get all categories for company type
    const categories = await this.getMethodCategories(response.companyType);
    const categoryMap = new Map(categories.map(c => [c.categoryId, c]));

    // Validate each category
    for (const [categoryId, categoryResponse] of Object.entries(content)) {
      const category = categoryMap.get(categoryId);
      if (!category) {
        throw new ValidationError(`Invalid category ID: ${categoryId}`);
      }

      // Validate category applicability
      if (!category.companyType.includes(response.companyType)) {
        throw new ValidationError(`Category ${categoryId} not applicable for ${response.companyType}`);
      }

      // Get questions for category
      const questions = await this.getQuestionsForCategory(categoryId);
      if (questions.length !== 5) {
        throw new ValidationError(`Category ${categoryId} must have exactly 5 questions`);
      }

      // Validate answers
      for (const [questionId, answer] of Object.entries(categoryResponse.answers)) {
        const question = questions.find(q => q.questionId === questionId);
        if (!question) {
          throw new ValidationError(`Invalid question ID: ${questionId}`);
        }

        // Validate answer exists for question
        const answers = await this.getAnswersForQuestion(questionId);
        if (answers.length !== 4) {
          throw new ValidationError(`Question ${questionId} must have exactly 4 answers`);
        }

        const selectedAnswer = answers.find(a => a.answerId === answer.answerId);
        if (!selectedAnswer) {
          throw new ValidationError(`Invalid answer ID: ${answer.answerId}`);
        }

        // Validate score matches standard scoring
        if (!SCORE_VALUES.includes(answer.score)) {
          throw new ValidationError(`Invalid score for answer: ${answer.score}`);
        }
      }
    }
  }

  // Response content management methods
  static async updateResponseContent(
    id: string,
    categoryId: string,
    answers: { [questionId: string]: QuestionAnswer }
  ): Promise<AssessmentResponse> {
    const response = await this.getAssessmentResponse(id);
    const content: ResponseContent = JSON.parse(response.responseContent || '{}');

    // Calculate category metadata
    const averageScore = calculateAverageScore(answers);
    const level = calculateCategoryLevel(averageScore);

    // Update content
    content[categoryId] = {
      metadata: {
        isApplicable: true,
        averageScore,
        level,
        lastUpdated: new Date().toISOString()
      },
      answers
    };

    // Update response
    return this.updateAssessmentResponse(id, {
      responseContent: JSON.stringify(content)
    });
  }

  // Get assessment summary
  static async getAssessmentSummary(id: string): Promise<{
    overallScore: number;
    categoryScores: { [categoryId: string]: CategoryResponse['metadata'] }
  }> {
    const response = await this.getAssessmentResponse(id);
    const content: ResponseContent = JSON.parse(response.responseContent || '{}');

    const categoryScores = Object.entries(content).reduce((acc, [categoryId, category]) => {
      acc[categoryId] = category.metadata;
      return acc;
    }, {} as { [categoryId: string]: CategoryResponse['metadata'] });

    const overallScore = Math.round(
      Object.values(categoryScores)
        .filter(meta => meta.isApplicable)
        .reduce((sum, meta) => sum + meta.averageScore, 0) /
      Object.values(categoryScores).filter(meta => meta.isApplicable).length
    );

    return { overallScore, categoryScores };
  }
} 
