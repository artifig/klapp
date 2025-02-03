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
    const record = await airtableBase(TABLES.RESPONSES).create({
      responseId: `resp_${Date.now()}`,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      companyName: input.companyName,
      companyType: input.companyType,
      initialGoal: input.initialGoal,
      content: input.content,
      status: 'New',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    });

    return {
      id: record.id,
      responseId: record.get('responseId') as string,
      contactName: record.get('contactName') as string,
      contactEmail: record.get('contactEmail') as string,
      companyName: record.get('companyName') as string,
      companyType: record.get('companyType') as string,
      initialGoal: record.get('initialGoal') as string,
      status: record.get('status') as 'New' | 'In Progress' | 'Completed',
      content: record.get('content') as string,
      createdAt: record.get('createdAt') as string,
      updatedAt: record.get('updatedAt') as string,
      isActive: record.get('isActive') as boolean
    };
  } catch (error: unknown) {
    throw new AirtableError('Failed to create response', 'CREATE_RESPONSE_ERROR');
  }
}

export async function updateResponseStatus(
  responseId: string,
  status: 'In Progress' | 'Completed'
): Promise<void> {
  try {
    await airtableBase(TABLES.RESPONSES).update(responseId, {
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (error: unknown) {
    throw new AirtableError('Failed to update response status', 'UPDATE_RESPONSE_STATUS_ERROR');
  }
} 