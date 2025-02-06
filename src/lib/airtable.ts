import Airtable from 'airtable';

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

export async function getAssessmentResponse(id: string): Promise<AssessmentResponse | null> {
  try {
    const record = await base('AssessmentResponses').find(id);
    
    return {
      id: record.id,
      responseId: record.get('responseId') as string,
      companyName: record.get('companyName') as string | undefined,
      contactName: record.get('contactName') as string | undefined,
      contactEmail: record.get('contactEmail') as string | undefined,
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