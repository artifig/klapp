import Airtable from 'airtable';
import { FieldSet } from 'airtable/lib/field_set';

// Initialize Airtable with Personal Access Token
const base = new Airtable({
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN
}).base(process.env.AIRTABLE_BASE_ID!);

// Type definitions based on Airtable schema
export interface MethodCompanyType {
  id: string;
  companyTypeText_et: string;
  isActive: boolean;
  // Linked fields
  MethodCategories?: string[];
}

export interface MethodCategory {
  id: string;
  categoryText_et: string;
  categoryDescription_et: string;
  isActive: boolean;
  // Linked fields
  MethodCompanyTypes?: string[];
  MethodQuestions?: string[];
}

export interface MethodQuestion {
  id: string;
  questionText_et: string;
  questionDescription_et?: string;
  isActive: boolean;
  // Linked fields
  MethodCategories: string[];
  MethodAnswers?: string[];
}

export interface MethodAnswer {
  id: string;
  answerText_et: string;
  answerScore: number;
  isActive: boolean;
  // Linked fields
  MethodQuestions: string[];
}

export interface AssessmentResponse {
  id: string;
  responseId: string;
  companyName?: string;
  contactName?: string;
  contactEmail?: string;
  initialGoal: string;
  responseContent: string;
  responseStatus: 'New' | 'In Progress' | 'Completed';
  isActive: boolean;
  // Linked fields
  MethodCompanyTypes: string[];
}

export interface MethodRecommendation {
  id: string;
  recommendationText_et: string;
  recommendationDescription_et: string;
  isActive: boolean;
}

export interface MethodExampleSolution {
  id: string;
  exampleSolutionText_et: string;
  exampleSolutionDescription_et: string;
  isActive: boolean;
}

// Cache for active records
let recommendationsCache: {
  timestamp: number;
  records: Airtable.Records<FieldSet>;
} | null = null;

let solutionsCache: {
  timestamp: number;
  records: Airtable.Records<FieldSet>;
} | null = null;

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

async function getActiveRecommendations(): Promise<Airtable.Records<FieldSet>> {
  // Return cached data if it's fresh
  if (recommendationsCache && (Date.now() - recommendationsCache.timestamp) < CACHE_TTL) {
    console.log('Using cached recommendations');
    return recommendationsCache.records;
  }

  console.log('Fetching fresh recommendations from Airtable');
  const records = await base('MethodRecommendations')
    .select({
      filterByFormula: '{isActive} = 1',
      fields: ['recommendationText_et', 'recommendationDescription_et', 'isActive', 'MethodCategories', 'MethodMaturityLevels', 'MethodCompanyTypes']
    })
    .all();

  // Update cache
  recommendationsCache = {
    timestamp: Date.now(),
    records
  };

  return records;
}

async function getActiveSolutions(): Promise<Airtable.Records<FieldSet>> {
  // Return cached data if it's fresh
  if (solutionsCache && (Date.now() - solutionsCache.timestamp) < CACHE_TTL) {
    console.log('Using cached solutions');
    return solutionsCache.records;
  }

  console.log('Fetching fresh solutions from Airtable');
  const records = await base('MethodExampleSolutions')
    .select({
      filterByFormula: '{isActive} = 1',
      fields: ['exampleSolutionText_et', 'exampleSolutionDescription_et', 'isActive', 'MethodCategories', 'MethodMaturityLevels', 'MethodCompanyTypes']
    })
    .all();

  // Update cache
  solutionsCache = {
    timestamp: Date.now(),
    records
  };

  return records;
}

// Utility functions
export async function getActiveCompanyTypes(): Promise<MethodCompanyType[]> {
  try {
    const records = await base('MethodCompanyTypes')
      .select({
        filterByFormula: '{isActive} = 1',
        fields: ['companyTypeText_et', 'isActive']
      })
      .all();

    return records.map(record => ({
      id: record.id,
      companyTypeText_et: record.get('companyTypeText_et') as string,
      isActive: record.get('isActive') as boolean
    }));
  } catch (error) {
    console.error('Error fetching company types:', error);
    throw error;
  }
}

