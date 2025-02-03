import { cache } from 'react';
import { airtableBase, TABLES } from './config';
import { AirtableError } from './types';
import type { Category, Question, Answer, CompanyType, LocalizedText } from './types';

interface AirtableRecord {
  id: string;
  get(field: string): unknown;
}

const transformLocalizedFields = (record: AirtableRecord, fieldPrefix: string): LocalizedText => ({
  et: record.get(`${fieldPrefix}_et`) as string,
  en: record.get(`${fieldPrefix}_en`) as string
});

export const getCategories = cache(async (companyTypeId?: string): Promise<Category[]> => {
  try {
    let query = airtableBase(TABLES.CATEGORIES).select({
      filterByFormula: '{isActive} = 1',
      sort: [{ field: 'categoryId', direction: 'asc' }]
    });

    if (companyTypeId) {
      query = airtableBase(TABLES.CATEGORIES).select({
        filterByFormula: `AND({isActive} = 1, FIND("${companyTypeId}", {companyType}))`,
        sort: [{ field: 'categoryId', direction: 'asc' }]
      });
    }

    const records = await query.all();
    return records.map(record => ({
      id: record.id,
      categoryId: record.get('categoryId') as string,
      text: transformLocalizedFields(record, 'categoryText'),
      description: transformLocalizedFields(record, 'categoryDescription'),
      companyType: record.get('companyType') as string[],
      questions: record.get('MethodQuestions') as string[],
      isActive: record.get('isActive') as boolean
    }));
  } catch (error: unknown) {
    console.error('Error fetching categories:', error);
    throw new AirtableError('Failed to fetch categories', 'FETCH_CATEGORIES_ERROR');
  }
});

export const getQuestions = cache(async (): Promise<Question[]> => {
  try {
    const records = await airtableBase(TABLES.QUESTIONS)
      .select({
        filterByFormula: '{isActive} = 1',
        sort: [{ field: 'questionId', direction: 'asc' }]
      })
      .all();

    return records.map(record => ({
      id: record.id,
      questionId: record.get('questionId') as string,
      text: transformLocalizedFields(record, 'questionText'),
      answers: record.get('MethodAnswers') as string[],
      categories: record.get('MethodCategories') as string[],
      isActive: record.get('isActive') as boolean
    }));
  } catch (error: unknown) {
    console.error('Error fetching questions:', error);
    throw new AirtableError('Failed to fetch questions', 'FETCH_QUESTIONS_ERROR');
  }
});

export const getAnswers = cache(async (): Promise<Answer[]> => {
  try {
    const records = await airtableBase(TABLES.ANSWERS)
      .select({
        filterByFormula: '{isActive} = 1',
        sort: [{ field: 'answerId', direction: 'asc' }]
      })
      .all();

    return records.map(record => ({
      id: record.id,
      answerId: record.get('answerId') as string,
      text: transformLocalizedFields(record, 'answerText'),
      description: transformLocalizedFields(record, 'answerDescription'),
      score: record.get('answerScore') as number,
      questions: record.get('MethodQuestions') as string[],
      isActive: record.get('isActive') as boolean
    }));
  } catch (error: unknown) {
    console.error('Error fetching answers:', error);
    throw new AirtableError('Failed to fetch answers', 'FETCH_ANSWERS_ERROR');
  }
});

export const getCompanyTypes = cache(async (): Promise<CompanyType[]> => {
  try {
    const records = await airtableBase(TABLES.COMPANY_TYPES)
      .select({
        filterByFormula: '{isActive} = 1',
        sort: [{ field: 'companyTypeId', direction: 'asc' }]
      })
      .all();

    return records.map(record => ({
      id: record.id,
      companyTypeId: record.get('companyTypeId') as string,
      text: transformLocalizedFields(record, 'companyTypeText'),
      description: transformLocalizedFields(record, 'companyTypeDescription'),
      isActive: record.get('isActive') as boolean
    }));
  } catch (error: unknown) {
    console.error('Error fetching company types:', error);
    throw new AirtableError('Failed to fetch company types', 'FETCH_COMPANY_TYPES_ERROR');
  }
}); 