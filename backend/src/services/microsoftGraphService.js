// src/services/microsoftGraphService.js
const { ClientSecretCredential } = require('@azure/identity');
const { Client } = require('@microsoft/microsoft-graph-client');
const db = require('../config/database');

class MicrosoftGraphEmailService {
  constructor() {
    this.credential = new ClientSecretCredential(
      process.env.AZURE_TENANT_ID,
      process.env.AZURE_CLIENT_ID,
      process.env.AZURE_CLIENT_SECRET
    );

    this.client = Client.initWithMiddleware({
      // New authProvider with getAccessToken for improved compatibility
      authProvider: {
        getAccessToken: async () => {
          const tokenResponse = await this.credential.getToken('https://graph.microsoft.com/.default');
          return tokenResponse.token;
        }
      }
    });

    // Retaining backward-compatible authProvider functionality
    this.legacyAuthProvider = async (done) => {
      try {
        const token = await this.credential.getToken('https://graph.microsoft.com/.default');
        done(null, token.token);
      } catch (error) {
        done(error, null);
      }
    };
  }

  async fetchEmails() {
    try {
      const userId = 'patrick@playhardscapes.com'; // Replace with the UPN or user ID
      const response = await this.client
        .api(`/users/${userId}/messages`)
        .select(['id', 'subject', 'sender', 'receivedDateTime', 'body'])
        .top(50) // Fetch last 50 emails
        .get();
  
      console.log('Fetched emails:', response.value);
      for (const email of response.value) {
        await this.saveEmail(email);
      }
  
      return response.value;
    } catch (error) {
      console.error('Error fetching emails:', error.message);
      throw error;
    }
  }

  async saveEmail(email) {
    try {
      const query = `
        INSERT INTO emails (
          microsoft_id,
          sender_email, 
          sender_name, 
          subject, 
          body, 
          html_body,
          received_at,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (microsoft_id) DO NOTHING
      `;

      const values = [
        email.id,
        email.sender?.emailAddress?.address,
        email.sender?.emailAddress?.name,
        email.subject,
        email.body.content,
        email.body.content,
        new Date(email.receivedDateTime),
        'unread'
      ];

      await db.query(query, values);
    } catch (error) {
      console.error('Error saving email:', error);
    }
  }

  // Background job to periodically fetch emails
  startEmailPolling(intervalMinutes = 5) {
    console.log('Polling interval started: Fetching emails every', intervalMinutes, 'minutes');
    return setInterval(async () => {
      try {
        await this.fetchEmails();
      } catch (error) {
        console.error('Email polling error:', error);
      }
    }, intervalMinutes * 60 * 1000);
  }
}

module.exports = new MicrosoftGraphEmailService();
