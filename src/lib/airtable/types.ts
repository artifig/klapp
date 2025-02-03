// Add this at the top of the file
export class AirtableError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AirtableError';
  }
}

// Base field interface
export interface BaseField {
  id: string;
  name: string;
}

// Single line text field
export interface SingleLineTextField extends BaseField {
  type: 'singleLineText';
}

// Multiline text field
export interface MultilineTextField extends BaseField {
  type: 'multilineText';
}

// Number field
export interface NumberField extends BaseField {
  type: 'number';
  options?: {
    precision: number;
  };
}

// Checkbox field
export interface CheckboxField extends BaseField {
  type: 'checkbox';
  options?: {
    icon: string;
    color: string;
  };
}

// Record links field
export interface RecordLinksField extends BaseField {
  type: 'multipleRecordLinks';
  options: {
    linkedTableId: string;
    isReversed: boolean;
    prefersSingleRecordLink: boolean;
    inverseLinkFieldId: string;
  };
}

// DateTime field (for both created time and last modified time)
export interface DateTimeField extends BaseField {
  type: 'createdTime' | 'lastModifiedTime';
  options: {
    result: {
      type: string;
      options: {
        dateFormat: {
          name: string;
          format: string;
        };
        timeFormat: {
          name: string;
          format: string;
        };
        timeZone: string;
      };
    };
  };
}

export type AirtableField = 
  | SingleLineTextField 
  | MultilineTextField 
  | NumberField 
  | CheckboxField 
  | RecordLinksField 
  | DateTimeField;

export interface AirtableView {
  id: string;
  name: string;
  type: string;
}

export interface AirtableTable {
  id: string;
  name: string;
  primaryFieldId: string;
  fields: AirtableField[];
  views: AirtableView[];
}

// Main tables from the schema
export interface MethodCategories extends AirtableTable {
  fields: [
    SingleLineTextField, // categoryId
    SingleLineTextField, // categoryText_et
    MultilineTextField,  // categoryDescription_et
    SingleLineTextField, // categoryText_en
    MultilineTextField,  // categoryDescription_en
    CheckboxField,       // isActive
    RecordLinksField,    // SolutionProviders
    RecordLinksField,    // MethodCompanyTypes
    RecordLinksField,    // MethodQuestions
    RecordLinksField,    // MethodSolutions
    RecordLinksField,    // MethodRecommendations
    DateTimeField,       // Created time
    DateTimeField        // Last modified time
  ];
}

export interface MethodQuestions extends AirtableTable {
  fields: [
    SingleLineTextField, // questionId
    MultilineTextField,  // questionText_et
    MultilineTextField,  // questionText_en
    CheckboxField,       // isActive
    RecordLinksField,    // MethodCategories
    RecordLinksField,    // MethodAnswers
    DateTimeField,       // Created time
    DateTimeField        // Last modified time
  ];
}

export interface MethodAnswers extends AirtableTable {
  fields: [
    SingleLineTextField, // answerId
    SingleLineTextField, // answerText_et
    MultilineTextField,  // answerDescription_et
    SingleLineTextField, // answerText_en
    MultilineTextField,  // answerDescription_en
    NumberField,        // answerScore
    CheckboxField,      // isActive
    RecordLinksField,   // MethodQuestions
    DateTimeField,      // Created time
    DateTimeField       // Last modified time
  ];
}

export interface MethodSolutionLevels extends AirtableTable {
  fields: [
    SingleLineTextField, // solutionLevelId
    SingleLineTextField, // levelText_et
    MultilineTextField,  // levelDescription_et
    SingleLineTextField, // levelText_en
    MultilineTextField,  // levelDescription_en
    NumberField,        // levelScore_lowerThreshold
    NumberField,        // levelScore_upperThreshold
    CheckboxField,      // isActive
    RecordLinksField,   // SolutionProviders
    RecordLinksField,   // MethodExampleSolutions
    RecordLinksField,   // MethodRecommendations
    DateTimeField,      // Created time
    DateTimeField       // Last modified time
  ];
}

export interface MethodExampleSolutions extends AirtableTable {
  fields: [
    SingleLineTextField, // exampleSolutionId
    SingleLineTextField, // exampleSolutionText_et
    MultilineTextField,  // exampleSolutionDescription_et
    SingleLineTextField, // exampleSolutionText_en
    MultilineTextField,  // exampleSolutionDescription_en
    CheckboxField,      // isActive
    RecordLinksField,   // SolutionProviders
    RecordLinksField,   // MethodCompanyTypes
    RecordLinksField,   // MethodCategories
    RecordLinksField,   // MethodSolutionLevels
    DateTimeField,      // Created time
    DateTimeField       // Last modified time
  ];
}

export interface MethodRecommendations extends AirtableTable {
  fields: [
    SingleLineTextField, // reccomendationId
    SingleLineTextField, // recommendationText_et
    MultilineTextField,  // recommendationDescription_et
    SingleLineTextField, // recommendationText_en
    MultilineTextField,  // recommendationDescription_en
    CheckboxField,      // isActive
    RecordLinksField,   // SolutionProviders
    RecordLinksField,   // MethodCompanyTypes
    RecordLinksField,   // MethodCategories
    RecordLinksField,   // MethodSolutionLevels
    DateTimeField,      // Created time
    DateTimeField       // Last modified time
  ];
}

