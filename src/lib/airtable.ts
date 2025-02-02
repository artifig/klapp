import Airtable from 'airtable';

// Remove dotenv as Next.js handles env vars
const base = new Airtable({ 
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN 
}).base(process.env.AIRTABLE_BASE_ID!);

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
  MethodQuestions: string[];
}

export interface AirtableMethodQuestion {
  id: string;
  questionId: string;
  questionText_et: string;
  questionText_en: string;
  isActive: boolean;
  MethodAnswers: string[];
  MethodCategories: string[];
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
  MethodQuestions: string[];
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
  sampleRecord?: Record<string, unknown>;
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

interface AirtableTableField {
  id: string;
  name: string;
  type: string;
  description?: string;
}

interface AirtableTable {
  id: string;
  name: string;
  fields: AirtableTableField[];
}

interface AirtableMetaResponse {
  tables: AirtableTable[];
}

interface AirtableField {
  id?: string;
  name: string;
  type: string;
  description?: string;
}

interface CategoryResult {
  average: number;
  answers: Record<string, number>;
}

// Data fetching functions
export async function getMethodCategories(companyTypeId?: string): Promise<AirtableMethodCategory[]> {
  try {
    // Build the filter formula
    let filterFormula = '{isActive} = 1';
    if (companyTypeId) {
      // Add company type filter if provided
      filterFormula = `AND(
        {isActive} = 1,
        FIND('${companyTypeId}', ARRAYJOIN(MethodCompanyTypes, ',')) > 0
      )`;
    }

    const records = await base('MethodCategories')
      .select({
        filterByFormula: filterFormula,
        sort: [{ field: 'categoryId', direction: 'asc' }],
      })
      .all();
    
    console.log('📚 Raw Categories from Airtable:', {
      companyTypeFilter: companyTypeId,
      categoriesFound: records.length,
      categories: records.map(record => ({
        id: record.id,
        categoryId: record.get('categoryId'),
        name_en: record.get('categoryText_en'),
        name_et: record.get('categoryText_et'),
        description_en: record.get('categoryDescription_en'),
        companyTypes: record.get('MethodCompanyTypes'),
        questions: record.get('MethodQuestions'),
        isActive: record.get('isActive')
      }))
    });
    
    return records.map((record) => ({
      id: record.id,
      categoryId: record.get('categoryId') as string,
      categoryText_et: record.get('categoryText_et') as string,
      categoryText_en: record.get('categoryText_en') as string,
      categoryDescription_et: record.get('categoryDescription_et') as string,
      categoryDescription_en: record.get('categoryDescription_en') as string,
      companyType: record.get('MethodCompanyTypes') as string[],
      isActive: record.get('isActive') as boolean,
      MethodQuestions: record.get('MethodQuestions') as string[],
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
    
    console.log('📝 Raw Questions from Airtable:', records.map(record => ({
      id: record.id,
      questionId: record.get('questionId'),
      MethodAnswers: record.get('MethodAnswers'),
      text_en: record.get('questionText_en')
    })));
    
    return records.map((record) => ({
      id: record.id,
      questionId: record.get('questionId') as string,
      questionText_et: record.get('questionText_et') as string,
      questionText_en: record.get('questionText_en') as string,
      isActive: record.get('isActive') as boolean,
      MethodAnswers: record.get('MethodAnswers') as string[],
      MethodCategories: record.get('MethodCategories') as string[],
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

    console.log('✨ Raw Answers from Airtable:', records.map(record => ({
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
      MethodQuestions: record.get('MethodQuestions') as string[],
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

    console.log('📊 Raw company types from Airtable:', records.map(record => ({
      recordId: record.id,
      companyTypeId: record.get('companyTypeId'),
      name_en: record.get('companyTypeText_en'),
      name_et: record.get('companyTypeText_et'),
      isActive: record.get('isActive')
    })));

    return records.map((record) => ({
      id: record.id, // This is the record ID
      companyTypeId: record.get('companyTypeId') as string, // This is T1, T2, etc.
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
        id: type.id,  // Use the actual record ID for relationships
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

export async function getDataForCompanyType(companyTypeId: string) {
  try {
    // First get the company type record to access its linked categories
    const companyType = await base('MethodCompanyTypes')
      .find(companyTypeId);

    console.log('🎯 Selected company type:', {
      id: companyType.id,
      name: companyType.get('companyTypeText_en'),
      categories: companyType.get('MethodCategories')
    });

    // Get categories linked to this company type
    const linkedCategories = companyType.get('MethodCategories') as string[];
    if (!linkedCategories?.length) {
      console.log('⚠️ No categories linked to company type:', companyTypeId);
      return { categories: [], questions: [], answers: [] };
    }

    // Fetch all linked categories in one batch
    const categoriesRecords = await base('MethodCategories')
      .select({
        filterByFormula: `AND(
          {isActive} = 1,
          OR(${linkedCategories.map(id => `RECORD_ID() = '${id}'`).join(',')})
        )`
      })
      .all();

    const filteredCategories = categoriesRecords.map(record => ({
      id: record.id,
      categoryId: record.get('categoryId') as string,
      categoryText_et: record.get('categoryText_et') as string,
      categoryText_en: record.get('categoryText_en') as string,
      categoryDescription_et: record.get('categoryDescription_et') as string,
      categoryDescription_en: record.get('categoryDescription_en') as string,
      companyType: record.get('MethodCompanyTypes') as string[],
      isActive: record.get('isActive') as boolean,
      MethodQuestions: record.get('MethodQuestions') as string[]
    }));

    console.log('📊 Fetched categories:', {
      count: filteredCategories.length,
      sample: filteredCategories[0]?.categoryText_en
    });

    // Get all question IDs from the categories
    const questionIds = Array.from(new Set(
      filteredCategories.flatMap(cat => cat.MethodQuestions || [])
    ));

    // Fetch all questions in one batch
    const questionsRecords = await base('MethodQuestions')
      .select({
        filterByFormula: `AND(
          {isActive} = 1,
          OR(${questionIds.map(id => `RECORD_ID() = '${id}'`).join(',')})
        )`
      })
      .all();

    const filteredQuestions = questionsRecords.map(record => ({
      id: record.id,
      questionId: record.get('questionId') as string,
      questionText_et: record.get('questionText_et') as string,
      questionText_en: record.get('questionText_en') as string,
      isActive: record.get('isActive') as boolean,
      MethodAnswers: record.get('MethodAnswers') as string[],
      MethodCategories: record.get('MethodCategories') as string[]
    }));

    console.log('❓ Fetched questions:', {
      count: filteredQuestions.length,
      sample: filteredQuestions[0]?.questionText_en
    });

    // Get all answer IDs from the questions
    const answerIds = Array.from(new Set(
      filteredQuestions.flatMap(q => q.MethodAnswers || [])
    ));

    // Fetch all answers in one batch
    const answersRecords = await base('MethodAnswers')
      .select({
        filterByFormula: `AND(
          {isActive} = 1,
          OR(${answerIds.map(id => `RECORD_ID() = '${id}'`).join(',')})
        )`
      })
      .all();

    const filteredAnswers = answersRecords.map(record => ({
      id: record.id,
      answerId: record.get('answerId') as string,
      answerText_et: record.get('answerText_et') as string,
      answerText_en: record.get('answerText_en') as string,
      answerDescription_et: record.get('answerDescription_et') as string,
      answerDescription_en: record.get('answerDescription_en') as string,
      answerScore: record.get('answerScore') as number,
      isActive: record.get('isActive') as boolean,
      MethodQuestions: record.get('MethodQuestions') as string[]
    }));

    console.log('✨ Data transformation complete:', {
      categoriesCount: filteredCategories.length,
      questionsCount: filteredQuestions.length,
      answersCount: filteredAnswers.length
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
    const properCompanyType = cleanCompanyType;

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
      categoryScores: Object.entries(categoryResults).map(([id, result]) => ({
        categoryId: id,
        score: result.average
      })),
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
  categories: { 
    id: string; 
    key: string; 
    name: string; 
    questions: { 
      id: string; 
      airtableId: string;
      text: string 
    }[] 
  }[],
  answers: Record<string, number>
): Record<string, CategoryResult> {
  const categoryResults: Record<string, CategoryResult> = {};
  
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
  categories: { 
    id: string; 
    key: string; 
    name: string; 
    questions: { 
      id: string; 
      airtableId: string;
      text: string 
    }[] 
  }[],
  answers: Record<string, number>
): number {
  const categoryResults = calculateCategoryResults(categories, answers);
  const totalAverage = Object.values(categoryResults).reduce((sum, result) => sum + result.average, 0);
  return categories.length > 0 ? totalAverage / categories.length : 0;
}

/**
 * Fetches the schema of all tables in the Airtable base
 */
export async function getAirtableSchema(): Promise<AirtableSchema> {
  try {
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${process.env.AIRTABLE_BASE_ID}/tables`, {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tables: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as AirtableMetaResponse;
    const tables = data.tables.map((table: AirtableTable) => ({
      id: table.id,
      name: table.name,
      fields: table.fields.map((field: AirtableField) => ({
        id: field.id || field.name,
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
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${process.env.AIRTABLE_BASE_ID}/tables`, {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN}`
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
        `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(table.name)}?maxRecords=1`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN}`
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
          fields: table.fields.map((field: AirtableField) => ({
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

// Rename functions to match imports
export const getAirtableCategories = getMethodCategories;
export const getAirtableCompanyTypes = getMethodCompanyTypes;
export const getAirtableAnswers = getMethodAnswers;

// Add schema validation function
export async function validateAirtableSchema(): Promise<{ isValid: boolean; issues: string[] }> {
  try {
    const schema = await getAirtableSchema();
    const issues: string[] = [];

    // Validate required tables
    const requiredTables = ['MethodCategories', 'MethodQuestions', 'MethodAnswers', 'MethodCompanyTypes'];
    const tableNames = schema.tables.map(t => t.name);
    
    requiredTables.forEach(table => {
      if (!tableNames.includes(table)) {
        issues.push(`Missing required table: ${table}`);
      }
    });

    return {
      isValid: issues.length === 0,
      issues
    };
  } catch (error) {
    console.error('Error validating schema:', error);
    return {
      isValid: false,
      issues: ['Failed to validate Airtable schema']
    };
  }
} 