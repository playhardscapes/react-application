// src/services/aiService.js
const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');
const db = require('../config/database');

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const messageFormatter = require('../utils/messageFormatter');

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
  if (estimateData.basketball_systems?.length) {
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
  },

  async analyzeSchema() {
    try {
      // Get table structure
      const tables = await db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);

      const schema = {};
      
      // Get columns for each table
      for (const { table_name } of tables.rows) {
        const columns = await db.query(`
          SELECT 
            column_name, 
            data_type,
            is_nullable,
            column_default,
            character_maximum_length,
            numeric_precision,
            numeric_scale,
            udt_name
          FROM information_schema.columns
          WHERE table_name = $1
          ORDER BY ordinal_position
        `, [table_name]);
        
        // Get indices for this table
        const indices = await db.query(`
          SELECT
            i.relname as index_name,
            a.attname as column_name,
            ix.indisunique as is_unique
          FROM
            pg_class t,
            pg_class i,
            pg_index ix,
            pg_attribute a
          WHERE
            t.oid = ix.indrelid
            AND i.oid = ix.indexrelid
            AND a.attrelid = t.oid
            AND a.attnum = ANY(ix.indkey)
            AND t.relkind = 'r'
            AND t.relname = $1
        `, [table_name]);
        
        schema[table_name] = {
          columns: columns.rows,
          indices: indices.rows
        };
      }

      // Get foreign key relationships
      const relationships = await db.query(`
        SELECT
          tc.table_name as table_name,
          kcu.column_name as column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          rc.update_rule,
          rc.delete_rule
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        JOIN information_schema.referential_constraints AS rc
          ON rc.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
      `);

      const response = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 4096,
        messages: [{
          role: "user",
          content: `You are analyzing a court construction company's database schema. Please return ONLY a JSON response in this exact format (no other text):
      
      {
        "currentState": {
          "strengths": [
            "Detailed client tracking system",
            "Comprehensive estimation module",
            "Clear project structure"
          ],
          "weaknesses": [
            "Limited payment tracking",
            "No scheduling integration",
            "Missing inventory management"
          ]
        },
        "developmentPriorities": [
          {
            "feature": "Payment Processing",
            "description": "Implement automated payment tracking and invoicing",
            "technicalDetails": "Create payments table with client_id, amount, date, status",
            "priority": "high",
            "estimatedEffort": "Medium"
          }
        ],
        "schemaImprovements": [
          "Add payment_status column to projects table",
          "Create inventory tracking tables",
          "Add weather_constraints to scheduling table"
        ],
        "securityConsiderations": [
          "Implement row-level security for client data",
          "Add audit logging for financial transactions",
          "Encrypt sensitive client information"
        ]
      }
      
      Analyze this schema and return structured recommendations following the format above exactly:
      ${JSON.stringify({ schema, relationships: relationships.rows }, null, 2)}`
        }],
        system: "You are a database architect. Return only valid JSON matching the specified format exactly. No prose, just the JSON object."
      });

      try {
        const analysis = JSON.parse(response.content[0].text);
        return {
          currentState: analysis.currentState || { strengths: [], weaknesses: [] },
          developmentPriorities: analysis.developmentPriorities || [],
          schemaImprovements: analysis.schemaImprovements || [],
          securityConsiderations: analysis.securityConsiderations || []
        };
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        return {
          currentState: { 
            strengths: ["Could not parse strengths"], 
            weaknesses: ["Could not parse weaknesses"] 
          },
          developmentPriorities: [],
          schemaImprovements: ["Could not parse improvements"],
          securityConsiderations: ["Could not parse security considerations"]
        };
      }

    } catch (error) {
      console.error('Error in schema analysis:', error);
      throw error;
    }
  },

  async processQuestion(question, context = {}) {
    try {
      // Gather relevant context - only query existing tables
      const [
        projectsCount,
        clientsCount,
        estimatesCount
      ] = await Promise.all([
        db.query('SELECT COUNT(*) FROM projects'),
        db.query('SELECT COUNT(*) FROM clients'),
        db.query('SELECT COUNT(*) FROM estimates')
      ]);

      const systemContext = {
        ...context,
        databaseStats: {
          projects: projectsCount.rows[0].count,
          clients: clientsCount.rows[0].count,
          estimates: estimatesCount.rows[0].count
        }
      };

      const response = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 4096,
        messages: [{
          role: "user",
          content: `As an AI development partner for a court construction company, please analyze this question: "${question}"
                   
                   Current system context:
                   ${JSON.stringify(systemContext, null, 2)}
                   
                   Consider the existing tables (projects, clients, estimates) and suggest improvements or additions that would help with ${question}
                   
                   Please format your response in clean HTML using:
                   - <h3> for section headings
                   - <p> for paragraphs
                   - <ul> and <li> for lists
                   - <code> for any technical terms or SQL
                   - <strong> for emphasis
                   Use line breaks and spacing for readability.`
        }],
        system: "You are an AI development partner helping build a court construction management system. Always provide well-structured, formatted responses using HTML."
      });

      if (!response.content || !response.content[0] || !response.content[0].text) {
        throw new Error('Invalid response format from AI service');
      }

      return response.content[0].text;
    } catch (error) {
      console.error('Error processing question:', error);
      throw error;
    }
  },

  async analyzeDevelopmentProgress() {
    try {
      // Gather system statistics and recent changes
      const stats = await db.query(`
        SELECT
          (SELECT COUNT(*) FROM projects) as total_projects,
          (SELECT COUNT(*) FROM clients) as total_clients,
          (SELECT COUNT(*) FROM estimates) as total_estimates,
          (SELECT COUNT(*) FROM tasks) as total_tasks,
          (SELECT COUNT(*) FROM projects WHERE status = 'completed') as completed_projects,
          (SELECT AVG(actual_hours - estimated_hours) FROM projects 
           WHERE actual_hours IS NOT NULL AND estimated_hours IS NOT NULL) as hours_variance
      `);

      const response = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 4096,
        messages: [{
          role: "user",
          content: `Please analyze the following system statistics and suggest improvements:
                   ${JSON.stringify(stats.rows[0], null, 2)}
                   
                   Focus on patterns in project completion, resource utilization, and potential optimizations.`
        }],
        system: "You are a development advisor analyzing system usage patterns and suggesting improvements for a court construction company."
      });

      if (!response.content || !response.content[0] || !response.content[0].text) {
        throw new Error('Invalid response format from AI service');
      }

      return {
        analysis: response.content[0].text,
        statistics: stats.rows[0]
      };
    } catch (error) {
      console.error('Error analyzing development progress:', error);
      throw error;
    }
  },


// In aiService.js
async generateDocumentMessage(documentData) {
    try {
      const response = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 500,
        messages: [{
          role: "user",
          content: `Generate a professional, concise sharing message for the following document:
  
  Document Type: ${documentData.type}
  Document Name: ${documentData.original_name}
  Potential Client Context: ${documentData.clientContext || 'Not specified'}
  
  Key Requirements:
  - Professional tone
  - Explain document's relevance
  - Encourage client engagement
  - Keep message under 150 words`
        }]
      });
  
      return response.content[0].text.trim();
    } catch (error) {
      console.error('Document message generation failed:', error);
      return null;
    }
  },
};
module.exports = aiService;