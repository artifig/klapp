import { validateAirtableSchema } from '@/lib/airtable/validation';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Validating Airtable schema...');
    const result = await validateAirtableSchema();
    console.log('Validation result:', JSON.stringify(result, null, 2));
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/airtable/validate:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return NextResponse.json(
      { error: 'Failed to validate Airtable schema' },
      { status: 500 }
    );
  }
} 