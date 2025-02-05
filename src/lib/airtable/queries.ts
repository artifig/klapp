import { cache } from 'react';
import { airtableBase, TABLES } from './config';
import { AirtableError } from './types';
import type { 
  Category, 
  Question, 
  Answer, 
  CompanyType, 
  LocalizedText,
  MethodSolutionLevel,
  MethodRecommendation,
  MethodExampleSolution
} from './types';

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
        filterByFormula: `AND({isActive} = 1, FIND("${companyTypeId}", {MethodCompanyTypes}))`,
        sort: [{ field: 'categoryId', direction: 'asc' }]
      });
    }

    const records = await query.all();
    console.log('🔍 Raw categories data:', records.map(record => ({
      id: record.id,
      categoryId: record.get('categoryId'),
      categoryText_et: record.get('categoryText_et'),
      categoryText_en: record.get('categoryText_en'),
      companyTypes: record.get('MethodCompanyTypes')
    })));

    const categories = records.map(record => {
      const companyTypes = record.get('MethodCompanyTypes');
      const category = {
        id: record.id,
        categoryId: record.get('categoryId') as string,
        text: transformLocalizedFields(record, 'categoryText'),
        description: transformLocalizedFields(record, 'categoryDescription'),
        companyType: Array.isArray(companyTypes) ? companyTypes : [],
        questions: record.get('MethodQuestions') as string[],
        isActive: record.get('isActive') as boolean
      };
      console.log('Transformed category:', category);
      return category;
    });

    return categories;
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
        filterByFormula: '{isActive} = 1'
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

export const getSolutionLevels = cache(async (): Promise<MethodSolutionLevel[]> => {
  try {
    const records = await airtableBase(TABLES.SOLUTION_LEVELS)
      .select({
        filterByFormula: '{isActive} = 1',
        sort: [
          { field: 'levelScore_lowerThreshold', direction: 'asc' }
        ]
      })
      .all();

    return records.map(record => ({
      id: record.id,
      solutionLevelId: record.get('solutionLevelId') as string,
      levelText_et: record.get('levelText_et') as string,
      levelDescription_et: record.get('levelDescription_et') as string,
      levelText_en: record.get('levelText_en') as string,
      levelDescription_en: record.get('levelDescription_en') as string,
      levelScore_lowerThreshold: record.get('levelScore_lowerThreshold') as number,
      levelScore_upperThreshold: record.get('levelScore_upperThreshold') as number,
      isActive: record.get('isActive') as boolean,
      SolutionProviders: record.get('SolutionProviders') as string[] || [],
      MethodExampleSolutions: record.get('MethodExampleSolutions') as string[] || [],
      MethodRecommendations: record.get('MethodRecommendations') as string[] || []
    }));
  } catch (error: unknown) {
    console.error('Error fetching solution levels:', error);
    throw new AirtableError('Failed to fetch solution levels', 'FETCH_SOLUTION_LEVELS_ERROR');
  }
});

export const getRecommendations = cache(async (categoryId?: string, levelId?: string): Promise<MethodRecommendation[]> => {
  try {
    let filterFormula = '{isActive} = 1';
    
    if (categoryId && levelId) {
      filterFormula = `AND({isActive} = 1, FIND("${categoryId}", {MethodCategories}), FIND("${levelId}", {MethodSolutionLevels}))`;
    } else if (categoryId) {
      filterFormula = `AND({isActive} = 1, FIND("${categoryId}", {MethodCategories}))`;
    } else if (levelId) {
      filterFormula = `AND({isActive} = 1, FIND("${levelId}", {MethodSolutionLevels}))`;
    }

    const records = await airtableBase(TABLES.RECOMMENDATIONS)
      .select({
        filterByFormula: filterFormula
      })
      .all();

    return records.map(record => ({
      id: record.id,
      reccomendationId: record.get('reccomendationId') as string, // Note: This matches the typo in the schema
      recommendationText_et: record.get('recommendationText_et') as string,
      recommendationDescription_et: record.get('recommendationDescription_et') as string,
      recommendationText_en: record.get('recommendationText_en') as string,
      recommendationDescription_en: record.get('recommendationDescription_en') as string,
      isActive: record.get('isActive') as boolean,
      SolutionProviders: record.get('SolutionProviders') as string[] || [],
      MethodCompanyTypes: record.get('MethodCompanyTypes') as string[] || [],
      MethodCategories: record.get('MethodCategories') as string[] || [],
      MethodSolutionLevels: record.get('MethodSolutionLevels') as string[] || []
    }));
  } catch (error: unknown) {
    console.error('Error fetching recommendations:', error);
    throw new AirtableError('Failed to fetch recommendations', 'FETCH_RECOMMENDATIONS_ERROR');
  }
});

export const getExampleSolutions = cache(async (categoryId?: string, levelId?: string): Promise<MethodExampleSolution[]> => {
  try {
    let filterFormula = '{isActive} = 1';
    
    if (categoryId && levelId) {
      filterFormula = `AND({isActive} = 1, FIND("${categoryId}", {MethodCategories}), FIND("${levelId}", {MethodSolutionLevels}))`;
    } else if (categoryId) {
      filterFormula = `AND({isActive} = 1, FIND("${categoryId}", {MethodCategories}))`;
    } else if (levelId) {
      filterFormula = `AND({isActive} = 1, FIND("${levelId}", {MethodSolutionLevels}))`;
    }

    const records = await airtableBase(TABLES.EXAMPLE_SOLUTIONS)
      .select({
        filterByFormula: filterFormula
      })
      .all();

    return records.map(record => ({
      id: record.id,
      exampleSolutionId: record.get('exampleSolutionId') as string,
      exampleSolutionText_et: record.get('exampleSolutionText_et') as string,
      exampleSolutionDescription_et: record.get('exampleSolutionDescription_et') as string,
      exampleSolutionText_en: record.get('exampleSolutionText_en') as string,
      exampleSolutionDescription_en: record.get('exampleSolutionDescription_en') as string,
      isActive: record.get('isActive') as boolean,
      SolutionProviders: record.get('SolutionProviders') as string[] || [],
      MethodCompanyTypes: record.get('MethodCompanyTypes') as string[] || [],
      MethodCategories: record.get('MethodCategories') as string[] || [],
      MethodSolutionLevels: record.get('MethodSolutionLevels') as string[] || []
    }));
  } catch (error: unknown) {
    console.error('Error fetching example solutions:', error);
    throw new AirtableError('Failed to fetch example solutions', 'FETCH_EXAMPLE_SOLUTIONS_ERROR');
  }
}); 