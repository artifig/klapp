import Airtable from 'airtable';

// Types for your records
export interface AssessmentRecord {
  id?: string;
  userId: string;
  answers: Record<string, any>;
  score?: number;
  createdAt: string;
}

// Configure Airtable globally
Airtable.configure({
  apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY,
  endpointUrl: 'https://api.airtable.com',
  requestTimeout: 300000, // default is 5 minutes
});

const base = Airtable.base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '');
const assessmentsTable = 'Assessments';

// Service class for Airtable operations
export class AirtableService {
  // Create a new assessment record
  static async createAssessment(assessment: Omit<AssessmentRecord, 'id' | 'createdAt'>): Promise<AssessmentRecord> {
    try {
      const records = await base(assessmentsTable).create([
        {
          fields: {
            userId: assessment.userId,
            answers: JSON.stringify(assessment.answers),
            score: assessment.score,
            createdAt: new Date().toISOString(),
          },
        },
      ]);

      if (!records || records.length === 0) {
        throw new Error('No record was created');
      }

      const record = records[0];
      return {
        id: record.id,
        userId: record.fields.userId as string,
        answers: JSON.parse(record.fields.answers as string),
        score: typeof record.fields.score === 'string' ? parseInt(record.fields.score, 10) : (record.fields.score as number),
        createdAt: record.fields.createdAt as string,
      };
    } catch (error) {
      console.error('Error creating assessment:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create assessment');
    }
  }

  // Get assessment by ID
  static async getAssessment(id: string): Promise<AssessmentRecord | null> {
    try {
      const record = await base(assessmentsTable).find(id);
      
      if (!record || !record.fields) {
        return null;
      }

      return {
        id: record.id,
        userId: record.fields.userId as string,
        answers: JSON.parse(record.fields.answers as string),
        score: typeof record.fields.score === 'string' ? parseInt(record.fields.score, 10) : (record.fields.score as number),
        createdAt: record.fields.createdAt as string,
      };
    } catch (error) {
      console.error('Error fetching assessment:', error);
      return null;
    }
  }

  // Get all assessments for a user with pagination support
  static async getUserAssessments(
    userId: string,
    options: { pageSize?: number; offset?: number } = {}
  ): Promise<{ records: AssessmentRecord[]; offset?: number }> {
    try {
      const query = base(assessmentsTable).select({
        filterByFormula: `{userId} = '${userId}'`,
        sort: [{ field: 'createdAt', direction: 'desc' }],
        pageSize: options.pageSize || 100,
        offset: options.offset,
      });

      const records = await query.all();
      const queryInfo = query as unknown as { _offset?: number };
      
      return {
        records: records.map(record => ({
          id: record.id,
          userId: record.fields.userId as string,
          answers: JSON.parse(record.fields.answers as string),
          score: typeof record.fields.score === 'string' ? parseInt(record.fields.score, 10) : (record.fields.score as number),
          createdAt: record.fields.createdAt as string,
        })),
        offset: queryInfo._offset
      };
    } catch (error) {
      console.error('Error fetching user assessments:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch user assessments');
    }
  }

  // Update an assessment
  static async updateAssessment(id: string, updates: Partial<AssessmentRecord>): Promise<AssessmentRecord> {
    try {
      const records = await base(assessmentsTable).update([
        {
          id,
          fields: {
            ...(updates.userId && { userId: updates.userId }),
            ...(updates.answers && { answers: JSON.stringify(updates.answers) }),
            ...(updates.score && { score: updates.score }),
          },
        },
      ]);

      if (!records || records.length === 0) {
        throw new Error('No record was updated');
      }

      const record = records[0];
      return {
        id: record.id,
        userId: record.fields.userId as string,
        answers: JSON.parse(record.fields.answers as string),
        score: typeof record.fields.score === 'string' ? parseInt(record.fields.score, 10) : (record.fields.score as number),
        createdAt: record.fields.createdAt as string,
      };
    } catch (error) {
      console.error('Error updating assessment:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update assessment');
    }
  }

  // Delete an assessment
  static async deleteAssessment(id: string): Promise<boolean> {
    try {
      const records = await base(assessmentsTable).destroy([id]);
      return records && records.length > 0;
    } catch (error) {
      console.error('Error deleting assessment:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete assessment');
    }
  }
} 
