"use client"

import { useState, useEffect } from "react"
import Card from "@/components/ui/Card"
import { RefreshCw, CheckCircle2, XCircle, AlertCircle, ChevronRight } from "lucide-react"

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

export default function AppValidationPage() {
  const [validation, setValidation] = useState<SchemaValidation | null>(null)
  const [schema, setSchema] = useState<AirtableSchema | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateSchema = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch both schema and validation in parallel
      const [schemaRes, validationRes] = await Promise.all([
        fetch("/api/airtable/schema"),
        fetch("/api/airtable/validate")
      ])

      if (!schemaRes.ok) throw new Error("Failed to fetch schema")
      if (!validationRes.ok) throw new Error("Failed to validate schema")

      const schemaData = await schemaRes.json()
      const validationData = await validationRes.json()

      setSchema(schemaData)
      setValidation(validationData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Run validation on page load
  useEffect(() => {
    validateSchema()
  }, [])

  const TableValidation = ({
    title,
    table,
    schemaTable,
  }: {
    title: string
    table: {
      exists: boolean
      name: string | null
      requiredFields: Record<string, boolean>
    }
    schemaTable?: AirtableSchema["tables"][0]
  }) => (
    <Card>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">{title}</h3>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            table.exists 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }`}>
            {table.exists ? "Found" : "Not Found"}
          </span>
        </div>
        {table.name && <p className="text-sm text-gray-500">Table name: {table.name}</p>}
        
        <div className="space-y-4">
          <div className="grid gap-2">
            {Object.entries(table.requiredFields).map(([field, exists]: [string, boolean]) => (
              <div key={field} className="flex items-center justify-between">
                <span className="text-sm font-medium">{field}</span>
                {exists ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            ))}
          </div>

          {schemaTable && (
            <details className="mt-4">
              <summary className="flex items-center cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                <ChevronRight className="h-4 w-4" />
                <span>Show Field Details</span>
              </summary>
              <div className="mt-2">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Field Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {schemaTable.fields.map((field: any) => (
                      <tr key={field.id}>
                        <td className="px-4 py-2 text-xs font-mono">{field.name}</td>
                        <td className="px-4 py-2 text-xs">{field.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}
        </div>
      </div>
    </Card>
  )

  const findTableByName = (tableName: string | null) => {
    if (!schema || !tableName) return undefined
    return schema.tables.find((table: any) =>
      table.name.toLowerCase() === tableName.toLowerCase()
    )
  }

  return (
    <div className="container py-8 space-y-8 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Application Schema Validation
          </h1>
          <p className="text-gray-500">
            Validate your application's schema against the required structure.
          </p>
        </div>
        <button
          onClick={validateSchema}
          disabled={isLoading}
          className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
            isLoading
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          <span>Validate</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            <h3 className="font-medium text-red-800">Error</h3>
          </div>
          <p className="mt-2 text-sm text-red-700">{error}</p>
        </div>
      )}

      {validation && (
        <div className="space-y-6">
          <div className={`p-4 rounded-md ${
            validation.isValid
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}>
            <div className="flex items-center">
              <AlertCircle className={`h-4 w-4 mr-2 ${
                validation.isValid ? "text-green-500" : "text-red-500"
              }`} />
              <h3 className={`font-medium ${
                validation.isValid ? "text-green-800" : "text-red-800"
              }`}>
                {validation.isValid ? "Schema is valid" : "Schema validation failed"}
              </h3>
            </div>
            <p className={`mt-2 text-sm ${
              validation.isValid ? "text-green-700" : "text-red-700"
            }`}>
              {validation.isValid
                ? "Your application's schema matches the required structure."
                : "There are issues with your application's schema that need to be addressed."}
            </p>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <TableValidation
              title="Method Categories"
              table={validation.methodCategoriesTable}
              schemaTable={findTableByName(validation.methodCategoriesTable.name)}
            />
            <TableValidation
              title="Method Questions"
              table={validation.methodQuestionsTable}
              schemaTable={findTableByName(validation.methodQuestionsTable.name)}
            />
            <TableValidation
              title="Method Answers"
              table={validation.methodAnswersTable}
              schemaTable={findTableByName(validation.methodAnswersTable.name)}
            />
          </div>

          {validation.errors.length > 0 && (
            <Card>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold">Issues Found</h3>
                  <p className="text-sm text-gray-500">
                    The following issues need to be addressed in your schema
                  </p>
                </div>
                <div className="space-y-4">
                  {validation.errors.map((error: any, index: number) => (
                    <div
                      key={index}
                      className="bg-red-50 border border-red-200 rounded-md p-4"
                    >
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                        <h4 className="font-medium text-red-800">
                          Issue #{index + 1}
                        </h4>
                      </div>
                      <p className="mt-2 text-sm text-red-700">{error}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {validation.suggestions.length > 0 && (
            <Card>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold">Suggestions</h3>
                  <p className="text-sm text-gray-500">
                    Follow these suggestions to fix the issues
                  </p>
                </div>
                <div className="space-y-2">
                  {validation.suggestions.map((suggestion: any, index: number) => (
                    <div
                      key={index}
                      className="bg-blue-50 border border-blue-200 rounded-md p-4"
                    >
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-blue-500 mr-2" />
                        <p className="text-sm text-blue-700">{suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {schema && (
        <Card>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold">Application Schema</h3>
              <p className="text-sm text-gray-500">
                Complete overview of all tables and fields in your schema
              </p>
            </div>
            <div className="space-y-4">
              {schema.tables.map((table: any) => (
                <details key={table.id} className="border rounded-md">
                  <summary className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex items-center space-x-2">
                      <ChevronRight className="h-4 w-4" />
                      <span className="font-medium">{table.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {table.fields.length} fields
                    </span>
                  </summary>
                  <div className="p-4">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Field Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {table.fields.map((field: any) => (
                          <tr key={field.id}>
                            <td className="px-4 py-2 text-sm font-mono">{field.name}</td>
                            <td className="px-4 py-2 text-sm">{field.type}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {field.description || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
} 