export interface MethodCompanyTypes extends AirtableTable {
  fields: [
    SingleLineTextField, // companyTypeId
    SingleLineTextField, // companyTypeText_et
    MultilineTextField,  // companyTypeDescription_et
    SingleLineTextField, // companyTypeText_en
    MultilineTextField,  // companyTypeDescription_en
    CheckboxField,      // isActive
    RecordLinksField,   // AssessmentResponses
    RecordLinksField,   // SolutionProviders
    RecordLinksField,   // MethodCategories
    RecordLinksField,   // MethodExampleSolutions
    RecordLinksField,   // MethodRecommendations
    DateTimeField,      // Created time
    DateTimeField       // Last modified time
  ];
}

// Specific table interfaces based on the schema
export interface SolutionProvider {
  providerId: string;
  providerName_et: string;
  providerDescription_et: string;
  providerName_en: string;
  providerDescription_en: string;
  isActive: boolean;
  MethodCompanyTypes?: string[];
  MethodCategories?: string[];
  MethodExampleSolutions?: string[];
  MethodRecommendations?: string[];
}

export interface MethodCompanyType {
  companyTypeId: string;
  companyTypeText_et: string;
  companyTypeDescription_et: string;
  companyTypeText_en: string;
  companyTypeDescription_en: string;
  isActive: boolean;
  AssessmentResponses?: string[];
  SolutionProviders?: string[];
  MethodCategories?: string[];
  MethodExampleSolutions?: string[];
  MethodRecommendations?: string[];
}

export interface MethodCategory {
  categoryId: string;
  categoryText_et: string;
  categoryDescription_et: string;
  categoryText_en: string;
  categoryDescription_en: string;
  isActive: boolean;
  SolutionProviders?: string[];
  MethodCompanyTypes?: string[];
  MethodQuestions?: string[];
  MethodSolutions?: string[];
  MethodRecommendations?: string[];
}

export interface MethodQuestion {
  questionId: string;
  questionText_et: string;
  questionText_en: string;
  isActive: boolean;
  MethodCategories?: string[];
  MethodAnswers?: string[];
}

export interface MethodAnswer {
  answerId: string;
  answerText_et: string;
  answerDescription_et: string;
  answerText_en: string;
  answerDescription_en: string;
  answerScore: number;
  isActive: boolean;
  MethodQuestions?: string[];
}

export interface MethodSolutionLevel {
  solutionLevelId: string;
  levelText_et: string;
  levelDescription_et: string;
  levelText_en: string;
  levelDescription_en: string;
  levelScore_lowerThreshold: number;
  levelScore_upperThreshold: number;
  isActive: boolean;
  SolutionProviders?: string[];
  MethodExampleSolutions?: string[];
  MethodRecommendations?: string[];
}

export interface MethodExampleSolution {
  exampleSolutionId: string;
  exampleSolutionText_et: string;
  exampleSolutionDescription_et: string;
  exampleSolutionText_en: string;
  exampleSolutionDescription_en: string;
  isActive: boolean;
  SolutionProviders?: string[];
  MethodCompanyTypes?: string[];
  MethodCategories?: string[];
  MethodSolutionLevels?: string[];
}

export interface MethodRecommendation {
  reccomendationId: string; // Note: This matches the typo in the schema
  recommendationText_et: string;
  recommendationDescription_et: string;
  recommendationText_en: string;
  recommendationDescription_en: string;
  isActive: boolean;
  SolutionProviders?: string[];
  MethodCompanyTypes?: string[];
  MethodCategories?: string[];
  MethodSolutionLevels?: string[];
}

// Schema validation types
export interface ValidationResult {
  isValid: boolean;
  errors: {
    missingFields?: string[];
    extraFields?: string[];
    typeErrors?: { field: string; expectedType: string; actualType: string }[];
  };
}

export interface TableValidation {
  [tableName: string]: ValidationResult;
}

export interface AirtableSchema {
  tables: AirtableTable[];
}

// Add these interfaces near the top of the file
export interface LocalizedText {
  et: string;
  en: string;
}

export interface Category {
  id: string;
  text: LocalizedText;
  description?: LocalizedText;
  isActive: boolean;
  companyType: string[];
  questions: string[];
}

export interface Question {
  id: string;
  text: LocalizedText;
  isActive: boolean;
  answers: string[];
  categories: string[];
}

export interface Answer {
  id: string;
  text: LocalizedText;
  description?: LocalizedText;
  score: number;
  isActive: boolean;
  questions: string[];
}

// Add this with the other interfaces
export interface AssessmentResponse {
  id: string;
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
  isActive: boolean;
}

// Add this with the other interfaces
export interface CompanyType {
  id: string;
  companyTypeId: string;
  text: LocalizedText;
  description: LocalizedText;
  isActive: boolean;
} 