'use client';

import { useState } from 'react';
import {
    type AirtableSchema,
    type TableValidation,
    type NumberField,
    type RecordLinksField,
    type AirtableField
} from '@/lib/airtable/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function isNumberField(field: AirtableField): field is NumberField {
    return field.type === 'number';
}

function isRecordLinksField(field: AirtableField): field is RecordLinksField {
    return field.type === 'multipleRecordLinks';
}

export function Client() {
    const [schema, setSchema] = useState<AirtableSchema | null>(null);
    const [validation, setValidation] = useState<TableValidation | null>(null);
    const [loading, setLoading] = useState(false);
    const [showSchema, setShowSchema] = useState(false);

    const fetchSchema = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/airtable/schema');
            if (!response.ok) {
                throw new Error('Failed to fetch schema');
            }
            const data = await response.json();
            setSchema(data);

            const validationResponse = await fetch('/api/airtable/validate');
            if (!validationResponse.ok) {
                throw new Error('Failed to validate schema');
            }
            const validationData = await validationResponse.json();
            setValidation(validationData);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Airtable Schema Validation</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Button
                            onClick={fetchSchema}
                            disabled={loading}
                        >
                            {loading ? 'Validating...' : 'Validate Schema'}
                        </Button>

                        {validation && Object.entries(validation).map(([tableName, result]) => (
                            <div key={tableName} className="mt-4">
                                <h3 className="text-lg font-semibold mb-2">
                                    {tableName}: {result.isValid ? '✅ Valid' : '❌ Invalid'}
                                </h3>
                                {!result.isValid && (
                                    <div className="bg-red-50 p-4 rounded-md">
                                        <h4 className="text-red-800 font-medium mb-2">Validation Errors:</h4>
                                        {result.errors.missingFields && (
                                            <div className="mb-2">
                                                <h5 className="text-red-700 font-medium">Missing Fields:</h5>
                                                <ul className="list-disc pl-5 text-red-700">
                                                    {result.errors.missingFields.map((field, index) => (
                                                        <li key={index}>{field}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {result.errors.extraFields && (
                                            <div className="mb-2">
                                                <h5 className="text-red-700 font-medium">Extra Fields:</h5>
                                                <ul className="list-disc pl-5 text-red-700">
                                                    {result.errors.extraFields.map((field, index) => (
                                                        <li key={index}>{field}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {result.errors.typeErrors && (
                                            <div className="mb-2">
                                                <h5 className="text-red-700 font-medium">Type Errors:</h5>
                                                <ul className="list-disc pl-5 text-red-700">
                                                    {result.errors.typeErrors.map((error, index) => (
                                                        <li key={index}>
                                                            {error.field}: expected {error.expectedType}, got {error.actualType}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        {schema && (
                            <div className="mt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowSchema(!showSchema)}
                                    className="mb-2"
                                >
                                    {showSchema ? 'Hide Schema' : 'Show Schema'}
                                </Button>

                                {showSchema && (
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <h4 className="font-medium mb-2">Schema Details:</h4>
                                        {schema.tables.map((table) => (
                                            <div key={table.id} className="mb-4">
                                                <h5 className="font-semibold text-blue-600">{table.name}</h5>
                                                <div className="pl-4">
                                                    <p className="text-sm text-gray-600">ID: {table.id}</p>
                                                    <p className="text-sm text-gray-600">Primary Field: {table.primaryFieldId}</p>
                                                    <div className="mt-2">
                                                        <p className="text-sm font-medium">Fields:</p>
                                                        <ul className="list-disc pl-5 text-sm">
                                                            {table.fields.map((field) => (
                                                                <li key={field.id} className="mb-1">
                                                                    <span className="font-medium">{field.name}</span>
                                                                    <span className="text-gray-600"> ({field.type})</span>
                                                                    {isNumberField(field) && field.options && (
                                                                        <div className="text-xs text-gray-500 pl-2">
                                                                            Precision: {field.options.precision}
                                                                        </div>
                                                                    )}
                                                                    {isRecordLinksField(field) && field.options && (
                                                                        <div className="text-xs text-gray-500 pl-2">
                                                                            Links to: {field.options.linkedTableId}
                                                                        </div>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 