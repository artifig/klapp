import { getAirtableSchema } from '@/lib/airtable/validation';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const schema = await getAirtableSchema();
    return NextResponse.json(schema);
  } catch (error) {
    console.error('Error in /api/airtable/schema:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Airtable schema' },
      { status: 500 }
    );
  }
} 