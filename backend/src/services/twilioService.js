// twilioService.js
const twilio = require('twilio');

const twilioService = {
  sendSMS(to, message) {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    return client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
  },

  async handleIncomingSMS(from, message) {
    // Automatically log incoming SMS
    // Find or create client
    // Save to communications table
  }
};