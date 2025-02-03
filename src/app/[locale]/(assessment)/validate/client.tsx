'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { getAirtableSchema, type AirtableSchema } from '@/lib/airtable';
import { useTranslations } from 'next-intl';

// Types from the original page
interface ValidationResult {
    tableName: string;
    isValid: boolean;
    missingFields: string[];
    extraFields: string[];
    fieldTypes: Record<string, string>;
}

interface TableValidation {
    name: string;
    required: string[];
    optional?: string[];
    fieldTypes?: Record<string, string>;
}

const expectedTables: TableValidation[] = [
    {
        name: 'MethodCategories',
        required: [
            'categoryId',
            'categoryText_et',
            'categoryText_en',
            'categoryDescription_et',
            'categoryDescription_en',
            'isActive',
            'MethodQuestions',
            'MethodCompanyTypes'
        ],
        fieldTypes: {
            'categoryId': 'singleLineText',
            'categoryText_et': 'singleLineText',
            'categoryText_en': 'singleLineText',
            'categoryDescription_et': 'multilineText',
            'categoryDescription_en': 'multilineText',
            'isActive': 'checkbox',
            'MethodQuestions': 'multipleRecordLinks',
            'MethodCompanyTypes': 'multipleRecordLinks'
        }
    },
    {
        name: 'MethodQuestions',
        required: [
            'questionId',
            'questionText_et',
            'questionText_en',
            'isActive',
            'MethodCategories',
            'MethodAnswers'
        ],
        fieldTypes: {
            'questionId': 'singleLineText',
            'questionText_et': 'multilineText',
            'questionText_en': 'multilineText',
            'isActive': 'checkbox',
            'MethodCategories': 'multipleRecordLinks',
            'MethodAnswers': 'multipleRecordLinks'
        }
    },
    {
        name: 'MethodAnswers',
        required: [
            'answerId',
            'answerText_et',
            'answerText_en',
            'answerScore',
            'isActive',
            'MethodQuestions'
        ],
        fieldTypes: {
            'answerId': 'singleLineText',
            'answerText_et': 'singleLineText',
            'answerText_en': 'singleLineText',
            'answerDescription_et': 'multilineText',
            'answerDescription_en': 'multilineText',
            'answerScore': 'number',
            'isActive': 'checkbox',
            'MethodQuestions': 'multipleRecordLinks'
        }
    }
];

function ValidationCard({ result }: { result: ValidationResult }) {
    const t = useTranslations('validate');
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">{result.tableName}</h3>
                        {result.isValid ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {t('valid')}
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {t('invalid')}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        {isExpanded ? (
                            <ChevronUp className="h-5 w-5" />
                        ) : (
                            <ChevronDown className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="px-6 py-4 bg-gray-50">
                    {result.missingFields.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">{t('missingFields')}</h4>
                            <ul className="list-disc list-inside text-sm text-red-600">
                                {result.missingFields.map(field => (
                                    <li key={field}>{field}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {result.extraFields.length > 0 && (
                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">{t('extraFields')}</h4>
                            <ul className="list-disc list-inside text-sm text-yellow-600">
                                {result.extraFields.map(field => (
                                    <li key={field}>{field}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">{t('fieldTypes')}</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(result.fieldTypes).map(([field, type]) => (
                                <div key={field} className="flex justify-between">
                                    <span className="text-gray-600">{field}</span>
                                    <span className="text-gray-900">{type}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SchemaReferenceSection({ schema }: { schema: AirtableSchema }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="mt-12 bg-white rounded-lg shadow-sm overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors border-b"
            >
                <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-semibold text-gray-900">Full Base Schema Reference</h2>
                    <span className="text-sm text-gray-500">({schema.tables.length} tables)</span>
                </div>
                {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
            </button>

            {isExpanded && (
                <div className="divide-y divide-gray-100">
                    {schema.tables.map((table) => (
                        <div key={table.id} className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">{table.name}</h3>
                                <span className="text-sm text-gray-500">{table.fields.length} fields</span>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-sm">
                                {table.fields.map((field) => (
                                    <div key={field.id} className="space-y-1">
                                        <div className="font-medium text-gray-900">{field.name}</div>
                                        <div className="text-gray-500">{field.type}</div>
                                        {field.description && (
                                            <div className="text-gray-400 text-xs">{field.description}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function Client() {
    const t = useTranslations('validate');
    const [results, setResults] = useState<ValidationResult[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [schema, setSchema] = useState<AirtableSchema | null>(null);

    // Calculate overall validation status
    const totalTables = results.length;
    const validTables = results.filter(r => r.isValid).length;

    useEffect(() => {
        const validateSchema = async () => {
            try {
                setIsLoading(true);
                const fetchedSchema = await getAirtableSchema();
                setSchema(fetchedSchema);
                const validationResults: ValidationResult[] = [];

                // Validate each expected table
                for (const expectedTable of expectedTables) {
                    const table = fetchedSchema.tables.find(t => t.name === expectedTable.name);

                    if (!table) {
                        validationResults.push({
                            tableName: expectedTable.name,
                            isValid: false,
                            missingFields: expectedTable.required,
                            extraFields: [],
                            fieldTypes: {}
                        });
                        continue;
                    }

                    // Create sets for efficient lookup
                    const tableFields = new Set(table.fields.map(f => f.name));
                    const expectedFieldSet = new Set(expectedTable.required);

                    // Find missing and extra fields
                    const missingFields = expectedTable.required.filter(field => !tableFields.has(field));
                    const extraFields = table.fields
                        .filter(f => !expectedFieldSet.has(f.name))
                        .map(f => f.name);

                    // Check field types
                    const fieldTypes: Record<string, string> = {};
                    table.fields.forEach(field => {
                        fieldTypes[field.name] = field.type;
                    });

                    // Validate field types
                    const hasInvalidTypes = expectedTable.fieldTypes ?
                        Object.entries(expectedTable.fieldTypes).some(([fieldName, expectedType]) => {
                            const actualType = fieldTypes[fieldName];
                            return actualType && actualType !== expectedType;
                        }) : false;

                    validationResults.push({
                        tableName: expectedTable.name,
                        isValid: missingFields.length === 0 && !hasInvalidTypes,
                        missingFields,
                        extraFields,
                        fieldTypes
                    });
                }

                setResults(validationResults);
                setError(null);
            } catch (err) {
                console.error('Error validating schema:', err);
                setError(err instanceof Error ? err.message : 'Unknown error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        validateSchema();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">{t('loading')}</h2>
                    <p className="text-gray-600">{t('validating')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center text-red-600">
                    <AlertCircle className="h-8 w-8 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">{t('error')}</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('title')}</h1>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="grid grid-cols-3 gap-6 text-center">
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{totalTables}</div>
                                <div className="text-sm text-gray-500">Total Tables</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">{validTables}</div>
                                <div className="text-sm text-gray-500">Valid Tables</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-red-600">{totalTables - validTables}</div>
                                <div className="text-sm text-gray-500">Tables with Issues</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {results.map((result, index) => (
                        <ValidationCard key={index} result={result} />
                    ))}
                </div>

                {schema && <SchemaReferenceSection schema={schema} />}
            </div>
        </div>
    );
} 