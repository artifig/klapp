'use server';

import { airtableBase, TABLES } from './config';
import type { FieldSet } from 'airtable';

// Common result type for all mutations
export interface MutationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// Response status type
export type ResponseStatus = 'New' | 'In Progress' | 'Completed';

// Content types
export interface AssessmentContent {
  answers: Record<string, never>;
  version: string;
}

// Input types
export interface CreateResponseInput {
  initialGoal: string;
  responseStatus?: ResponseStatus; // Optional, defaults to 'New'
  isActive?: boolean; // Optional, defaults to true
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
  status: ResponseStatus;
  isActive: boolean;
}

const CURRENT_CONTENT_VERSION = '1.0';

export async function createResponse(input: CreateResponseInput): Promise<MutationResult<{ responseId: string }>> {
  try {
    const fullInput = {
      ...input,
      responseStatus: input.responseStatus ?? 'New',
      isActive: input.isActive ?? true,
      responseContent: JSON.stringify({
        answers: {},
        version: CURRENT_CONTENT_VERSION
      } satisfies AssessmentContent)
    };

    console.log('Creating Airtable record with input:', fullInput);

    const record = await airtableBase(TABLES.RESPONSES).create(fullInput as Partial<FieldSet>);

    console.log('Airtable record created:', record);

    if (!record || typeof record.get !== 'function') {
      return {
        success: false,
        error: 'Invalid response from Airtable: Record creation failed'
      };
    }

    const responseId = record.get('responseId');
    if (!responseId) {
      return {
        success: false,
        error: 'Invalid response from Airtable: Missing responseId'
      };
    }

    return {
      success: true,
      data: {
        responseId: responseId as string
      }
    };
  } catch (error: unknown) {
    console.error('Error creating response in Airtable:', error);
    return {
      success: false,
      error: error instanceof Error 
        ? `Failed to create response: ${error.message}`
        : 'Failed to create response: Unknown error'
    };
  }
}

export async function updateCompanyDetails(
  responseId: string,
  input: UpdateCompanyDetailsInput
): Promise<MutationResult> {
  try {
    if (!responseId) {
      return {
        success: false,
        error: 'Invalid responseId: Cannot update company details'
      };
    }

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
      error: error instanceof Error 
        ? `Failed to update company details: ${error.message}`
        : 'Failed to update company details: Unknown error'
    };
  }
}

const isValidStatusTransition = (currentStatus: ResponseStatus, newStatus: ResponseStatus): boolean => {
  const transitions: Record<ResponseStatus, ResponseStatus[]> = {
    'New': ['In Progress'],
    'In Progress': ['Completed'],
    'Completed': []
  };
  return transitions[currentStatus]?.includes(newStatus) ?? false;
};

export async function updateResponseStatus(
  responseId: string,
  newStatus: ResponseStatus
): Promise<MutationResult> {
  try {
    if (!responseId) {
      return {
        success: false,
        error: 'Invalid responseId: Cannot update status'
      };
    }

    // Get current status
    const record = await airtableBase(TABLES.RESPONSES).find(responseId);
    const currentStatus = record.get('responseStatus') as ResponseStatus;

    if (!isValidStatusTransition(currentStatus, newStatus)) {
      return {
        success: false,
        error: `Invalid status transition from ${currentStatus} to ${newStatus}`
      };
    }

    await airtableBase(TABLES.RESPONSES).update(responseId, {
      responseStatus: newStatus,
    } as Partial<FieldSet>);

    return { success: true };
  } catch (error: unknown) {
    console.error('Error updating response status:', error);
    return {
      success: false,
      error: error instanceof Error 
        ? `Failed to update response status: ${error.message}`
        : 'Failed to update response status: Unknown error'
    };
  }
} 