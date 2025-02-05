'use server';

import { getCompanyTypes, getCategories, getAnswers, getQuestions } from './airtable/queries';
import { createResponse, updateResponseStatus } from './airtable/mutations';
import type { CreateResponseInput } from './airtable/mutations';

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

export async function submitAssessment(input: CreateResponseInput) {
  try {
    const response = await createResponse(input);
    return response;
  } catch (error: unknown) {
    console.error('Error submitting assessment:', error);
    throw new Error('Failed to submit assessment');
  }
}

export async function updateAssessmentStatus(
  responseId: string,
  status: 'In Progress' | 'Completed'
) {
  try {
    await updateResponseStatus(responseId, status);
  } catch (error: unknown) {
    console.error('Error updating assessment status:', error);
    throw new Error('Failed to update assessment status');
  }
}

export async function createInitialResponse(goal: string) {
  try {
    const input: CreateResponseInput = {
      contactName: '', // Will be updated in setup
      contactEmail: '', // Will be updated in setup
      companyName: '', // Will be updated in setup
      companyType: '', // Will be updated in setup
      initialGoal: goal,
      content: JSON.stringify({ answers: {} }) // Initial empty answers
    };

    const response = await createResponse(input);
    return { success: true, responseId: response.responseId };
  } catch (error) {
    console.error('Error creating initial response:', error);
    return { success: false, error: 'Failed to create assessment response' };
  }
} 