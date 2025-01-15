// src/services/aiService.js
const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function formatEstimateDetails(estimateData) {
    const details = [];
  
    // Project Dimensions
    if (estimateData.length && estimateData.width) {
      details.push(`Dimensions: ${estimateData.length}' × ${estimateData.width}'`);
      details.push(`Total Area: ${estimateData.square_footage} square feet`);
    }
  
    // Court Details
    const courts = [];
    if (estimateData.tennis_courts) {
      courts.push(`${estimateData.tennis_courts} Tennis Courts (${estimateData.tennis_court_color})`);
    }
    if (estimateData.pickleball_courts) {
      courts.push(`${estimateData.pickleball_courts} Pickleball Courts (Court: ${estimateData.pickleball_court_color}, Kitchen: ${estimateData.pickleball_kitchen_color})`);
    }
    if (estimateData.basketball_courts) {
      courts.push(`${estimateData.basketball_courts} Basketball Courts (${estimateData.basketball_court_type}, ${estimateData.basketball_court_color})`);
    }
    if (courts.length) {
      details.push('\nCourt Configuration:');
      details.push(...courts.map(court => `- ${court}`));
    }
  
    // Surface Work
    const surfaceWork = [];
    if (estimateData.needs_pressure_wash) surfaceWork.push('Pressure Washing');
    if (estimateData.needs_acid_wash) surfaceWork.push('Acid Washing');
    if (estimateData.patch_work_needed) {
      surfaceWork.push(`Patch Work (${estimateData.patch_work_gallons} gallons)`);
      if (estimateData.minor_crack_gallons) surfaceWork.push(`Minor Crack Repair (${estimateData.minor_crack_gallons} gallons)`);
      if (estimateData.major_crack_gallons) surfaceWork.push(`Major Crack Repair (${estimateData.major_crack_gallons} gallons)`);
    }
    if (surfaceWork.length) {
      details.push('\nSurface Preparation:');
      details.push(...surfaceWork.map(work => `- ${work}`));
    }
  
    // Surface Systems
    const surfaceSystems = [];
    if (estimateData.fiberglass_mesh_needed) {
      surfaceSystems.push(`Fiberglass Mesh System (${estimateData.fiberglass_mesh_area} sq ft)`);
    }
    if (estimateData.cushion_system_needed) {
      surfaceSystems.push(`Cushion System (${estimateData.cushion_system_area} sq ft)`);
    }
    if (surfaceSystems.length) {
      details.push('\nSurface Systems:');
      details.push(...surfaceSystems.map(system => `- ${system}`));
    }
  
    // Equipment
    const equipment = [];
    if (estimateData.permanent_tennis_poles) {
      equipment.push(`${estimateData.permanent_tennis_poles} sets of Tennis Posts`);
    }
    if (estimateData.permanent_pickleball_poles) {
      equipment.push(`${estimateData.permanent_pickleball_poles} sets of Pickleball Posts`);
    }
    if (estimateData.mobile_pickleball_nets) {
      equipment.push(`${estimateData.mobile_pickleball_nets} Mobile Pickleball Nets`);
    }
    if (estimateData.low_grade_windscreen) {
      equipment.push(`${estimateData.low_grade_windscreen} ft Low Grade Windscreen`);
    }
    if (estimateData.high_grade_windscreen) {
      equipment.push(`${estimateData.high_grade_windscreen} ft High Grade Windscreen`);
    }
    if (estimateData.basketball_systems && estimateData.basketball_systems.length) {
      equipment.push(`${estimateData.basketball_systems.length} Basketball Systems`);
    }
    if (equipment.length) {
      details.push('\nEquipment:');
      details.push(...equipment.map(item => `- ${item}`));
    }
  
    // Logistics
    if (estimateData.logistics) {
      details.push('\nLogistics:');
      details.push(`- ${estimateData.logistics.travelDays} Travel Days`);
      details.push(`- ${estimateData.logistics.numberOfTrips} Trips Required`);
      details.push(`- ${estimateData.logistics.generalLaborHours} Additional Labor Hours`);
      details.push(`- Distance: ${estimateData.logistics.distanceToSite} miles`);
      if (estimateData.logistics.logisticalNotes) {
        details.push(`- Notes: ${estimateData.logistics.logisticalNotes}`);
      }
    }
  
    return details.join('\n');
  }

const aiService = {
  async generateProposal(estimateData, clientData, model = 'claude') {
    try {
      const prompt = `Create a professional project proposal for a sports court construction project with the following details:

Client Information:
Name: ${clientData.name || 'Client'}
Location: ${estimateData.project_location || 'Project Location'}

Project Scope:
${formatEstimateDetails(estimateData)}
Total Area: ${estimateData.square_footage || 0} square feet
Total Investment: $${estimateData.total_amount?.toLocaleString() || 0}

Please create a formal proposal that includes:

1. Executive Summary
- Brief overview of the project
- Key benefits for the client

2. Detailed Scope of Work
- Surface preparation and court construction process
- Equipment installation details
- Quality assurance measures

3. Project Timeline
- Major milestones
- Estimated completion time
- Weather considerations

4. Investment Breakdown
- Total project cost: $${estimateData.total_amount?.toLocaleString() || 0}
- Payment schedule
- What's included in the price

5. Terms and Conditions
- Warranty information
- Payment terms
- Project requirements

6. Next Steps
- How to proceed with the project
- What the client needs to do

Please write in a professional but friendly tone, emphasizing our commitment to quality and customer satisfaction. Format the content with appropriate HTML tags for web display.`;

      if (model === 'claude') {
        const response = await anthropic.messages.create({
          model: "claude-3-opus-20240229",
          max_tokens: 4000,
          messages: [{
            role: "user",
            content: prompt
          }]
        });
        return response.content[0].text;
      } else {
        const response = await openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [
            {
              role: "system",
              content: "You are an expert proposal writer for a sports court construction company. Create detailed, professional proposals with HTML formatting."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000
        });
        return response.choices[0].message.content;
      }
    } catch (error) {
      console.error('Error in AI service:', error);
      throw new Error(`Failed to generate proposal with ${model}: ${error.message}`);
    }
  }
};

module.exports = aiService;