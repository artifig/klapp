import Airtable from 'airtable';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const token = process.env.NEXT_PUBLIC_AIRTABLE_PERSONAL_ACCESS_TOKEN || '';
const baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '';

type FieldSet = Record<string, any>;

// Initialize Airtable
const base = new Airtable({ 
  apiKey: process.env.NEXT_PUBLIC_AIRTABLE_PERSONAL_ACCESS_TOKEN 
}).base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID!);

// Types for application data
export interface AirtableMethodCategory {
  id: string;
  categoryId: string;
  categoryText_et: string;
  categoryText_en: string;
  categoryDescription_et: string;
  categoryDescription_en: string;
  companyType: string[];
  isActive: boolean;
  questionId: string[];
}

export interface AirtableMethodQuestion {
  id: string;
  questionId: string;
  questionText_et: string;
  questionText_en: string;
  isActive: boolean;
  answerId: string[];
  categoryId: string[];
}

export interface AirtableMethodAnswer {
  id: string;
  answerId: string;
  answerText_et: string;
  answerText_en: string;
  answerDescription_et?: string;
  answerDescription_en?: string;
  answerScore: number;
  isActive: boolean;
  questionId: string[];
}

export interface AirtableAssessmentResponse {
  id: string;
  responseId: string;
  contactName: string;
  contactEmail: string;
  companyName: string;
  companyType: string;
  initialGoal: string;
  responseStatus: 'New' | 'In Progress' | 'Completed';
  responseContent: string;
  createdAt: string;
  updatedAt: string;
}

// Types for company metadata
export interface CompanyTypeMetadata {
  id: string;
  companyTypeText_en: string;
  companyTypeText_et: string;
  companyTypeDescription_en: string;
  companyTypeDescription_et: string;
  categoryCount: number;
  questionCount: number;
}

export interface AirtableMethodCompanyType {
  id: string;
  companyTypeId: string;
  companyTypeText_et: string;
  companyTypeText_en: string;
  companyTypeDescription_et: string;
  companyTypeDescription_en: string;
  isActive: boolean;
}

// Types for table inspection
interface TableField {
  id: string;
  key: string;
  name: string;
  type: string;
  description?: string;
}

interface TableInfo {
  id: string;
  key: string;
  name: string;
  description?: string;
  fields: TableField[];
}

interface TableData {
  tableInfo: TableInfo;
  sampleRecord?: Record<string, any>;
}

export interface AirtableSchema {
  tables: {
    id: string;
    name: string;
    fields: {
      id: string;
      name: string;
      type: string;
      description?: string;
    }[];
  }[];
}

// Function to normalize company type
function normalizeCompanyType(companyType: string): string {
  // First check if it's a companyTypeId (e.g., "T1", "T2")
  if (companyType.match(/^T\d+$/)) {
    return companyType;
  }

  // If it's a record ID, log a warning as we should be using companyTypeId
  if (companyType.startsWith('rec')) {
    console.warn('⚠️ Using Airtable record ID instead of companyTypeId:', companyType);
  }

  const companyTypeMap: Record<string, string> = {
    'startup': 'T1',
    'scale-up': 'T2',
    'scaleup': 'T2',
    'sme': 'T3',
    'enterprise': 'T4'
  };
  
  const cleanType = companyType.toLowerCase().trim();
  return companyTypeMap[cleanType] || companyType;
}

// Data fetching functions
export async function getMethodCategories(): Promise<AirtableMethodCategory[]> {
  try {
    const records = await base('MethodCategories')
      .select({
        filterByFormula: '{isActive} = 1',
        sort: [{ field: 'categoryId', direction: 'asc' }],
      })
      .all();
    
    return records.map((record) => ({
      id: record.id,
      categoryId: record.get('categoryId') as string,
      categoryText_et: record.get('categoryText_et') as string,
      categoryText_en: record.get('categoryText_en') as string,
      categoryDescription_et: record.get('categoryDescription_et') as string,
      categoryDescription_en: record.get('categoryDescription_en') as string,
      companyType: record.get('MethodCompanyTypes') as string[],
      isActive: record.get('isActive') as boolean,
      questionId: record.get('MethodQuestions') as string[],
    }));
  } catch (error) {
    console.error('Error fetching method categories:', error);
    throw error;
  }
}

