export interface LocalizedText {
  et: string;
  en: string;
}

export interface BaseRecord {
  id: string;
  isActive: boolean;
}

export interface Category extends BaseRecord {
  categoryId: string;
  text: LocalizedText;
  description: LocalizedText;
  companyType: string[];
  questions: string[];
}

export interface Question extends BaseRecord {
  questionId: string;
  text: LocalizedText;
  answers: string[];
  categories: string[];
}

export interface Answer extends BaseRecord {
  answerId: string;
  text: LocalizedText;
  description?: LocalizedText;
  score: number;
  questions: string[];
}

export interface CompanyType extends BaseRecord {
  companyTypeId: string;
  text: LocalizedText;
  description: LocalizedText;
}

export interface AssessmentResponse extends BaseRecord {
  responseId: string;
  contactName: string;
  contactEmail: string;
  companyName: string;
  companyType: string;
  initialGoal: string;
  status: 'New' | 'In Progress' | 'Completed';
  content: string;
  createdAt: string;
  updatedAt: string;
}

export class AirtableError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AirtableError';
  }
} 