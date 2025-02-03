'use client';

import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { AirtableSchema } from '@/lib/airtable/validation';
import { useState } from 'react';

export function Client() {
    const t = useTranslations('validate');
    const [schema, setSchema] = useState<AirtableSchema | null>(null);
    const [validation, setValidation] = useState<{ isValid: boolean; errors: string[] } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSchema = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/airtable/schema');
            if (!response.ok) throw new Error('Failed to fetch schema');
            const data = await response.json();
            setSchema(data);
        } catch (error) {
            setError('Failed to fetch Airtable schema');
            console.error('Error fetching schema:', error);
        } finally {
            setLoading(false);
        }
    };

    const validateSchema = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/airtable/validate');
            if (!response.ok) throw new Error('Failed to validate schema');
            const data = await response.json();
            setValidation(data);
        } catch (error) {
            setError('Failed to validate Airtable schema');
            console.error('Error validating schema:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>{t('schemaCard.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p>{t('schemaCard.description')}</p>
                        <Button
                            onClick={fetchSchema}
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? t('common.loading') : t('schemaCard.fetchButton')}
                        </Button>
                        {error && <p className="text-red-500">{error}</p>}
                        {schema && (
                            <pre className="mt-4 p-4 bg-gray-50 rounded-lg overflow-auto max-h-96">
                                {JSON.stringify(schema, null, 2)}
                            </pre>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>{t('validationCard.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p>{t('validationCard.description')}</p>
                        <Button
                            onClick={validateSchema}
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? t('common.loading') : t('validationCard.validateButton')}
                        </Button>
                        {validation && (
                            <div className={`mt-4 p-4 rounded-lg ${validation.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
                                <p className={validation.isValid ? 'text-green-700' : 'text-red-700'}>
                                    {validation.isValid ? t('validationCard.valid') : t('validationCard.invalid')}
                                </p>
                                {!validation.isValid && validation.errors.length > 0 && (
                                    <ul className="mt-2 list-disc list-inside text-red-600">
                                        {validation.errors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 