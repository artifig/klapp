'use server';

import { airtableBase, TABLES } from './config';
import { AirtableError } from './types';
import type { FieldSet } from 'airtable';

// Only the fields we need for initial creation
export interface CreateResponseInput {
  initialGoal: string;
  responseContent: string;
  responseStatus: 'New' | 'In Progress' | 'Completed';
  isActive: boolean;
}

// Fields for updating company details
export interface UpdateCompanyDetailsInput {
  contactName: string;
  contactEmail: string;
  companyName: string;
  companyType: string;
}

// Response type with only the fields we need
export interface AssessmentResponse {
  id: string;
  responseId: string;
  initialGoal: string;
  status: 'New' | 'In Progress' | 'Completed';
  isActive: boolean;
}

export async function createResponse(input: CreateResponseInput): Promise<{ success: boolean; responseId?: string; error?: string }> {
  try {
    console.log('Creating Airtable record with input:', input);

    const record = await airtableBase(TABLES.RESPONSES).create({
      ...input
    } as Partial<FieldSet>);

    console.log('Airtable record created:', record);

    if (!record || typeof record.get !== 'function') {
      throw new Error('Invalid response from Airtable');
    }

    return {
      success: true,
      responseId: record.get('responseId') as string
    };
  } catch (error: unknown) {
    console.error('Error creating response in Airtable:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to create response' };
  }
}

export async function updateCompanyDetails(
  responseId: string,
  input: UpdateCompanyDetailsInput
): Promise<void> {
  try {
    await airtableBase(TABLES.RESPONSES).update(responseId, {
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      companyName: input.companyName,
      MethodCompanyTypes: input.companyType,
      responseStatus: 'In Progress'
    } as Partial<FieldSet>);
  } catch (error: unknown) {
    console.error('Error updating company details:', error);
    throw new AirtableError('Failed to update company details', 'UPDATE_COMPANY_DETAILS_ERROR');
  }
}

export async function updateResponseStatus(
  responseId: string,
  status: 'In Progress' | 'Completed'
): Promise<void> {
  try {
    await airtableBase(TABLES.RESPONSES).update(responseId, {
      responseStatus: status,
    } as Partial<FieldSet>);
  } catch (error: unknown) {
    console.error('Error updating response status:', error);
    throw new AirtableError('Failed to update response status', 'UPDATE_RESPONSE_STATUS_ERROR');
  }
} 