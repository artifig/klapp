import { NextResponse } from "next/server";
import { createAssessmentResponse } from "@/lib/airtable";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { initialGoal, companyType } = body;

    // Create a new assessment response using our utility function
    const id = await createAssessmentResponse({
      initialGoal,
      companyType
    });

    return NextResponse.json({ id });
  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      { error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
} 