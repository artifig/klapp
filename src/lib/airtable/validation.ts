import type { 
  AirtableSchema,
  AirtableField,
  AirtableTable,
  TableValidation,
  SingleLineTextField,
  MultilineTextField,
  NumberField,
  CheckboxField,
  RecordLinksField,
  DateTimeField
} from './types';

interface AirtableApiField {
  id: string;
  name: string;
  type: AirtableField['type'];
  options?: {
    linkedTableId?: string;
    isReversed?: boolean;
    prefersSingleRecordLink?: boolean;
    inverseLinkFieldId?: string;
    precision?: number;
    icon?: string;
    color?: string;
    result?: {
      type: string;
      options: {
        dateFormat: {
          name: string;
          format: string;
        };
        timeFormat: {
          name: string;
          format: string;
        };
        timeZone: string;
      };
    };
  };
}

interface AirtableApiTable {
  id: string;
  name: string;
  primaryFieldId: string;
  fields: AirtableApiField[];
  views: Array<{
    id: string;
    name: string;
    type: string;
  }>;
}

interface AirtableApiResponse {
  tables: AirtableApiTable[];
}

function mapField(field: AirtableApiField): AirtableField {
  switch (field.type) {
    case 'singleLineText':
      return {
        id: field.id,
        name: field.name,
        type: 'singleLineText'
      } as SingleLineTextField;
    
    case 'multilineText':
      return {
        id: field.id,
        name: field.name,
        type: 'multilineText'
      } as MultilineTextField;
    
    case 'number':
      return {
        id: field.id,
        name: field.name,
        type: 'number',
        options: field.options as { precision: number }
      } as NumberField;
    
    case 'checkbox':
      return {
        id: field.id,
        name: field.name,
        type: 'checkbox',
        options: field.options as { icon: string; color: string }
      } as CheckboxField;
    
    case 'multipleRecordLinks':
      return {
        id: field.id,
        name: field.name,
        type: 'multipleRecordLinks',
        options: field.options as {
          linkedTableId: string;
          isReversed: boolean;
          prefersSingleRecordLink: boolean;
          inverseLinkFieldId: string;
        }
      } as RecordLinksField;
    
    case 'createdTime':
    case 'lastModifiedTime':
      return {
        id: field.id,
        name: field.name,
        type: field.type,
        options: {
          result: {
            type: 'dateTime',
            options: {
              dateFormat: { name: 'iso', format: 'YYYY-MM-DD' },
              timeFormat: { name: '24hour', format: 'HH:mm' },
              timeZone: 'client'
            }
          }
        }
      } as DateTimeField;
    
    default:
      throw new Error(`Unsupported field type: ${field.type}`);
  }
}

export async function getAirtableSchema(): Promise<AirtableSchema> {
  try {
    console.log('Fetching Airtable schema using REST API...');
    
    if (!process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN) {
      throw new Error('AIRTABLE_PERSONAL_ACCESS_TOKEN is not set');
    }

    if (!process.env.AIRTABLE_BASE_ID) {
      throw new Error('AIRTABLE_BASE_ID is not set');
    }

    const response = await fetch(
      `https://api.airtable.com/v0/meta/bases/${process.env.AIRTABLE_BASE_ID}/tables`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Airtable API error:', {
        status: response.status,
        statusText: response.statusText,
      });
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response:', errorData);
      throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as AirtableApiResponse;
    console.log('Raw API response:', JSON.stringify(data, null, 2));

    const result: AirtableSchema = {
      tables: data.tables.map((table): AirtableTable => ({
        id: table.id,
        name: table.name,
        primaryFieldId: table.primaryFieldId,
        fields: table.fields.map(mapField),
        views: table.views
      }))
    };
    
    console.log('Successfully processed schema');
    return result;
  } catch (error: unknown) {
    console.error('Error fetching Airtable schema:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    throw new Error('Failed to fetch Airtable schema');
  }
}

