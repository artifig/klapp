/**
 * Safely get environment variables with optional fallbacks
 */
export function getEnv(key: string, fallback?: string): string {
  const value = process.env[key];
  
  if (value === undefined || value === null || value === '') {
    if (fallback !== undefined) {
      return fallback;
    }
    
    if (typeof window !== 'undefined') {
      // Client-side, we'll return empty string
      console.warn(`Environment variable ${key} is not set`);
      return '';
    }
    
    // Server-side, we'll throw an error
    throw new Error(`${key} is not set in environment variables`);
  }
  
  return value;
}

/**
 * Check if a required environment variable is available
 */
export function checkEnv(key: string): boolean {
  try {
    const value = getEnv(key);
    return value !== '';
  } catch (_) {
    // Ignore the specific error - we just want to know if it's available
    return false;
  }
}

/**
 * Safely access Airtable-specific environment variables
 */
export const airtableEnv = {
  get accessToken(): string {
    return getEnv('AIRTABLE_PERSONAL_ACCESS_TOKEN');
  },
  get baseId(): string {
    return getEnv('AIRTABLE_BASE_ID', 'default_base_id');
  },
  // Add other Airtable-specific env vars here
  
  // Check if all required Airtable environment variables are set
  isConfigured(): boolean {
    try {
      return this.accessToken !== '' && this.baseId !== '';
    } catch (_) {
      // Ignore the specific error - we just want to know if it's configured
      return false;
    }
  }
}; 