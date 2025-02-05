'use server';

import { airtableBase, TABLES } from './config';
import type { FieldSet } from 'airtable';

// Common result type for all mutations
export interface MutationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// Input types
export interface CreateResponseInput {
  initialGoal: string;
  responseContent: string;
  responseStatus: 'New' | 'In Progress' | 'Completed';
  isActive: boolean;
}

export interface UpdateCompanyDetailsInput {
  contactName: string;
  contactEmail: string;
  companyName: string;
  companyType: string;
}

// Response types
export interface AssessmentResponse {
  id: string;
  responseId: string;
  initialGoal: string;
  status: 'New' | 'In Progress' | 'Completed';
  isActive: boolean;
}

export interface InitialContent {
  answers: Record<string, never>;
  version: string;
}

export async function createResponse(input: CreateResponseInput): Promise<MutationResult<{ responseId: string }>> {
  try {
    console.log('Creating Airtable record with input:', input);

    const record = await airtableBase(TABLES.RESPONSES).create({
      ...input,
      responseContent: JSON.stringify({ 
        answers: {},
        version: '1.0'
      } satisfies InitialContent)
    } as Partial<FieldSet>);

    console.log('Airtable record created:', record);

    if (!record || typeof record.get !== 'function') {
      throw new Error('Invalid response from Airtable');
    }

    return {
      success: true,
      data: {
        responseId: record.get('responseId') as string
      }
    };
  } catch (error: unknown) {
    console.error('Error creating response in Airtable:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create response'
    };
  }
}

export async function updateCompanyDetails(
  responseId: string,
  input: UpdateCompanyDetailsInput
): Promise<MutationResult> {
  try {
    await airtableBase(TABLES.RESPONSES).update(responseId, {
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      companyName: input.companyName,
      MethodCompanyTypes: input.companyType,
      responseStatus: 'In Progress'
    } as Partial<FieldSet>);

    return { success: true };
  } catch (error: unknown) {
    console.error('Error updating company details:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update company details'
    };
  }
}

export async function updateResponseStatus(
  responseId: string,
  status: 'In Progress' | 'Completed'
): Promise<MutationResult> {
  try {
    await airtableBase(TABLES.RESPONSES).update(responseId, {
      responseStatus: status,
    } as Partial<FieldSet>);

    return { success: true };
  } catch (error: unknown) {
    console.error('Error updating response status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update response status'
    };
  }
} 