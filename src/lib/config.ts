import { airtableEnv } from './env';

/**
 * Application configuration
 * Uses safe environment variable access via the env utility
 */
export const config = {
  airtable: {
    // Only try to get the API key if we're on the server or during build
    apiKey: typeof window === 'undefined' 
      ? airtableEnv.accessToken 
      : '', // Empty string on client side
    
    baseId: airtableEnv.baseId,
  },
} as const;

/**
 * Check if Airtable is properly configured
 */
export function isAirtableConfigured(): boolean {
  if (typeof window !== 'undefined') {
    // On client side, don't check (we shouldn't be making direct Airtable calls)
    return false;
  }
  
  try {
    return airtableEnv.isConfigured();
  } catch (_) {
    console.warn('Airtable environment variables not configured properly');
    return false;
  }
} 