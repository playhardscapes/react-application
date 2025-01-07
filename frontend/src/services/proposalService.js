// src/services/proposalService.js
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

class ProposalService {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateProposal(data, selectedSections, model = 'claude') {
    try {
      const promptContent = this.buildPrompt(data, selectedSections);
      
      if (model === 'claude') {
        return await this.generateWithClaude(promptContent);
      } else {
        return await this.generateWithGPT(promptContent);
      }
    } catch (error) {
      console.error('Proposal generation error:', error);
      throw new Error('Failed to generate proposal: ' + error.message);
    }
  }

  private buildPrompt(data, selectedSections) {
    let prompt = `Generate a professional construction proposal for a sports court project. 
    Write in first person as if you are Patrick from Play Hardscapes writing directly to the client.
    Use proper HTML formatting in your response.\n\n`;

    if (selectedSections.clientInfo) {
      prompt += `Client Information:
      - Name: ${data.clientInfo.name}
      - Email: ${data.clientInfo.email}
      - Phone: ${data.clientInfo.phone}
      - Location: ${data.clientInfo.projectLocation}
      - Notes: ${data.clientInfo.keyNotes || 'None'}\n\n`;
    }

    if (selectedSections.courtSpecs) {
      prompt += `Court Specifications:
      - Dimensions: ${data.dimensions.length}' × ${data.dimensions.width}'
      - Total Area: ${data.dimensions.squareFootage} sq ft\n\n`;

      // Add court configuration details
      if (data.courtConfig.sports.tennis?.selected) {
        prompt += `Tennis Courts: ${data.courtConfig.sports.tennis.courtCount} court(s)
        Color: ${data.courtConfig.sports.tennis.colors?.court}\n`;
      }
      
      if (data.courtConfig.sports.pickleball?.selected) {
        prompt += `Pickleball Courts: ${data.courtConfig.sports.pickleball.courtCount} court(s)
        Kitchen Color: ${data.courtConfig.sports.pickleball.colors?.kitchen}
        Court Color: ${data.courtConfig.sports.pickleball.colors?.court}\n`;
      }
    }

    if (selectedSections.surfaceSystem) {
      prompt += `Surface System:
      - Pressure Wash: ${data.surfaceSystem.needsPressureWash ? 'Yes' : 'No'}
      - Acid Wash: ${data.surfaceSystem.needsAcidWash ? 'Yes' : 'No'}`;

      if (data.surfaceSystem.patchWork?.needed) {
        prompt += `\nPatch Work:
        - Estimated Gallons: ${data.surfaceSystem.patchWork.estimatedGallons}
        - Minor Cracks: ${data.surfaceSystem.patchWork.minorCrackGallons} gallons
        - Major Cracks: ${data.surfaceSystem.patchWork.majorCrackGallons} gallons`;
      }
    }

    if (selectedSections.equipment) {
      prompt += `\n\nEquipment:
      - Tennis Posts: ${data.equipment.permanentTennisPoles} sets
      - Pickleball Posts: ${data.equipment.permanentPickleballPoles} sets
      - Mobile Nets: ${data.equipment.mobilePickleballNets}
      - Windscreen: ${data.equipment.lowGradeWindscreen + data.equipment.highGradeWindscreen} linear feet`;
    }

    if (selectedSections.logistics) {
      prompt += `\n\nLogistics:
      - Estimated Days: ${data.logistics.estimatedDays}
      - Number of Trips: ${data.logistics.numberOfTrips}
      - Travel Distance: ${data.logistics.distanceToSite} miles
      - Notes: ${data.logistics.logisticalNotes || 'None'}`;
    }

    prompt += `\n\nFormat the proposal with:
    1. Professional introduction
    2. Clear scope of work
    3. Materials and methodology
    4. Timeline and logistics
    5. Next steps
    6. Professional closing

    Use proper HTML tags for formatting.`;

    return prompt;
  }

  private async generateWithClaude(prompt) {
    const response = await this.anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return response.content[0].text;
  }

  private async generateWithGPT(prompt) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{
        role: 'user',
        content: prompt
      }],
      max_tokens: 4000,
      temperature: 0.7
    });

    return response.choices[0].message.content;
  }
}

export const proposalService = new ProposalService();