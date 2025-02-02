'use server';

import { getAirtableCompanyTypes, getAirtableCategories, getAirtableAnswers } from './airtable';

export async function fetchCompanyTypes() {
  try {
    const companyTypes = await getAirtableCompanyTypes();
    return { companyTypes };
  } catch (error) {
    console.error('Error fetching company types:', error);
    throw new Error('Failed to fetch company types');
  }
}

export async function fetchAssessmentData() {
  try {
    const [categories, answers] = await Promise.all([
      getAirtableCategories(),
      getAirtableAnswers()
    ]);
    return { categories, answers };
  } catch (error) {
    console.error('Error fetching assessment data:', error);
    throw new Error('Failed to fetch assessment data');
  }
} 