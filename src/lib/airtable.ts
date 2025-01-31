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

// Application data functions
export async function getCategories(): Promise<AirtableMethodCategory[]> {
  return getMethodCategories();
}

export async function getQuestions(): Promise<AirtableMethodQuestion[]> {
  return getMethodQuestions();
}

export async function saveResult(result: {
  name: string;
  email: string;
  companyName: string;
  companyType: string;
  goal: string;
  answers: Record<string, number>;
}): Promise<void> {
  try {
    await base('AssessmentResponses').create([
      {
        fields: {
          companyName: result.companyName,
          contactName: result.name,
          contactEmail: result.email,
          companyType: result.companyType,
          initialGoal: result.goal,
          responseContent: JSON.stringify(result.answers),
          responseStatus: 'New'
        },
      },
    ]);
  } catch (error) {
    console.error('Error saving result:', error);
    throw error;
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
      companyType: record.get('companyType') as string[],
      isActive: record.get('isActive') as boolean,
      questionId: record.get('questionId') as string[],
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

    return records.map((record) => ({
      id: record.id,
      questionId: record.get('questionId') as string,
      questionText_et: record.get('questionText_et') as string,
      questionText_en: record.get('questionText_en') as string,
      isActive: record.get('isActive') as boolean,
      answerId: record.get('answerId') as string[],
      categoryId: record.get('categoryId') as string[],
    }));
  } catch (error) {
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