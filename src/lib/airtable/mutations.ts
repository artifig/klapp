import { airtableBase, TABLES } from './config';
import { AirtableError } from './types';
import type { AssessmentResponse } from './types';

export interface CreateResponseInput {
  contactName: string;
  contactEmail: string;
  companyName: string;
  companyType: string;
  initialGoal: string;
  content: string;
}

export async function createResponse(input: CreateResponseInput): Promise<AssessmentResponse> {
  try {
    // For initial creation, we only send the goal and content
    const record = await airtableBase(TABLES.RESPONSES).create({
      initialGoal: input.initialGoal,
      responseContent: input.content,
      responseStatus: 'New',
      isActive: true
    });

    return {
      id: record.id,
      responseId: record.get('responseId') as string,
      contactName: record.get('contactName') as string,
      contactEmail: record.get('contactEmail') as string,
      companyName: record.get('companyName') as string,
      companyType: record.get('MethodCompanyTypes') as string,
      initialGoal: record.get('initialGoal') as string,
      status: record.get('responseStatus') as 'New' | 'In Progress' | 'Completed',
      content: record.get('responseContent') as string,
      createdAt: record.get('Created time') as string,
      updatedAt: record.get('Last modified time') as string,
      isActive: record.get('isActive') as boolean
    };
  } catch (error: unknown) {
    console.error('Error creating response:', error);
    throw new AirtableError('Failed to create response', 'CREATE_RESPONSE_ERROR');
  }
}

export async function updateResponseStatus(
  responseId: string,
  status: 'In Progress' | 'Completed'
): Promise<void> {
  try {
    await airtableBase(TABLES.RESPONSES).update(responseId, {
      responseStatus: status,
      // Last modified time is updated automatically by Airtable
    });
  } catch (error: unknown) {
    console.error('Error updating response status:', error);
    throw new AirtableError('Failed to update response status', 'UPDATE_RESPONSE_STATUS_ERROR');
  }
} 