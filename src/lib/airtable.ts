import Airtable from 'airtable';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Debug: Log environment variables (without exposing full token)
const token = process.env.NEXT_PUBLIC_AIRTABLE_PERSONAL_ACCESS_TOKEN || '';
const baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '';
console.log('Token available:', !!token, 'Token prefix:', token.slice(0, 10) + '...');
console.log('Base ID:', baseId);

type FieldSet = Record<string, any>;

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.NEXT_PUBLIC_AIRTABLE_PERSONAL_ACCESS_TOKEN,
}).base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID!);

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
  answerDescription_et: string;
  answerDescription_en: string;
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

// Types for global cache
interface GlobalCacheData {
  categories: AirtableMethodCategory[];
  questions: AirtableMethodQuestion[];
  answers: AirtableMethodAnswer[];
  timestamp: number;
  version: string;
}

const CACHE_KEY = 'assessment_global_cache';
const CACHE_VERSION = '1.0';
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

// Function to fetch all data from Airtable
async function fetchAllData(): Promise<GlobalCacheData> {
  console.log('🔄 Fetching all data from Airtable...');
  
  try {
    // Fetch all categories, questions, and answers in parallel
    const [categories, questions, answers] = await Promise.all([
      getMethodCategories(),
      getMethodQuestions(),
      getMethodAnswers()
    ]);

    // Create a mapping from Airtable record ID to questionId
    const questionIdMap = new Map(
      questions.map(q => [q.id, q.questionId])
    );

    console.log('🔄 ID Mapping check:', {
      sampleRecordId: Array.from(questionIdMap.keys())[0],
      sampleQuestionId: Array.from(questionIdMap.values())[0]
    });

    // Transform category questionIds to use Q1, Q2 format instead of Airtable record IDs
    const transformedCategories = categories.map(category => {
      const transformedQuestionIds = category.questionId
        .map(id => questionIdMap.get(id))
        .filter((id): id is string => id !== undefined);
      
      console.log(`Category ${category.categoryId} transformation:`, {
        before: category.questionId,
        after: transformedQuestionIds
      });

      return {
        ...category,
        questionId: transformedQuestionIds
      };
    });

    // Debug log the transformation results
    console.log('🔍 Data transformation check:');
    if (transformedCategories.length > 0) {
      const sampleCategory = transformedCategories[0];
      console.log('Sample category after transformation:', {
        categoryId: sampleCategory.categoryId,
        questionIds: sampleCategory.questionId
      });

      // Verify questions can be found
      const matchingQuestions = questions.filter(q => 
        sampleCategory.questionId.includes(q.questionId)
      );
      console.log('Matching questions found:', {
        count: matchingQuestions.length,
        questionIds: matchingQuestions.map(q => q.questionId)
      });
    }

    const cacheData: GlobalCacheData = {
      categories: transformedCategories,
      questions,
      answers,
      timestamp: Date.now(),
      version: CACHE_VERSION
    };

    // Store in localStorage
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log('✅ All data fetched and cached successfully');
    
    return cacheData;
  } catch (error) {
    console.error('❌ Error fetching data:', error);
    throw error;
  }
}

// Function to get cached data or fetch if needed
async function getGlobalCache(): Promise<GlobalCacheData> {
  const cachedData = localStorage.getItem(CACHE_KEY);

  if (cachedData) {
    const parsed: GlobalCacheData = JSON.parse(cachedData);
    const isExpired = Date.now() - parsed.timestamp > CACHE_DURATION;
    const isCorrectVersion = parsed.version === CACHE_VERSION;

    if (!isExpired && isCorrectVersion && 
        parsed.categories?.length > 0 && 
        parsed.questions?.length > 0 && 
        parsed.answers?.length > 0) {
      console.log('📦 Using global cached data', {
        categoriesCount: parsed.categories.length,
        questionsCount: parsed.questions.length,
        answersCount: parsed.answers.length
      });
      return parsed;
    }
  }

  return fetchAllData();
}

// Function to normalize company type
function normalizeCompanyType(companyType: string): string {
  const companyTypeMap: Record<string, string> = {
    'startup': 'Startup',
    'scale-up': 'Scaleup',
    'scaleup': 'Scaleup',
    'sme': 'SME',
    'enterprise': 'Enterprise'
  };
  
  const cleanType = companyType.toLowerCase().trim();
  return companyTypeMap[cleanType] || cleanType.toUpperCase();
}

