// scripts/start-email-polling.js
require('dotenv').config();
const emailService = require('../src/services/microsoftGraphService');

console.log('Starting Microsoft Graph email polling service...');
emailService.startEmailPolling();