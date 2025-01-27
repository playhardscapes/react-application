const API_BASE_URL = '/api/emails';

const emailService = {
  async fetchEmails(params = {}) {
    const token = localStorage.getItem('token'); // Assuming token is stored this way
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });

    const response = await fetch(`${API_BASE_URL}?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to fetch emails');
    }
    
    return response.json();
  },

  async sendEmail(emailData) {
    const token = localStorage.getItem('token');
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
  }
};

export default emailService;