// Function to filter data based on company type
function filterDataByCompanyType(
  data: GlobalCacheData,
  companyType: string
): {
  categories: AirtableMethodCategory[];
  questions: AirtableMethodQuestion[];
  answers: AirtableMethodAnswer[];
} {
  console.log(`🔄 Fetching data for company type:`, companyType);
  
  const normalizedCompanyType = normalizeCompanyType(companyType);
  console.log(`🔄 Normalized company type: ${normalizedCompanyType}`);

  // Filter categories by company type
  const filteredCategories = data.categories.filter(category =>
    category.companyType.some(type => 
      normalizeCompanyType(type) === normalizedCompanyType
    ) && category.isActive
  );

  // Get all question IDs from filtered categories
  const relevantQuestionIds = new Set(
    filteredCategories.flatMap(cat => cat.questionId)
  );

  console.log('Relevant question IDs:', {
    count: relevantQuestionIds.size,
    sample: Array.from(relevantQuestionIds).slice(0, 5)
  });

  // Filter questions that belong to our filtered categories and are active
  const filteredQuestions = data.questions.filter(q => 
    relevantQuestionIds.has(q.questionId) && q.isActive
  );

  // Get all answer IDs from filtered questions
  const relevantAnswerIds = new Set(
    filteredQuestions.flatMap(q => q.answerId)
  );

  // Filter answers that belong to our filtered questions and are active
  const filteredAnswers = data.answers.filter(a => 
    relevantAnswerIds.has(a.id) && a.isActive
  );

  // Log summary of filtered data
  console.log('Raw data received:', {
    categoriesCount: filteredCategories.length,
    questionsCount: filteredQuestions.length,
    answersCount: filteredAnswers.length,
    sampleQuestion: filteredQuestions[0] || null
  });

  // Log category questions for debugging
  filteredCategories.forEach(category => {
    const categoryQuestions = filteredQuestions.filter(q => 
      category.questionId.includes(q.questionId)
    );
    console.log(`Category ${category.categoryId} has ${categoryQuestions.length} questions:`, 
      categoryQuestions.map(q => q.questionId));
  });

  return {
    categories: filteredCategories,
    questions: filteredQuestions,
    answers: filteredAnswers
  };
}

