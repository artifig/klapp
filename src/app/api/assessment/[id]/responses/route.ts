import { NextResponse } from "next/server";
import Airtable from "airtable";

const base = new Airtable({
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN
}).base(process.env.AIRTABLE_BASE_ID!);

interface AssessmentResponse {
  questionId: string;
  answerId: string;
}

export async function POST(request: Request) {
  try {
    // Extract the assessment id from the URL pathname
    // For a URL like "/api/assessment/123/responses", splitting by '/' yields:
    // ["", "api", "assessment", "123", "responses"]
    const { pathname } = new URL(request.url);
    const segments = pathname.split('/');
    if (segments.length < 5) {
      throw new Error("Invalid URL - unable to extract assessment id.");
    }
    const id = segments[3];
    
    const { responses }: { responses: AssessmentResponse[] } = await request.json();
    
    // Get the current assessment record
    const record = await base("AssessmentResponses").find(id);
    const currentContent = JSON.parse(record.get("responseContent") as string);
    
    // Update the responses
    const updatedContent = {
      ...currentContent,
      responses,
    };
    
    // Save back to Airtable
    await base("AssessmentResponses").update(id, {
      responseStatus: "In Progress",
      responseContent: JSON.stringify(updatedContent),
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating assessment responses:", error);
    return NextResponse.json({ error: "Failed to update responses" }, { status: 500 });
  }
} 