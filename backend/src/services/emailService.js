// src/services/emailService.js
import { 
  fetchAttachmentsFromEmail, 
  parseAttachments 
} from '../utils/emailUtils';
const API_BASE_URL = '/api/emails';
const token = localStorage.getItem('token');


const emailService = {
  async fetchEmails(params = {}) {
    try {
      const { 
        folder = 'inbox', 
        page = 1, 
        limit = 20, 
        search = '',
        category
      } = params;
  
      const queryParams = new URLSearchParams({
        folder,
        page: page.toString(),
        limit: limit.toString(),
        search
      });
  
      if (category) {
        queryParams.append('category', category);
      }
  
      const response = await fetch(`${API_BASE_URL}?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to fetch emails');
      }
      
      const data = await response.json();
      
      // Process emails to add extra parsing if needed
      data.emails = data.emails.map(email => ({
        ...email,
        parsedAttachments: parseAttachments(email.attachments)
      }));
  
      return data;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  },

  async sendEmail(emailData) {
    try {
      const response = await fetch(`${API_BASE_URL}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to send email');
      }

      return response.json();
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },

  async replyToEmail(emailId, replyData) {
    try {
      async replyToEmail(emailId, replyData) {
        try {
          const response = await fetch(`${API_BASE_URL}/${emailId}/reply`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(replyData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to reply to email');
      }

      return response.json();
    } catch (error) {
      console.error('Error replying to email:', error);
      throw error;
    },
  

    async fetchEmailById(emailId) {
      try {
        const response = await fetch(`${API_BASE_URL}/${emailId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
        throw new Error(error.details || 'Failed to fetch email');
      }
      
      const email = await response.json();

      // Fetch and parse attachments if they exist
      if (email.attachments) {
        email.parsedAttachments = await fetchAttachmentsFromEmail(email);
      }

      return email;
    } catch (error) {
      console.error('Error fetching email by ID:', error);
      throw error;
    }
  },

  formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  },

  categorizeEmail(email) {
    // Implement email categorization logic
    if (email.sender_email.includes('vendor')) return 'vendor';
    if (email.sender_email.includes('client')) return 'client';
    return 'uncategorized';
  },

  extractEmailPreview(email) {
    // Extract preview text, stripping HTML
    const previewText = email.html_body 
      ? email.html_body.replace(/<[^>]*>/g, '').slice(0, 100) 
      : (email.body || '').slice(0, 100);
    return previewText;
  }
};

export default emailService;