import { validateAirtableSchema } from '@/lib/airtable/validation';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await validateAirtableSchema();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/airtable/validate:', error);
    return NextResponse.json(
      { error: 'Failed to validate Airtable schema' },
      { status: 500 }
    );
  }
} 