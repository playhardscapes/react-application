require('dotenv').config();
const express = require('express');
const router = express.Router();
const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');
const fs = require('fs').promises;
const path = require('path');

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

sgMail.setApiKey(SENDGRID_API_KEY);
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// Add this function for saving proposals
const saveProposal = async (clientInfo, proposal) => {
    try {
        // Just create one proposals directory
        const proposalsDir = path.join(__dirname, '..', '..', 'proposals');
        await fs.mkdir(proposalsDir, { recursive: true });

        // Create filename with date and client name
        const date = new Date().toISOString().slice(0, 10); // Gets YYYY-MM-DD
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
    console.log('Full request body:', req.body); // Log entire request body

    try {
        const { to, subject, proposal, clientInfo } = req.body;

        // VERY detailed logging
        console.log('Received email request details:', {
            to: to || 'NO RECIPIENT',
            subject: subject || 'NO SUBJECT',
            clientInfoName: clientInfo?.name || 'NO CLIENT NAME',
            proposalLength: proposal ? proposal.length : 'NO PROPOSAL'
        });

        // More aggressive validation
        if (!to) {
            console.error('CRITICAL: No recipient email provided');
            return res.status(400).json({
                error: 'Recipient email is REQUIRED',
                details: 'No email address was provided in the request'
            });
        }

        if (!proposal) {
            console.error('CRITICAL: No proposal content');
            return res.status(400).json({
                error: 'Proposal content is REQUIRED',
                details: 'No proposal text was provided in the request'
            });
        }

        // Save proposal first
        try {
            const savedFile = await saveProposal(clientInfo, proposal);
            console.log('Proposal saved successfully:', savedFile);
        } catch (error) {
            console.error('Error saving proposal:', error);
            // Continue with email even if save fails
        }

        // Send to client
        const msgToClient = {
            to,
            from: 'patrick@playhardscapes.com',
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

        // Add error handling for email sending
        try {
            await Promise.all([
                sgMail.send(msgToClient),
                sgMail.send(msgToYou)
            ]);
        } catch (error) {
            console.error('FATAL EMAIL ERROR:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                fullError: error
            });
            res.status(500).json({
                error: 'Catastrophic email processing failure',
                details: error.message,
                stack: error.stack
            });
        }

        res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Unexpected email error:', error);
        res.status(500).json({
            error: 'Unexpected error in email processing',
            details: error.message
        });
    }
});

router.post('/send-sms', async (req, res) => {
    try {
        const { to, message } = req.body;

        // Validate phone number
        if (!to) {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        console.log('Sending SMS to:', to);

        // Format phone number - with error handling
        let formattedPhone;
        try {
            formattedPhone = to.startsWith('+1') ? to : `+1${to.replace(/\D/g, '')}`;
        } catch (error) {
            return res.status(400).json({ error: 'Invalid phone number format' });
        }

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