export async function getMethodQuestions(): Promise<AirtableMethodQuestion[]> {
  try {
    const records = await base('MethodQuestions')
      .select({
        filterByFormula: '{isActive} = 1',
        sort: [{ field: 'questionId', direction: 'asc' }],
      })
      .all();
    
    console.log('📝 Raw Questions from Airtable:', records.slice(0, 2).map(record => ({
      id: record.id,
      questionId: record.get('questionId'),
      answerId: record.get('MethodAnswers'),
      text_en: record.get('questionText_en')
    })));
    
    return records.map((record) => ({
      id: record.id,
      questionId: record.get('questionId') as string,
      questionText_et: record.get('questionText_et') as string,
      questionText_en: record.get('questionText_en') as string,
      isActive: record.get('isActive') as boolean,
      answerId: record.get('MethodAnswers') as string[],
      categoryId: record.get('categoryId') as string[],
    }));
  } catch (error) {
    console.error('Error fetching method questions:', error);
    throw error;
  }
}

export async function getMethodAnswers(): Promise<AirtableMethodAnswer[]> {
  try {
    const records = await base('MethodAnswers')
      .select({
        filterByFormula: '{isActive} = 1',
        sort: [{ field: 'answerId', direction: 'asc' }],
      })
      .all();

    console.log('✨ Raw Answers from Airtable:', records.slice(0, 2).map(record => ({
      id: record.id,
      answerId: record.get('answerId'),
      text_en: record.get('answerText_en'),
      score: record.get('answerScore'),
      isActive: record.get('isActive'),
      questionId: record.get('MethodQuestions')
    })));

    return records.map((record) => ({
      id: record.id,
      answerId: record.get('answerId') as string,
      answerText_et: record.get('answerText_et') as string,
      answerText_en: record.get('answerText_en') as string,
      answerDescription_et: record.get('answerDescription_et') as string,
      answerDescription_en: record.get('answerDescription_en') as string,
      answerScore: record.get('answerScore') as number,
      isActive: record.get('isActive') as boolean,
      questionId: record.get('MethodQuestions') as string[],
    }));
  } catch (error) {
    console.error('Error fetching method answers:', error);
    throw error;
  }
}

export async function getMethodCompanyTypes(): Promise<AirtableMethodCompanyType[]> {
  try {
    const records = await base('MethodCompanyTypes')
      .select({
        filterByFormula: '{isActive} = 1',
        sort: [{ field: 'companyTypeId', direction: 'asc' }],
      })
      .all();

    console.log('📊 Raw company types from Airtable:', records.slice(0, 2).map(record => ({
      id: record.get('companyTypeId'),
      name_en: record.get('companyTypeText_en'),
      name_et: record.get('companyTypeText_et')
    })));

    return records.map((record) => ({
      id: record.get('companyTypeId') as string, // Use companyTypeId as the primary identifier
      companyTypeId: record.get('companyTypeId') as string,
      companyTypeText_et: record.get('companyTypeText_et') as string,
      companyTypeText_en: record.get('companyTypeText_en') as string,
      companyTypeDescription_et: record.get('companyTypeDescription_et') as string,
      companyTypeDescription_en: record.get('companyTypeDescription_en') as string,
      isActive: record.get('isActive') as boolean,
    }));
  } catch (error) {
    console.error('Error fetching method company types:', error);
    throw error;
  }
}

export async function getCompanyTypesMetadata(): Promise<CompanyTypeMetadata[]> {
  try {
    const companyTypes = await getMethodCompanyTypes();
    return companyTypes
      .filter(type => type.isActive)
      .map(type => ({
        id: type.id,
        companyTypeText_en: type.companyTypeText_en,
        companyTypeText_et: type.companyTypeText_et,
        companyTypeDescription_en: type.companyTypeDescription_en,
        companyTypeDescription_et: type.companyTypeDescription_et,
        categoryCount: 0,
        questionCount: 0
      }));
  } catch (error) {
    console.error('Error fetching company types metadata:', error);
    throw error;
  }
}

