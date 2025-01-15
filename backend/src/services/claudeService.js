// src/services/claudeService.js
const Anthropic = require('@anthropic-ai/sdk');

// Initialize the Anthropic client with your API key
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY, // Make sure this is set in your .env file
});

const claudeService = {
  async generateProposalContent(estimateData, clientData) {
    try {
      const message = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 4000,
        messages: [{
          role: "user",
          content: `Please write a professional proposal for a sports court construction project. 
          Use the following project details:

          Client: ${clientData.name}
          Project Location: ${estimateData.project_location}
          Court Details:
          ${estimateData.tennis_courts ? `- ${estimateData.tennis_courts} Tennis Courts` : ''}
          ${estimateData.pickleball_courts ? `- ${estimateData.pickleball_courts} Pickleball Courts` : ''}
          ${estimateData.basketball_courts ? `- ${estimateData.basketball_courts} Basketball Courts` : ''}
          Total Area: ${estimateData.square_footage} square feet
          Total Investment: $${estimateData.total_amount}

          Surface Work Required:
          - Pressure Wash: ${estimateData.needs_pressure_wash ? 'Yes' : 'No'}
          - Acid Wash: ${estimateData.needs_acid_wash ? 'Yes' : 'No'}
          - Patch Work: ${estimateData.patch_work_needed ? 'Yes' : 'No'}
          
          Equipment:
          ${estimateData.permanent_tennis_poles ? `- Tennis Posts: ${estimateData.permanent_tennis_poles} sets` : ''}
          ${estimateData.permanent_pickleball_poles ? `- Pickleball Posts: ${estimateData.permanent_pickleball_poles} sets` : ''}
          ${estimateData.mobile_pickleball_nets ? `- Mobile Pickleball Nets: ${estimateData.mobile_pickleball_nets}` : ''}

          Please structure the proposal with the following sections:
          1. Executive Summary
          2. Scope of Work
          3. Project Timeline
          4. Investment Details
          5. Terms and Conditions
          6. Next Steps

          Make it professional but friendly, emphasizing quality and value.`
        }]
      });

      return message.content[0].text;
    } catch (error) {
      console.error('Error generating proposal content:', error);
      throw error;
    }
  }
};

module.exports = claudeService;