export async function validateAirtableSchema(): Promise<TableValidation> {
  try {
    console.log('Starting schema validation...');
    const schema = await getAirtableSchema();
    const validation: TableValidation = {};

    // Required tables and their corresponding types
    const requiredTables = [
      { name: 'MethodCategories', type: 'MethodCategories' },
      { name: 'MethodQuestions', type: 'MethodQuestions' },
      { name: 'MethodAnswers', type: 'MethodAnswers' },
      { name: 'MethodSolutionLevels', type: 'MethodSolutionLevels' },
      { name: 'MethodExampleSolutions', type: 'MethodExampleSolutions' },
      { name: 'MethodRecommendations', type: 'MethodRecommendations' },
      { name: 'MethodCompanyTypes', type: 'MethodCompanyTypes' }
    ] as const;

    // Check for required tables
    console.log('Checking required tables...');
    const tableNames = schema.tables.map(t => t.name);
    requiredTables.forEach(({ name }) => {
      validation[name] = {
        isValid: true,
        errors: {}
      };

      if (!tableNames.includes(name)) {
        validation[name].isValid = false;
        validation[name].errors.missingFields = ['Table does not exist'];
      }
    });

    // Validate table structures
    console.log('Validating table structures...');
    schema.tables.forEach(table => {
      const requiredTable = requiredTables.find(rt => rt.name === table.name);
      if (requiredTable) {
        const expectedFields = getExpectedFields(requiredTable.type);
        if (expectedFields) {
          const missingFields: string[] = [];
          const extraFields: string[] = [];
          const typeErrors: { field: string; expectedType: string; actualType: string }[] = [];

          // Check for missing and type mismatches
          expectedFields.forEach((expectedField, index) => {
            const actualField = table.fields[index];
            if (!actualField) {
              missingFields.push(`Missing field at position ${index}`);
            } else if (actualField.type !== expectedField.type) {
              typeErrors.push({
                field: actualField.name,
                expectedType: expectedField.type,
                actualType: actualField.type
              });
            }
          });

          // Check for extra fields
          if (table.fields.length > expectedFields.length) {
            extraFields.push(
              ...table.fields
                .slice(expectedFields.length)
                .map(f => f.name)
            );
          }

          if (missingFields.length > 0 || extraFields.length > 0 || typeErrors.length > 0) {
            validation[table.name].isValid = false;
            validation[table.name].errors = {
              ...(missingFields.length > 0 && { missingFields }),
              ...(extraFields.length > 0 && { extraFields }),
              ...(typeErrors.length > 0 && { typeErrors })
            };
          }
        }
      }
    });

    console.log('Validation complete:', validation);
    return validation;
  } catch (error: unknown) {
    console.error('Error validating Airtable schema:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return {
      error: {
        isValid: false,
        errors: {
          missingFields: ['Failed to validate Airtable schema']
        }
      }
    };
  }
}

