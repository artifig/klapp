import { NextResponse } from "next/server";
import Airtable from "airtable";

const base = new Airtable({ apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN }).base(process.env.AIRTABLE_BASE_ID!);

interface AssessmentResponse {
  questionId: string;
  answerId: string;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { responses }: { responses: AssessmentResponse[] } = await request.json();
    const { id } = params;

    // Get the current assessment
    const record = await base('AssessmentResponses').find(id);
    const currentContent = JSON.parse(record.get('responseContent') as string);

    // Update the responses
    const updatedContent = {
      ...currentContent,
      responses,
    };

    // Save back to Airtable
    await base('AssessmentResponses').update(id, {
      responseStatus: 'In Progress',
      responseContent: JSON.stringify(updatedContent),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating assessment responses:', error);
    return NextResponse.json(
      { error: 'Failed to update responses' },
      { status: 500 }
    );
  }
} 