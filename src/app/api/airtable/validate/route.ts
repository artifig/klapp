import { NextResponse } from 'next/server';
import { validateAirtableSchema } from '@/lib/airtable';

export async function GET() {
  try {
    const validation = await validateAirtableSchema();
    return NextResponse.json(validation);
  } catch (error) {
    console.error('Failed to validate Airtable schema:', error);
    return NextResponse.json(
      { error: 'Failed to validate schema' },
      { status: 500 }
    );
  }
} 