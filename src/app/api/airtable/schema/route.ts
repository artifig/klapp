import { getAirtableSchema } from '@/lib/airtable/validation';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Fetching Airtable schema...');
    const schema = await getAirtableSchema();
    console.log('Successfully fetched schema:', JSON.stringify(schema, null, 2));
    return NextResponse.json(schema);
  } catch (error) {
    console.error('Error in /api/airtable/schema:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return NextResponse.json(
      { error: 'Failed to fetch Airtable schema' },
      { status: 500 }
    );
  }
} 