function getExpectedFields(tableName: string): { type: AirtableField['type'] }[] | null {
  const fieldMappings: Record<string, { type: AirtableField['type'] }[]> = {
    MethodCategories: [
      { type: 'singleLineText' },  // categoryId
      { type: 'singleLineText' },  // categoryText_et
      { type: 'multilineText' },   // categoryDescription_et
      { type: 'singleLineText' },  // categoryText_en
      { type: 'multilineText' },   // categoryDescription_en
      { type: 'checkbox' },        // isActive
      { type: 'multipleRecordLinks' }, // SolutionProviders
      { type: 'multipleRecordLinks' }, // MethodCompanyTypes
      { type: 'multipleRecordLinks' }, // MethodQuestions
      { type: 'multipleRecordLinks' }, // MethodSolutions
      { type: 'multipleRecordLinks' }, // MethodRecommendations
      { type: 'createdTime' },     // Created time
      { type: 'lastModifiedTime' } // Last modified time
    ],
    MethodQuestions: [
      { type: 'singleLineText' },  // questionId
      { type: 'multilineText' },   // questionText_et
      { type: 'multilineText' },   // questionText_en
      { type: 'checkbox' },        // isActive
      { type: 'multipleRecordLinks' }, // MethodCategories
      { type: 'multipleRecordLinks' }, // MethodAnswers
      { type: 'createdTime' },     // Created time
      { type: 'lastModifiedTime' } // Last modified time
    ],
    MethodAnswers: [
      { type: 'singleLineText' },  // answerId
      { type: 'singleLineText' },  // answerText_et
      { type: 'multilineText' },   // answerDescription_et
      { type: 'singleLineText' },  // answerText_en
      { type: 'multilineText' },   // answerDescription_en
      { type: 'number' },          // answerScore
      { type: 'checkbox' },        // isActive
      { type: 'multipleRecordLinks' }, // MethodQuestions
      { type: 'createdTime' },     // Created time
      { type: 'lastModifiedTime' } // Last modified time
    ],
    MethodSolutionLevels: [
      { type: 'singleLineText' },  // solutionLevelId
      { type: 'singleLineText' },  // levelText_et
      { type: 'multilineText' },   // levelDescription_et
      { type: 'singleLineText' },  // levelText_en
      { type: 'multilineText' },   // levelDescription_en
      { type: 'number' },          // levelScore_lowerThreshold
      { type: 'number' },          // levelScore_upperThreshold
      { type: 'checkbox' },        // isActive
      { type: 'multipleRecordLinks' }, // SolutionProviders
      { type: 'multipleRecordLinks' }, // MethodExampleSolutions
      { type: 'multipleRecordLinks' }, // MethodRecommendations
      { type: 'createdTime' },     // Created time
      { type: 'lastModifiedTime' } // Last modified time
    ],
    MethodExampleSolutions: [
      { type: 'singleLineText' },  // exampleSolutionId
      { type: 'singleLineText' },  // exampleSolutionText_et
      { type: 'multilineText' },   // exampleSolutionDescription_et
      { type: 'singleLineText' },  // exampleSolutionText_en
      { type: 'multilineText' },   // exampleSolutionDescription_en
      { type: 'checkbox' },        // isActive
      { type: 'multipleRecordLinks' }, // SolutionProviders
      { type: 'multipleRecordLinks' }, // MethodCompanyTypes
      { type: 'multipleRecordLinks' }, // MethodCategories
      { type: 'multipleRecordLinks' }, // MethodSolutionLevels
      { type: 'createdTime' },     // Created time
      { type: 'lastModifiedTime' } // Last modified time
    ],
    MethodRecommendations: [
      { type: 'singleLineText' },  // recommendationId
      { type: 'singleLineText' },  // recommendationText_et
      { type: 'multilineText' },   // recommendationDescription_et
      { type: 'singleLineText' },  // recommendationText_en
      { type: 'multilineText' },   // recommendationDescription_en
      { type: 'checkbox' },        // isActive
      { type: 'multipleRecordLinks' }, // SolutionProviders
      { type: 'multipleRecordLinks' }, // MethodCompanyTypes
      { type: 'multipleRecordLinks' }, // MethodCategories
      { type: 'multipleRecordLinks' }, // MethodSolutionLevels
      { type: 'createdTime' },     // Created time
      { type: 'lastModifiedTime' } // Last modified time
    ],
    MethodCompanyTypes: [
      { type: 'singleLineText' },  // companyTypeId
      { type: 'singleLineText' },  // companyTypeText_et
      { type: 'multilineText' },   // companyTypeDescription_et
      { type: 'singleLineText' },  // companyTypeText_en
      { type: 'multilineText' },   // companyTypeDescription_en
      { type: 'checkbox' },        // isActive
      { type: 'multipleRecordLinks' }, // AssessmentResponses
      { type: 'multipleRecordLinks' }, // SolutionProviders
      { type: 'multipleRecordLinks' }, // MethodCategories
      { type: 'multipleRecordLinks' }, // MethodExampleSolutions
      { type: 'multipleRecordLinks' }, // MethodRecommendations
      { type: 'createdTime' },     // Created time
      { type: 'lastModifiedTime' } // Last modified time
    ]
  };

  return fieldMappings[tableName] || null;
} 