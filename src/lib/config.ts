if (!process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN) {
  throw new Error('AIRTABLE_PERSONAL_ACCESS_TOKEN is not set in environment variables');
}

if (!process.env.AIRTABLE_BASE_ID) {
  throw new Error('AIRTABLE_BASE_ID is not set in environment variables');
}

export const config = {
  airtable: {
    apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN,
    baseId: process.env.AIRTABLE_BASE_ID,
  },
} as const; 