'use server';

import { getCompanyTypes, getCategories, getAnswers, getQuestions } from './airtable/queries';
import { updateCompanyDetails, updateResponseStatus } from './airtable/mutations';
import type { UpdateCompanyDetailsInput } from './airtable/mutations';

export async function fetchInitialData() {
  try {
    const [companyTypes, categories, answers] = await Promise.all([
      getCompanyTypes(),
      getCategories(),
      getAnswers()
    ]);
    return { companyTypes, categories, answers };
  } catch (error: unknown) {
    console.error('Error fetching initial data:', error);
    throw new Error('Failed to fetch initial data');
  }
}

export async function fetchAssessmentData(companyTypeId: string) {
  try {
    const [categories, questions, answers] = await Promise.all([
      getCategories(companyTypeId),
      getQuestions(),
      getAnswers()
    ]);
    return { categories, questions, answers };
  } catch (error: unknown) {
    console.error('Error fetching assessment data:', error);
    throw new Error('Failed to fetch assessment data');
  }
}

export async function updateCompanyInfo(responseId: string, input: UpdateCompanyDetailsInput) {
  try {
    await updateCompanyDetails(responseId, input);
    return { success: true };
  } catch (error) {
    console.error('Error updating company details:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to update company details' };
  }
}

export async function completeAssessment(responseId: string) {
  try {
    await updateResponseStatus(responseId, 'Completed');
    return { success: true };
  } catch (error) {
    console.error('Error completing assessment:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to complete assessment' };
  }
} 