'use server';

/**
 * This file contains all server-side API functions
 */

import { createAssessmentResponse } from './airtable';

export async function createAssessment(data: { initialGoal: string; companyType: string }) {
  try {
    const id = await createAssessmentResponse({
      initialGoal: data.initialGoal,
      companyType: data.companyType
    });
    return { id };
  } catch (error) {
    console.error('Error creating assessment:', error);
    throw new Error('Failed to create assessment');
  }
}

export async function saveResponses(assessmentId: string, responses: Array<{ questionId: string; answerId: string; }>) {
  try {
    // TODO: Implement direct Airtable update
    console.log(`Saving responses for assessment ${assessmentId}:`, responses);
    throw new Error('Not implemented');
  } catch (error) {
    console.error('Error saving responses:', error);
    throw new Error('Failed to save responses');
  }
}

export async function exportAssessment(assessmentId: string, data: {
  name: string;
  email: string;
  organisationName: string;
  organisationRegNumber: string;
  wantsContact: boolean;
}): Promise<Blob> {
  try {
    // TODO: Implement direct PDF generation
    console.log(`Generating PDF for assessment ${assessmentId} with data:`, data);
    // For now, return an empty PDF blob to fix the type error
    return new Blob([`Assessment ${assessmentId} for ${data.name}`], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}

export async function sendAssessmentEmail(assessmentId: string, data: {
  name: string;
  email: string;
  organisationName: string;
  organisationRegNumber: string;
  wantsContact: boolean;
}) {
  try {
    // TODO: Implement direct email sending
    console.log(`Sending email for assessment ${assessmentId} to ${data.email}`);
    throw new Error('Not implemented');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
} 