// Updated function to get data for a specific company type
export async function getDataForCompanyType(companyType: string) {
  console.log('🔄 Fetching data for company type:', companyType);
  
  try {
    // Fetch all data in parallel
    const [categories, questions, answers] = await Promise.all([
      getMethodCategories(),
      getMethodQuestions(),
      getMethodAnswers()
    ]);

    // Normalize company type for comparison
    const normalizedCompanyType = normalizeCompanyType(companyType);
    console.log('🔄 Normalized company type:', normalizedCompanyType);

    // Filter categories for this company type
    const filteredCategories = categories.filter(category =>
      category.companyType.some(type => 
        normalizeCompanyType(type) === normalizedCompanyType
      ) && category.isActive
    );

    // Create a map of questions by their Airtable ID for faster lookup
    const questionsById = new Map(questions.map(q => [q.id, q]));

    // For each category, find its questions using the Airtable record IDs
    const categoryQuestions = new Set<string>();
    filteredCategories.forEach(category => {
      category.questionId.forEach(qId => {
        const question = questionsById.get(qId);
        if (question && question.isActive) {
          categoryQuestions.add(question.id);
        }
      });
    });

    // Filter questions that belong to our filtered categories
    const filteredQuestions = questions.filter(q => 
      categoryQuestions.has(q.id) && q.isActive
    );

    // Get answer IDs from filtered questions
    const answerIds = new Set(
      filteredQuestions.flatMap(q => q.answerId)
    );

    // Filter answers
    const filteredAnswers = answers.filter(a => 
      answerIds.has(a.id) && a.isActive
    );

    console.log('📊 Data filtered:', {
      categoriesCount: filteredCategories.length,
      questionsCount: filteredQuestions.length,
      answersCount: filteredAnswers.length,
      sampleCategory: filteredCategories[0]?.categoryId,
      sampleQuestionCount: filteredCategories[0]?.questionId.length
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

// Function to force refresh the global cache
export async function refreshGlobalCache(): Promise<void> {
  console.log('🔄 Force refreshing global cache...');
  await fetchAllData();
}

// Update existing functions to use the new caching system
export async function getCategories(): Promise<AirtableMethodCategory[]> {
  const globalData = await getGlobalCache();
  return globalData.categories;
}

export async function getQuestions(): Promise<AirtableMethodQuestion[]> {
  const globalData = await getGlobalCache();
  return globalData.questions;
}

export async function getAnswers(): Promise<AirtableMethodAnswer[]> {
  const globalData = await getGlobalCache();
  return globalData.answers;
}

// Add debounce helper
let saveTimeout: NodeJS.Timeout | null = null;
let isSaving = false;

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
  // Clear any pending save
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  // If already saving, delay this save
  if (isSaving) {
    console.log('🔄 Save already in progress, queueing...');
    return new Promise((resolve, reject) => {
      saveTimeout = setTimeout(() => {
        saveResult(result).then(resolve).catch(reject);
      }, 1000);
    });
  }

  try {
    isSaving = true;
    console.log('💾 Starting save operation...');

    // Clean up company type and ensure proper capitalization
    const companyTypeMap: Record<string, string> = {
      'startup': 'Startup',
      'scale-up': 'Scaleup', 
      'scaleup': 'Scaleup',
      'sme': 'SME',
      'enterprise': 'Enterprise'
    };
    
    const cleanCompanyType = result.companyType.replace(/['"]+/g, '').trim().toLowerCase();
    const properCompanyType = companyTypeMap[cleanCompanyType] || cleanCompanyType;
    
    console.log('📝 Preparing assessment data...');

    // Create a mapping of logical IDs to Airtable record IDs
    const idMapping = new Map<string, string>();
    result.categories.forEach(cat => {
      cat.questions.forEach(q => {
        idMapping.set(q.id, q.airtableId);
      });
    });

    // Transform answers to use Airtable record IDs
    const airtableAnswers: Record<string, number> = {};
    Object.entries(result.answers).forEach(([logicalId, score]) => {
      const airtableId = idMapping.get(logicalId);
      if (airtableId) {
        airtableAnswers[airtableId] = score;
      }
    });

    // Calculate overall score from answers directly
    const scores = Object.values(result.answers);
    const overallScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;

    // Prepare simplified response content
    const responseContent = {
      metadata: {
        companyType: properCompanyType,
        goal: result.goal,
        overallScore
      },
      answers: airtableAnswers, // Use Airtable record IDs
      categories: result.categories.map(cat => ({
        id: cat.id,
        key: cat.key,
        name: cat.name,
        questions: cat.questions.map(q => ({
          id: q.airtableId, // Use Airtable record ID
          logicalId: q.id, // Keep logical ID for reference
          text: q.text,
          score: result.answers[q.id] || 0
        }))
      }))
    };

    console.log('📤 Saving to Airtable...', {
      answerCount: Object.keys(airtableAnswers).length,
      sampleAnswer: Object.entries(airtableAnswers)[0]
    });
    
    // Create the record
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

    console.log('✅ Save completed successfully');
  } catch (error) {
    console.error('❌ Error saving result:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  } finally {
    isSaving = false;
  }
}

// Helper function to calculate category results
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

// Helper function to calculate overall average
function calculateOverallAverage(
  categories: { id: string; key: string; name: string; questions: { id: string; text: string }[] }[],
  answers: Record<string, number>
) {
  const categoryResults = calculateCategoryResults(categories, answers);
  const totalAverage = Object.values(categoryResults).reduce((sum, cat) => sum + cat.average, 0);
  return categories.length > 0 ? totalAverage / categories.length : 0;
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
    console.log('Found tables:', tables.map((t: { name: string }) => t.name));

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

export function printTableData(results: TableData | TableData[]) {
  const printTable = (data: TableData) => {
    console.log(`\nTable: ${data.tableInfo.name}`);
    console.log(`Key: ${data.tableInfo.key}`);
    if (data.tableInfo.description) {
      console.log(`Description: ${data.tableInfo.description}`);
    }
    
    console.log('\nFields:');
    data.tableInfo.fields.forEach(field => {
      console.log(`  - ${field.name} (${field.type})`);
      console.log(`    Key: ${field.key}`);
      if (field.description) {
        console.log(`    Description: ${field.description}`);
      }
    });

    if (data.sampleRecord) {
      console.log('\nSample Record:');
      console.log(JSON.stringify(data.sampleRecord, null, 2));
    } else {
      console.log('\nNo sample records found');
    }
  };

  if (Array.isArray(results)) {
    results.forEach(printTable);
  } else {
    printTable(results);
  }
}

// CLI functionality
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];

  switch (command) {
    case 'inspect':
      inspectBase().then(results => {
        printTableData(results);
      }).catch(error => {
        console.error('Error:', error);
        process.exit(1);
      });
      break;

    case 'categories':
      getCategories().then(categories => {
        console.log('\nCategories:');
        console.log(JSON.stringify(categories, null, 2));
      }).catch(error => {
        console.error('Error:', error);
        process.exit(1);
      });
      break;

    case 'questions':
      getQuestions().then(questions => {
        console.log('\nQuestions:');
        console.log(JSON.stringify(questions, null, 2));
      }).catch(error => {
        console.error('Error:', error);
        process.exit(1);
      });
      break;

    default:
      console.log(`
Usage: ts-node src/lib/airtable.ts <command>

Commands:
  inspect     Inspect all tables in the Airtable base
  categories  List all categories
  questions   List all questions
`);
      process.exit(1);
  }
}

// Data fetching functions
export async function getMethodCategories(): Promise<AirtableMethodCategory[]> {
  try {
    console.log('🔄 Fetching method categories from Airtable...');
    
    const records = await base('MethodCategories')
      .select({
        filterByFormula: '{isActive} = 1',
        sort: [{ field: 'categoryId', direction: 'asc' }],
      })
      .all();

    console.log(`📥 Retrieved ${records.length} categories from Airtable`);
    
    const categories = records.map((record) => ({
      id: record.id,
      categoryId: record.get('categoryId') as string,
      categoryText_et: record.get('categoryText_et') as string,
      categoryText_en: record.get('categoryText_en') as string,
      categoryDescription_et: record.get('categoryDescription_et') as string,
      categoryDescription_en: record.get('categoryDescription_en') as string,
      companyType: record.get('companyType') as string[],
      isActive: record.get('isActive') as boolean,
      questionId: record.get('questionId') as string[],
    }));

    console.log('📊 Sample category data:', categories[0] || 'No categories found');
    console.log('🏢 Available company types:', new Set(categories.flatMap(cat => cat.companyType)));

    return categories;
  } catch (error) {
    console.error('❌ Error fetching method categories:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
}

export async function getMethodQuestions(): Promise<AirtableMethodQuestion[]> {
  try {
    console.log('🔄 Fetching method questions from Airtable...');
    
    const records = await base('MethodQuestions')
      .select({
        filterByFormula: '{isActive} = 1',
        sort: [{ field: 'questionId', direction: 'asc' }],
      })
      .all();

    console.log(`📥 Retrieved ${records.length} questions from Airtable`);
    
    const questions = records.map((record) => ({
      id: record.id,
      questionId: record.get('questionId') as string,
      questionText_et: record.get('questionText_et') as string,
      questionText_en: record.get('questionText_en') as string,
      isActive: record.get('isActive') as boolean,
      answerId: record.get('answerId') as string[],
      categoryId: record.get('categoryId') as string[],
    }));

    console.log('📊 Sample question data:', questions[0] || 'No questions found');
    
    return questions;
  } catch (error) {
    console.error('❌ Error fetching method questions:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    console.error('Error fetching method questions:', error);
    throw error;
  }
}

export async function getMethodAnswers(): Promise<AirtableMethodAnswer[]> {
  try {
    console.log('Fetching method answers from Airtable...');
    
    const records = await base('MethodAnswers')
      .select({
        sort: [{ field: 'answerId', direction: 'asc' }],
      })
      .all();

    const mappedAnswers = records.map((record) => ({
      id: record.id,
      answerId: record.get('answerId') as string,
      answerText_et: record.get('answerText_et') as string,
      answerText_en: record.get('answerText_en') as string,
      answerDescription_et: record.get('answerDescription_et') as string,
      answerDescription_en: record.get('answerDescription_en') as string,
      answerScore: record.get('answerScore') as number,
      isActive: true, // All answers are considered active
      questionId: record.get('questionId') as string[],
    }));

    console.log('Mapped answers:', {
      count: mappedAnswers.length,
      sample: mappedAnswers[0] || null
    });

    return mappedAnswers;
  } catch (error) {
    console.error('Error in getMethodAnswers:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
}

export async function getAssessmentResponses(): Promise<AirtableAssessmentResponse[]> {
  try {
    const records = await base('AssessmentResponses')
      .select({
        sort: [{ field: 'createdAt', direction: 'desc' }],
      })
      .all();

    return records.map((record) => ({
      id: record.id,
      responseId: record.get('responseId') as string,
      contactName: record.get('contactName') as string,
      contactEmail: record.get('contactEmail') as string,
      companyName: record.get('companyName') as string,
      companyType: record.get('companyType') as string,
      initialGoal: record.get('initialGoal') as string,
      responseStatus: record.get('responseStatus') as 'New' | 'In Progress' | 'Completed',
      responseContent: record.get('responseContent') as string,
      createdAt: record.get('createdAt') as string,
      updatedAt: record.get('updatedAt') as string,
    }));
  } catch (error) {
    console.error('Error fetching assessment responses:', error);
    throw error;
  }
} 