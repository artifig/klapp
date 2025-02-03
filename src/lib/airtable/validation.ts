import { airtableBase } from './config';
import type { Table, FieldSet } from 'airtable';

interface AirtableField {
  id: string;
  name: string;
  type: string;
  description?: string;
}

interface AirtableTable extends Table<FieldSet> {
  description?: string;
  fields: AirtableField[];
}

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

export interface AirtableSchema {
  tables: TableInfo[];
}

export async function getAirtableSchema(): Promise<AirtableSchema> {
  try {
    // Using type assertion since Airtable types are incomplete
    const base = airtableBase as unknown as { tables(): Promise<AirtableTable[]> };
    const tables = await base.tables();
    
    return {
      tables: tables.map(table => ({
        id: table.id,
        key: table.name,
        name: table.name,
        description: table.description,
        fields: table.fields.map(field => ({
          id: field.id,
          key: field.name,
          name: field.name,
          type: field.type,
          description: field.description
        }))
      }))
    };
  } catch (error: unknown) {
    console.error('Error fetching Airtable schema:', error);
    throw new Error('Failed to fetch Airtable schema');
  }
}

export async function validateAirtableSchema(): Promise<{
  isValid: boolean;
  errors: string[];
}> {
  try {
    const schema = await getAirtableSchema();
    const errors: string[] = [];

    // Add your schema validation logic here
    const requiredTables = ['MethodCategories', 'MethodQuestions', 'MethodAnswers', 'AssessmentResponses'];
    const tableNames = schema.tables.map(t => t.name);

    requiredTables.forEach(tableName => {
      if (!tableNames.includes(tableName)) {
        errors.push(`Missing required table: ${tableName}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  } catch (error: unknown) {
    console.error('Error validating Airtable schema:', error);
    return {
      isValid: false,
      errors: ['Failed to validate Airtable schema']
    };
  }
} 