"use client"

import { useState, useEffect } from "react"
import Card from "@/components/ui/Card"
import { RefreshCw, CheckCircle2, XCircle, AlertCircle, ChevronRight, ChevronDown } from "lucide-react"
import { getAirtableSchema } from "@/lib/airtable"

// Define local types since the current project does not export these from airtable
export type SchemaValidation = {
  isValid: boolean;
  errors: string[];
  suggestions: string[];
  methodCategoriesTable: {
    exists: boolean;
    name: string | null;
    requiredFields: Record<string, boolean>;
  };
  methodQuestionsTable: {
    exists: boolean;
    name: string | null;
    requiredFields: Record<string, boolean>;
  };
  methodAnswersTable: {
    exists: boolean;
    name: string | null;
    requiredFields: Record<string, boolean>;
  };
}

export type AirtableSchema = {
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

// Define expected field names based on our interfaces
const EXPECTED_FIELDS = {
  MethodCompanyTypes: {
    required: [
      'companyTypeId',
      'companyTypeText_et',
      'companyTypeText_en',
      'companyTypeDescription_et',
      'companyTypeDescription_en',
      'isActive'
    ]
  },
  MethodCategories: {
    required: [
      'categoryId',
      'categoryText_et',
      'categoryText_en',
      'categoryDescription_et',
      'categoryDescription_en',
      'isActive',
      'MethodCompanyTypes',
      'MethodQuestions'
    ]
  },
  MethodQuestions: {
    required: [
      'questionId',
      'questionText_et',
      'questionText_en',
      'isActive',
      'MethodAnswers',
      'categoryId'
    ]
  },
  MethodAnswers: {
    required: [
      'answerId',
      'answerText_et',
      'answerText_en',
      'answerDescription_et',
      'answerDescription_en',
      'answerScore',
      'isActive',
      'questionId'
    ]
  }
};

interface ValidationResult {
  table: string;
  missingFields: string[];
  extraFields: string[];
  isValid: boolean;
}

function ValidationCard({ result }: { result: ValidationResult }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          {result.isValid ? (
            <CheckCircle2 className="h-5 w-5 text-green-400" />
          ) : (
            <XCircle className="h-5 w-5 text-red-400" />
          )}
          <h3 className="text-lg font-medium">{result.table}</h3>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            result.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {result.isValid ? 'Valid' : 'Invalid'}
          </span>
          {(result.missingFields.length > 0 || result.extraFields.length > 0) && (
            <ChevronDown className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          )}
        </div>
      </button>

      {isExpanded && (result.missingFields.length > 0 || result.extraFields.length > 0) && (
        <div className="p-4 border-t bg-gray-50">
          {result.missingFields.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-red-800 mb-2">Missing Fields:</h4>
              <ul className="grid grid-cols-2 gap-2 text-sm text-red-600">
                {result.missingFields.map(field => (
                  <li key={field} className="flex items-center">
                    <XCircle className="h-4 w-4 mr-2" />
                    {field}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.extraFields.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Extra Fields:</h4>
              <ul className="grid grid-cols-2 gap-2 text-sm text-yellow-600">
                {result.extraFields.map(field => (
                  <li key={field} className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {field}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SchemaTable({ table }: { table: any }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <h2 className="text-xl font-semibold">{table.name}</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">{table.fields.length} fields</span>
          <ChevronDown className={`h-5 w-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isExpanded && (
        <div className="border-t overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.fields.map((field: any) => (
                <tr key={field.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {field.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {field.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {field.description || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ValidatePage() {
  const [tables, setTables] = useState<any[]>([])
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'validation' | 'schema'>('validation')

  useEffect(() => {
    const validateTables = async () => {
      try {
        const schema = await getAirtableSchema()
        setTables(schema.tables)

        // Perform validation
        const results: ValidationResult[] = []
        
        for (const table of schema.tables) {
          const expectedFields = EXPECTED_FIELDS[table.name as keyof typeof EXPECTED_FIELDS]
          if (expectedFields) {
            const tableFields = new Set(table.fields.map(f => f.name))
            const expectedFieldSet = new Set(expectedFields.required)
            
            const missingFields = expectedFields.required.filter(field => !tableFields.has(field))
            const extraFields = Array.from(tableFields).filter(field => !expectedFieldSet.has(field))
            
            results.push({
              table: table.name,
              missingFields,
              extraFields,
              isValid: missingFields.length === 0
            })
          }
        }

        setValidationResults(results)
        setError(null)
      } catch (err) {
        console.error('Error validating tables:', err)
        setError(err instanceof Error ? err.message : 'Failed to validate tables')
      } finally {
        setLoading(false)
      }
    }

    validateTables()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading table structure...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <Card>
          <div className="p-4 flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Error: {error}</span>
          </div>
        </Card>
      </div>
    )
  }

  const allValid = validationResults.every(result => result.isValid)

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Airtable Structure Validation</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('validation')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'validation'
                ? 'bg-blue-100 text-blue-800'
                : 'hover:bg-gray-100'
            }`}
          >
            Validation Results
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'schema'
                ? 'bg-blue-100 text-blue-800'
                : 'hover:bg-gray-100'
            }`}
          >
            Complete Schema
          </button>
        </div>
      </div>

      {activeTab === 'validation' && (
        <div className="space-y-4">
          <Card>
            <div className="p-4">
              <div className={`p-4 rounded-md ${allValid ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center">
                  {allValid ? (
                    <CheckCircle2 className="h-5 w-5 text-green-400 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400 mr-2" />
                  )}
                  <span className={`font-medium ${allValid ? 'text-green-800' : 'text-red-800'}`}>
                    {allValid ? 'All tables are valid' : 'Some tables need attention'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            {validationResults.map((result) => (
              <ValidationCard key={result.table} result={result} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'schema' && (
        <div className="space-y-4">
          {tables.map((table) => (
            <SchemaTable key={table.id} table={table} />
          ))}
        </div>
      )}
    </div>
  )
} 