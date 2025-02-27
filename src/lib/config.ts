// Default configuration with fallbacks for development
const isDev = process.env.NODE_ENV === 'development';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// In development or when running in the browser, provide mock values if env vars are missing
const getConfigValue = (envVar: string | undefined, defaultValue: string): string => {
  if (envVar) return envVar;
  
  if (isDev || isBrowser) {
    console.warn(`${defaultValue.split(':')[0]} is not set in environment variables, using mock value for development`);
    return defaultValue.split(':')[1];
  }
  
  throw new Error(`${defaultValue.split(':')[0]} is not set in environment variables`);
};

export const config = {
  airtable: {
    apiKey: getConfigValue(
      process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN, 
      "AIRTABLE_PERSONAL_ACCESS_TOKEN:mock_pat_value_for_development"
    ),
    baseId: getConfigValue(
      process.env.AIRTABLE_BASE_ID, 
      "AIRTABLE_BASE_ID:mock_base_id_for_development"
    ),
  },
} as const; 