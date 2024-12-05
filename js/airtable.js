// airtable.js
const AIRTABLE_API_KEY = 'YOUR_API_KEY';
const BASE_ID = 'YOUR_BASE_ID';

class AirtableService {
    constructor() {
        this.baseUrl = `https://api.airtable.com/v0/${BASE_ID}`;
    }

    async fetchRecords(table) {
        try {
            const response = await fetch(`${this.baseUrl}/${table}`, {
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_API_KEY}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching from Airtable:', error);
            return null;
        }
    }

    async createRecord(table, fields) {
        try {
            const response = await fetch(`${this.baseUrl}/${table}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fields })
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating record:', error);
            return null;
        }
    }
}

const airtableService = new AirtableService();