export async function getCategories(companyTypeId: string): Promise<MethodCategory[]> {
  try {
    console.log('Fetching categories for company type:', companyTypeId);
    
    // First, get the company type record to get its linked category IDs
    const companyType = await base('MethodCompanyTypes').find(companyTypeId);
    const categoryIds = companyType.get('MethodCategories') as string[];
    
    console.log('Category IDs from company type:', categoryIds);

    if (!categoryIds || categoryIds.length === 0) {
      console.log('No categories linked to company type');
      return [];
    }

    // Then fetch those specific categories
    const formula = `AND(
      {isActive} = 1,
      OR(${categoryIds.map(id => `RECORD_ID() = '${id}'`).join(',')})
    )`;

    const records = await base('MethodCategories')
      .select({
        filterByFormula: formula,
        fields: ['categoryText_et', 'categoryDescription_et', 'isActive']
      })
      .all();

    console.log('Found categories:', records.length);
    
    return records.map(record => ({
      id: record.id,
      categoryText_et: record.get('categoryText_et') as string,
      categoryDescription_et: record.get('categoryDescription_et') as string,
      isActive: record.get('isActive') as boolean
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

export async function getQuestions(categoryIds: string[]): Promise<MethodQuestion[]> {
  try {
    console.log('Fetching questions for categories:', categoryIds);

    // Get all questions where the category is in our list
    const formula = `AND(
      {isActive} = 1,
      OR(${categoryIds.map(id => 
        `RECORD_ID() = '${id}'`
      ).join(',')})
    )`;

    console.log('Questions formula:', formula);

    // First get the categories to get their linked questions
    const categoryRecords = await base('MethodCategories')
      .select({
        filterByFormula: formula,
        fields: ['MethodQuestions']
      })
      .all();

    // Get all question IDs from the categories
    const questionIds = Array.from(new Set(
      categoryRecords.flatMap(record => record.get('MethodQuestions') as string[] || [])
    ));

    console.log('Question IDs from categories:', questionIds);

    if (!questionIds.length) {
      console.log('No questions found in categories');
      return [];
    }

    // Now fetch those specific questions
    const questionFormula = `AND(
      {isActive} = 1,
      OR(${questionIds.map(id => `RECORD_ID() = '${id}'`).join(',')})
    )`;

    const records = await base('MethodQuestions')
      .select({
        filterByFormula: questionFormula,
        fields: ['questionText_et', 'MethodCategories', 'MethodAnswers', 'isActive']
      })
      .all();

    console.log('Found questions:', records.length);

    return records.map(record => ({
      id: record.id,
      questionText_et: record.get('questionText_et') as string,
      questionDescription_et: record.get('questionDescription_et') as string,
      MethodCategories: record.get('MethodCategories') as string[],
      MethodAnswers: record.get('MethodAnswers') as string[],
      isActive: record.get('isActive') as boolean
    }));
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
}

export async function getAnswers(questionIds: string[]): Promise<MethodAnswer[]> {
  try {
    if (!questionIds || questionIds.length === 0) {
      console.log('No question IDs provided for answers');
      return [];
    }

    console.log('Fetching answers for questions:', questionIds);

    // First get the questions to get their linked answers
    const questionRecords = await base('MethodQuestions')
      .select({
        filterByFormula: `OR(${questionIds.map(id => `RECORD_ID() = '${id}'`).join(',')})`,
        fields: ['MethodAnswers']
      })
      .all();

    // Get all answer IDs from the questions
    const answerIds = Array.from(new Set(
      questionRecords.flatMap(record => record.get('MethodAnswers') as string[] || [])
    ));

    console.log('Answer IDs from questions:', answerIds);

    if (!answerIds.length) {
      console.log('No answers found in questions');
      return [];
    }

    // Now fetch those specific answers
    const formula = `AND(
      {isActive} = 1,
      OR(${answerIds.map(id => `RECORD_ID() = '${id}'`).join(',')})
    )`;

    console.log('Answers formula:', formula);

    const records = await base('MethodAnswers')
      .select({
        filterByFormula: formula,
        fields: ['answerText_et', 'answerScore', 'MethodQuestions', 'isActive']
      })
      .all();

    console.log('Found answers:', records.length);

    // Convert records to our type and randomize the order
    const answers = records.map(record => ({
      id: record.id,
      answerText_et: record.get('answerText_et') as string,
      answerScore: record.get('answerScore') as number,
      MethodQuestions: record.get('MethodQuestions') as string[],
      isActive: record.get('isActive') as boolean
    }));

    // Shuffle the answers array
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answers[i], answers[j]] = [answers[j], answers[i]];
    }

    return answers;
  } catch (error) {
    console.error('Error fetching answers:', error);
    throw error;
  }
}

export async function createAssessmentResponse(data: {
  initialGoal: string;
  companyType: string;
}): Promise<string> {
  try {
    const record = await base('AssessmentResponses').create({
      initialGoal: data.initialGoal,
      responseStatus: 'New',
      isActive: true,
      MethodCompanyTypes: [data.companyType],
      responseContent: JSON.stringify({
        companyType: data.companyType,
        responses: [],
        scores: {},
        levels: {}
      })
    });

    return record.id;
  } catch (error) {
    console.error('Error creating assessment response:', error);
    throw error;
  }
}

export async function getRecommendations(categoryScores: { [categoryId: string]: number }): Promise<MethodRecommendation[]> {
  try {
    // Convert scores to levels
    const categoryLevels = Object.entries(categoryScores).map(([categoryId, score]) => {
      const level = score < 0.4 ? 'rec44BVnTt9fg41wM' : // red
                   score < 0.7 ? 'reckoGCddbcKvlJx5' : // yellow
                   'recLcsenKbLdVL4Ku'; // green
      return { categoryId, levelId: level };
    });

    // Create a formula to match any category-level combination
    const formula = `
      AND(
        {isActive} = 1,
        OR(${categoryLevels.map(({ categoryId, levelId }) => `
          AND(
            FIND('${categoryId}', ARRAYJOIN({MethodCategories})) > 0,
            FIND('${levelId}', ARRAYJOIN({MethodSolutionLevels})) > 0
          )
        `).join(',')})
      )
    `;

    const records = await base('MethodRecommendations')
      .select({
        filterByFormula: formula,
        fields: ['recommendationText_et', 'recommendationDescription_et', 'isActive', 'MethodCategories', 'MethodSolutionLevels']
      })
      .all();

    return records.map(record => ({
      id: record.id,
      recommendationText_et: record.get('recommendationText_et') as string,
      recommendationDescription_et: record.get('recommendationDescription_et') as string,
      isActive: record.get('isActive') as boolean
    }));
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
}

export async function getExampleSolutions(categoryScores: { [categoryId: string]: number }): Promise<MethodExampleSolution[]> {
  try {
    // Convert scores to levels
    const categoryLevels = Object.entries(categoryScores).map(([categoryId, score]) => {
      const level = score < 0.4 ? 'rec44BVnTt9fg41wM' : // red
                   score < 0.7 ? 'reckoGCddbcKvlJx5' : // yellow
                   'recLcsenKbLdVL4Ku'; // green
      return { categoryId, levelId: level };
    });

    // Create a formula to match any category-level combination
    const formula = `
      AND(
        {isActive} = 1,
        OR(${categoryLevels.map(({ categoryId, levelId }) => `
          AND(
            FIND('${categoryId}', ARRAYJOIN({MethodCategories})) > 0,
            FIND('${levelId}', ARRAYJOIN({MethodSolutionLevels})) > 0
          )
        `).join(',')})
      )
    `;

    const records = await base('MethodExampleSolutions')
      .select({
        filterByFormula: formula,
        fields: ['exampleSolutionText_et', 'exampleSolutionDescription_et', 'isActive', 'MethodCategories', 'MethodSolutionLevels']
      })
      .all();

    return records.map(record => ({
      id: record.id,
      exampleSolutionText_et: record.get('exampleSolutionText_et') as string,
      exampleSolutionDescription_et: record.get('exampleSolutionDescription_et') as string,
      isActive: record.get('isActive') as boolean
    }));
  } catch (error) {
    console.error('Error fetching example solutions:', error);
    throw error;
  }
}

export async function getAssessmentResponse(responseId: string): Promise<AssessmentResponse | null> {
  try {
    const record = await base('AssessmentResponses').find(responseId);
    
    return {
      id: record.id,
      responseId: record.get('responseId') as string,
      companyName: record.get('companyName') as string,
      contactName: record.get('contactName') as string,
      contactEmail: record.get('contactEmail') as string,
      initialGoal: record.get('initialGoal') as string,
      responseContent: record.get('responseContent') as string,
      responseStatus: record.get('responseStatus') as 'New' | 'In Progress' | 'Completed',
      isActive: record.get('isActive') as boolean,
      MethodCompanyTypes: record.get('MethodCompanyTypes') as string[]
    };
  } catch (error) {
    console.error('Error fetching assessment response:', error);
    return null;
  }
}

export async function getRecommendationsForCategory(categoryId: string, scoreLevel: 'red' | 'yellow' | 'green', companyTypeId: string): Promise<MethodRecommendation[]> {
  try {
    console.log('Fetching recommendations with params:', {
      categoryId,
      scoreLevel,
      companyTypeId
    });

    const levelId = scoreLevel === 'red' ? 'rec44BVnTt9fg41wM' : 
                   scoreLevel === 'yellow' ? 'reckoGCddbcKvlJx5' : 
                   'recLcsenKbLdVL4Ku';

    console.log('Using maturity level ID:', levelId);

    // Get records from cache or Airtable
    const allRecords = await getActiveRecommendations();

    console.log('Total active recommendations:', allRecords.length);

    // Filter records manually
    const filteredRecords = allRecords.filter((record: Airtable.Record<FieldSet>) => {
      const categories = record.get('MethodCategories') as string[] || [];
      const maturityLevels = record.get('MethodMaturityLevels') as string[] || [];
      const companyTypes = record.get('MethodCompanyTypes') as string[] || [];

      const hasCategory = categories.includes(categoryId);
      const hasLevel = maturityLevels.includes(levelId);
      const hasCompanyType = companyTypes.length === 0 || companyTypes.includes(companyTypeId);

      return hasCategory && hasLevel && hasCompanyType;
    });

    console.log('Found recommendations after filtering:', filteredRecords.length);

    return filteredRecords.map((record: Airtable.Record<FieldSet>) => ({
      id: record.id,
      recommendationText_et: record.get('recommendationText_et') as string,
      recommendationDescription_et: record.get('recommendationDescription_et') as string,
      isActive: record.get('isActive') as boolean
    }));
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
}

export async function getExampleSolutionsForCategory(categoryId: string, scoreLevel: 'red' | 'yellow' | 'green', companyTypeId: string): Promise<MethodExampleSolution[]> {
  try {
    console.log('Fetching solutions with params:', {
      categoryId,
      scoreLevel,
      companyTypeId
    });

    const levelId = scoreLevel === 'red' ? 'rec44BVnTt9fg41wM' : 
                   scoreLevel === 'yellow' ? 'reckoGCddbcKvlJx5' : 
                   'recLcsenKbLdVL4Ku';

    console.log('Using maturity level ID:', levelId);

    // Get records from cache or Airtable
    const allRecords = await getActiveSolutions();

    console.log('Total active solutions:', allRecords.length);

    // Filter records manually
    const filteredRecords = allRecords.filter((record: Airtable.Record<FieldSet>) => {
      const categories = record.get('MethodCategories') as string[] || [];
      const maturityLevels = record.get('MethodMaturityLevels') as string[] || [];
      const companyTypes = record.get('MethodCompanyTypes') as string[] || [];

      const hasCategory = categories.includes(categoryId);
      const hasLevel = maturityLevels.includes(levelId);
      const hasCompanyType = companyTypes.length === 0 || companyTypes.includes(companyTypeId);

      return hasCategory && hasLevel && hasCompanyType;
    });

    console.log('Found solutions after filtering:', filteredRecords.length);

    return filteredRecords.map((record: Airtable.Record<FieldSet>) => ({
      id: record.id,
      exampleSolutionText_et: record.get('exampleSolutionText_et') as string,
      exampleSolutionDescription_et: record.get('exampleSolutionDescription_et') as string,
      isActive: record.get('isActive') as boolean
    }));
  } catch (error) {
    console.error('Error fetching example solutions:', error);
    throw error;
  }
}