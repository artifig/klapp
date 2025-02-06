import Airtable from 'airtable';

// Initialize Airtable with Personal Access Token
const base = new Airtable({
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN
}).base(process.env.AIRTABLE_BASE_ID!);

// Type definitions based on our Airtable schema
export interface CompanyType {
  id: string;
  companyTypeText_et: string;
  isActive: boolean;
}

export interface AssessmentResponse {
  id: string;
  initialGoal: string;
  responseStatus: 'New' | 'In Progress' | 'Completed';
  responseContent: string;
  isActive: boolean;
}

// Utility functions
export async function getActiveCompanyTypes(): Promise<CompanyType[]> {
  try {
    const records = await base('MethodCompanyTypes')
      .select({
        filterByFormula: '{isActive} = 1',
        fields: ['companyTypeText_et', 'isActive']
      })
      .all();

    return records.map(record => ({
      id: record.id,
      companyTypeText_et: record.get('companyTypeText_et') as string,
      isActive: record.get('isActive') as boolean
    }));
  } catch (error) {
    console.error('Error fetching company types:', error);
    throw error;
  }
}

export async function createAssessmentResponse(data: {
  initialGoal: string;
  companyType: string;
}): Promise<string> {
  try {
    const record = await base('AssessmentResponses').create({
      initialGoal: data.initialGoal,
      responseStatus: 'New',
      isActive: true,
      responseContent: JSON.stringify({
        companyType: data.companyType,
        responses: [],
        scores: {},
        levels: {}
      })
    });

    return record.id;
  } catch (error) {
    console.error('Error creating assessment response:', error);
    throw error;
  }
}

export async function getAssessmentResponse(id: string): Promise<AssessmentResponse | null> {
  try {
    const record = await base('AssessmentResponses').find(id);
    
    return {
      id: record.id,
      initialGoal: record.get('initialGoal') as string,
      responseStatus: record.get('responseStatus') as 'New' | 'In Progress' | 'Completed',
      responseContent: record.get('responseContent') as string,
      isActive: record.get('isActive') as boolean
    };
  } catch (error) {
    console.error('Error fetching assessment response:', error);
    return null;
  }
} 