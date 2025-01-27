// src/services/aiConfigService.js
const db = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

class AIConfigService {
  constructor() {
    this.defaultPrompts = {
      schema_analysis: {
        id: 'schema_analysis',
        name: 'Database Schema Analysis',
        description: 'Analyzes database structure and suggests improvements',
        model: 'claude-3-opus-20240229',
        maxTokens: 4096,
        role: 'system',
        isLocked: true,
        systemPrompt: 'You are a database architect analyzing system structure and usage patterns.',
        contentPrompt: `You are analyzing a court construction company's database schema. Please return ONLY a JSON response in this exact format:
        {
          "currentState": {
            "strengths": [],
            "weaknesses": []
          },
          "developmentPriorities": [],
          "schemaImprovements": [],
          "securityConsiderations": []
        }`,
        requiredTables: ['clients', 'projects', 'estimates']
      },
      proposal_generation: {
        id: 'proposal_generation',
        name: 'Proposal Generation',
        description: 'Generates court construction proposals',
        model: 'claude-3-opus-20240229',
        maxTokens: 4000,
        role: 'assistant',
        isLocked: false,
        systemPrompt: 'You are an expert proposal writer for a sports court construction company.',
        contentPrompt: `Create a professional project proposal that includes:
          1. Executive Summary
          2. Detailed Scope of Work
          3. Project Timeline
          4. Investment Breakdown
          5. Terms and Conditions
          6. Next Steps`,
        seasonalTips: true
      }
    };
  }

  async initializeDatabase() {
    try {
      // Create ai_prompts table if it doesn't exist
      await db.query(`
        CREATE TABLE IF NOT EXISTS ai_prompts (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          model VARCHAR(50) NOT NULL,
          max_tokens INTEGER NOT NULL,
          role VARCHAR(20) NOT NULL,
          is_locked BOOLEAN DEFAULT false,
          system_prompt TEXT,
          content_prompt TEXT,
          required_tables TEXT[],
          seasonal_tips BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Insert default prompts if they don't exist
      for (const [_, prompt] of Object.entries(this.defaultPrompts)) {
        await db.query(`
          INSERT INTO ai_prompts (
            id, name, description, model, max_tokens, role,
            is_locked, system_prompt, content_prompt,
            required_tables, seasonal_tips
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (id) DO NOTHING
        `, [
          prompt.id,
          prompt.name,
          prompt.description,
          prompt.model,
          prompt.maxTokens,
          prompt.role,
          prompt.isLocked,
          prompt.systemPrompt,
          prompt.contentPrompt,
          prompt.requiredTables || null,
          prompt.seasonalTips || false
        ]);
      }
    } catch (error) {
      console.error('Error initializing AI config database:', error);
      throw error;
    }
  }

  async getAllPrompts() {
    try {
      const result = await db.query('SELECT * FROM ai_prompts ORDER BY name');
      return result.rows;
    } catch (error) {
      console.error('Error fetching prompts:', error);
      throw error;
    }
  }

  async getPromptById(id) {
    try {
      const result = await db.query('SELECT * FROM ai_prompts WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching prompt:', error);
      throw error;
    }
  }

  async updatePrompt(id, updates) {
    try {
      // Check if prompt is locked
      const current = await this.getPromptById(id);
      if (current.is_locked) {
        throw new Error('Cannot update locked prompt');
      }

      const result = await db.query(`
        UPDATE ai_prompts
        SET 
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          model = COALESCE($3, model),
          max_tokens = COALESCE($4, max_tokens),
          role = COALESCE($5, role),
          system_prompt = COALESCE($6, system_prompt),
          content_prompt = COALESCE($7, content_prompt),
          required_tables = COALESCE($8, required_tables),
          seasonal_tips = COALESCE($9, seasonal_tips),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *
      `, [
        updates.name,
        updates.description,
        updates.model,
        updates.maxTokens,
        updates.role,
        updates.systemPrompt,
        updates.contentPrompt,
        updates.requiredTables,
        updates.seasonalTips,
        id
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error updating prompt:', error);
      throw error;
    }
  }

  async resetPrompt(id) {
    try {
      const defaultPrompt = this.defaultPrompts[id];
      if (!defaultPrompt) {
        throw new Error('No default configuration found for this prompt');
      }

      return await this.updatePrompt(id, defaultPrompt);
    } catch (error) {
      console.error('Error resetting prompt:', error);
      throw error;
    }
  }
}

module.exports = new AIConfigService();