export async function getDataForCompanyType(companyType: string) {
  try {
    const [categories, questions, answers] = await Promise.all([
      getMethodCategories(),
      getMethodQuestions(),
      getMethodAnswers()
    ]);

    console.log('🔍 Data fetched:', {
      categoriesCount: categories.length,
      questionsCount: questions.length,
      answersCount: answers.length,
      requestedCompanyType: companyType,
      normalizedCompanyType: normalizeCompanyType(companyType)
    });

    const normalizedCompanyType = normalizeCompanyType(companyType);

    const filteredCategories = categories.filter(category =>
      Array.isArray(category.companyType) &&
      category.companyType.some(type => 
        normalizeCompanyType(type) === normalizedCompanyType
      ) && category.isActive
    );

    console.log('📊 Filtered Categories:', {
      count: filteredCategories.length,
      sample: filteredCategories[0]?.categoryId
    });

    const categoryQuestions = new Set<string>();
    filteredCategories.forEach(category => {
      category.questionId.forEach(qId => {
        const question = questions.find(q => q.id === qId);
        if (question && question.isActive) {
          categoryQuestions.add(question.id);
        }
      });
    });

    const filteredQuestions = questions.filter(q => 
      categoryQuestions.has(q.id) && q.isActive
    );

    console.log('❓ Filtered Questions:', {
      count: filteredQuestions.length,
      sample: filteredQuestions[0] ? {
        id: filteredQuestions[0].id,
        text: filteredQuestions[0].questionText_en,
        answerIds: filteredQuestions[0].answerId
      } : null
    });

    // Get all answer IDs from the filtered questions
    const answerIds = new Set(
      filteredQuestions.flatMap(q => q.answerId || [])
    );

    console.log('🎯 Answer IDs to find:', Array.from(answerIds).slice(0, 3));

    // Filter answers that are linked to our questions
    const filteredAnswers = answers.filter(a => a.isActive);

    console.log('✅ Filtered Answers:', {
      count: filteredAnswers.length,
      sample: filteredAnswers[0] ? {
        id: filteredAnswers[0].id,
        text: filteredAnswers[0].answerText_en,
        score: filteredAnswers[0].answerScore
      } : null
    });

    return {
      categories: filteredCategories,
      questions: filteredQuestions,
      answers: filteredAnswers
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

export async function saveResult(result: {
  name: string;
  email: string;
  companyName: string;
  companyType: string;
  goal: string;
  answers: Record<string, number>;
  categories: { 
    id: string; 
    key: string; 
    name: string; 
    questions: { 
      id: string; 
      airtableId: string;
      text: string 
    }[] 
  }[];
}): Promise<void> {
  try {
    const cleanCompanyType = result.companyType.replace(/['"]+/g, '').trim().toLowerCase();
    const properCompanyType = normalizeCompanyType(cleanCompanyType);

    const idMapping = new Map<string, string>();
    result.categories.forEach(cat => {
      cat.questions.forEach(q => {
        idMapping.set(q.id, q.airtableId);
      });
    });

    const airtableAnswers: Record<string, number> = {};
    Object.entries(result.answers).forEach(([logicalId, score]) => {
      const airtableId = idMapping.get(logicalId);
      if (airtableId) {
        airtableAnswers[airtableId] = score;
      }
    });

    const categoryResults = calculateCategoryResults(result.categories, result.answers);
    const overallAverage = calculateOverallAverage(result.categories, result.answers);

    const responseContent = {
      metadata: {
        companyType: properCompanyType,
        goal: result.goal,
        overallScore: overallAverage
      },
      answers: airtableAnswers,
      categoryScores: categoryResults,
      categories: result.categories.map(cat => ({
        id: cat.id,
        key: cat.key,
        name: cat.name,
        averageScore: categoryResults[cat.id]?.average || 0,
        questions: cat.questions.map(q => ({
          id: q.airtableId,
          logicalId: q.id,
          text: q.text,
          score: result.answers[q.id] || 0
        }))
      }))
    };
    
    await base('AssessmentResponses').create([
      {
        fields: {
          contactName: result.name,
          contactEmail: result.email,
          companyName: result.companyName,
          companyType: properCompanyType,
          initialGoal: result.goal,
          responseContent: JSON.stringify(responseContent, null, 2),
          responseStatus: 'Completed'
        },
      },
    ]);
  } catch (error) {
    console.error('Error saving result:', error);
    throw error;
  }
}

function calculateCategoryResults(
  categories: { id: string; key: string; name: string; questions: { id: string; text: string }[] }[],
  answers: Record<string, number>
) {
  const categoryResults: Record<string, { average: number; answers: Record<string, number> }> = {};
  
  categories.forEach(category => {
    const categoryAnswers: Record<string, number> = {};
    let totalScore = 0;
    let answeredQuestions = 0;
    
    category.questions.forEach(question => {
      const score = answers[question.id];
      if (typeof score === 'number') {
        categoryAnswers[question.id] = score;
        totalScore += score;
        answeredQuestions++;
      }
    });

    categoryResults[category.id] = {
      average: answeredQuestions > 0 ? totalScore / answeredQuestions : 0,
      answers: categoryAnswers
    };
  });

  return categoryResults;
}

function calculateOverallAverage(
  categories: { id: string; key: string; name: string; questions: { id: string; text: string }[] }[],
  answers: Record<string, number>
) {
  const categoryResults = calculateCategoryResults(categories, answers);
  const totalAverage = Object.values(categoryResults).reduce((sum, cat) => sum + cat.average, 0);
  return categories.length > 0 ? totalAverage / categories.length : 0;
}

/**
 * Fetches the schema of all tables in the Airtable base
 */
export async function getAirtableSchema(): Promise<AirtableSchema> {
  try {
    // Use the Airtable Meta API to get table information
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID}/tables`, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AIRTABLE_PERSONAL_ACCESS_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tables: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const tables = data.tables.map((table: any) => ({
      id: table.id,
      name: table.name,
      fields: table.fields.map((field: any) => ({
        id: field.id,
        name: field.name,
        type: field.type,
        description: field.description
      }))
    }));

    return { tables };
  } catch (error) {
    console.error('Error fetching Airtable schema:', error);
    throw new Error('Failed to fetch Airtable schema');
  }
}

// Helper function to generate consistent keys
function generateKey(name: string): string {
  return name
    .replace(/([A-Z])/g, '_$1')  // Add underscore before capital letters
    .toLowerCase()               // Convert to lowercase
    .replace(/^_/, '')          // Remove leading underscore
    .replace(/\s+/g, '_')       // Replace spaces with underscores
    .replace(/[^a-z0-9_]/g, '') // Remove any non-alphanumeric characters except underscore
    .replace(/_+/g, '_');       // Replace multiple underscores with single underscore
}

// Utility functions for inspecting Airtable structure
export async function inspectBase() {
  try {
    // First, get all tables from the base using the metadata API
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tables: ${response.status} ${response.statusText}`);
    }

    const { tables } = await response.json();

    const results: TableData[] = [];

    // Inspect each table
    for (const table of tables) {
      // Get a sample record from each table
      const recordsResponse = await fetch(
        `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table.name)}?maxRecords=1`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!recordsResponse.ok) {
        console.error(`Failed to fetch records for table ${table.name}: ${recordsResponse.status}`);
        continue;
      }

      const { records } = await recordsResponse.json();
      
      const tableData: TableData = {
        tableInfo: {
          id: table.id,
          key: generateKey(table.name),
          name: table.name,
          description: table.description || '',
          fields: table.fields.map((field: any) => ({
            id: field.id || field.name,
            key: generateKey(field.name),
            name: field.name,
            type: field.type,
            description: field.description || ''
          }))
        },
        sampleRecord: records?.[0]?.fields
      };

      results.push(tableData);
    }

    return results;
  } catch (error) {
    console.error('Error inspecting base:', error);
    throw error;
  }
} 