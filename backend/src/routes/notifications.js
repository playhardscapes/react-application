// backend/src/routes/notifications.js
require('dotenv').config();
const express = require('express');
const router = express.Router();
const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');
const path = require('path');
const fs = require('fs').promises;

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
sgMail.setApiKey(SENDGRID_API_KEY);

// Initialize Twilio
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Add this function for saving proposals
const saveProposal = async (clientInfo, proposal) => {
    try {
        // Create proposals directory
        const proposalsDir = path.join(__dirname, '..', '..', 'proposals');
        await fs.mkdir(proposalsDir, { recursive: true });

        // Create filename with date and client name
        const date = new Date().toISOString().slice(0, 10); 
        const cleanClientName = (clientInfo?.name || 'unnamed').replace(/[^a-z0-9]/gi, '-');
        const fileName = `${date}-${cleanClientName}.json`;
        const fullPath = path.join(proposalsDir, fileName);

        // Save data
        const dataToSave = {
            date,
            clientInfo,
            proposal,
            metadata: {
                clientEmail: clientInfo?.email,
                clientPhone: clientInfo?.phone,
                projectLocation: clientInfo?.projectLocation
            }
        };

        await fs.writeFile(fullPath, JSON.stringify(dataToSave, null, 2));
        console.log(`Proposal saved to:`, fullPath);
        return fileName;
    } catch (error) {
        console.error('Error saving proposal:', error);
        throw error;
    }
};

router.post('/send-email', async (req, res) => {
    console.log('Starting email send process...');
    try {
      const { to, subject, proposal, clientInfo } = req.body;
      
      console.log('Email request details:', {
        to,
        subject,
        clientName: clientInfo?.name,
        hasProposal: !!proposal
      });
  
      // Verify SendGrid setup
      if (!process.env.SENDGRID_API_KEY) {
        throw new Error('SendGrid API key not configured');
      }
  
      // Send to client
      const msgToClient = {
        to,
        from: {
          email: 'patrick@playhardscapes.com',
          name: 'Patrick at Play Hardscapes'
        },
        subject: subject || 'Your Court Surfacing Proposal',
        html: proposal,
      };
  
      // Send copy to yourself
      const msgToYou = {
        to: 'patrick@playhardscapes.com',
        from: 'patrick@playhardscapes.com',
        subject: `Quote Sent - ${clientInfo?.name || 'Unnamed Client'}`,
        html: `
          <h2>Proposal sent to client:</h2>
          <p><strong>Client:</strong> ${clientInfo?.name || 'Unnamed'}</p>
          <p><strong>Email:</strong> ${to}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          <hr>
          ${proposal}
        `
      };
  
      console.log('Attempting to send emails...');
      
      try {
        await sgMail.send(msgToClient);
        console.log('Client email sent successfully');
      } catch (clientEmailError) {
        console.error('Error sending client email:', clientEmailError);
        if (clientEmailError.response) {
          console.error('SendGrid response:', clientEmailError.response.body);
        }
        throw clientEmailError;
      }
  
      try {
        await sgMail.send(msgToYou);
        console.log('Copy email sent successfully');
      } catch (copyEmailError) {
        console.error('Error sending copy email:', copyEmailError);
        // Don't throw here since client email was sent
      }
  
      res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
      console.error('Email process error:', error);
      res.status(500).json({
        error: 'Failed to send email',
        details: error.message,
        sendgridError: error.response?.body
      });
    }
  });

router.post('/send-sms', async (req, res) => {
    try {
        const { to, message } = req.body;

        // Format phone number
        const formattedPhone = to.startsWith('+1') ? to : `+1${to.replace(/\D/g, '')}`;

        await twilioClient.messages.create({
            body: message || 'Your court surfacing proposal has been sent to your email!',
            from: '+18668465561',
            to: formattedPhone
        });

        res.json({ success: true, message: 'SMS sent successfully' });
    } catch (error) {
        console.error('SMS error:', error);
        res.status(500).json({
            error: 'Failed to send SMS',
            details: error.message
        });
    }
});

module.exports = router;