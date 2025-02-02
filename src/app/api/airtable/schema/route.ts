import { NextResponse } from 'next/server';
import { getAirtableSchema } from '@/lib/airtable';

export async function GET() {
  try {
    const schema = await getAirtableSchema();
    return NextResponse.json(schema);
  } catch (error) {
    console.error('Failed to fetch Airtable schema:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schema' },
      { status: 500 }
    );
  }
} 