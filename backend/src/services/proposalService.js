// src/services/proposalService.js
const db = require('../config/database');
const aiService = require('./aiService');

const proposalService = {
  getAllProposals: async function() {
    const query = `
      SELECT 
        p.*,
        c.name as client_name,
        c.email as client_email,
        c.phone as client_phone
      FROM proposals p
      LEFT JOIN clients c ON p.client_id = c.id
      ORDER BY p.created_at DESC
    `;

    try {
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching proposals:', error);
      throw error;
    }
  },

  getProposalById: async function(id) {
    const query = `
      SELECT 
        p.*,
        c.name as client_name,
        c.email as client_email,
        c.phone as client_phone,
        e.project_location,
        e.total_amount as estimate_amount
      FROM proposals p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN estimates e ON p.estimate_id = e.id
      WHERE p.id = $1
    `;

    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching proposal:', error);
      throw error;
    }
  },

  generateProposal: async function(estimateData, clientData, model = 'claude') {
    try {
      // If we have an estimate ID, fetch the complete estimate data
      if (estimateData.id) {
        const query = `
          SELECT e.*, c.name as client_name, c.email as client_email
          FROM estimates e
          LEFT JOIN clients c ON e.client_id = c.id
          WHERE e.id = $1
        `;
        const result = await db.query(query, [estimateData.id]);
        if (result.rows.length > 0) {
          estimateData = result.rows[0];
        }
      }

      // Generate the proposal content using the AI service
      const content = await aiService.generateProposal(
        estimateData,
        clientData || {
          name: estimateData.client_name,
          email: estimateData.client_email
        },
        model
      );

      return content;
    } catch (error) {
      console.error('Error generating proposal:', error);
      throw error;
    }
  },

  createProposal: async function(proposalData) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Create proposal
      const query = `
        INSERT INTO proposals (
          client_id,
          estimate_id,
          title,
          content,
          total_amount,
          status,
          proposal_date,
          follow_up_date
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, CURRENT_DATE + interval '7 days')
        RETURNING *
      `;

      const values = [
        proposalData.client_id,
        proposalData.estimate_id,
        proposalData.title,
        proposalData.content,
        proposalData.total_amount,
        proposalData.status || 'draft'
      ];

      const result = await client.query(query, values);
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating proposal:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  createFromEstimate: async function(estimateId, model = 'claude') {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get estimate with client data
      const estimateQuery = `
        SELECT e.*, c.*
        FROM estimates e
        JOIN clients c ON e.client_id = c.id
        WHERE e.id = $1
      `;
      const estimateResult = await client.query(estimateQuery, [estimateId]);
      
      if (estimateResult.rows.length === 0) {
        throw new Error('Estimate not found');
      }

      const estimate = estimateResult.rows[0];

      // Generate proposal content
      const proposalContent = await this.generateProposal(
        estimate,
        {
          name: estimate.name,
          email: estimate.email,
          phone: estimate.phone
        },
        model
      );

      // Create proposal
      const insertQuery = `
        INSERT INTO proposals (
          client_id,
          estimate_id,
          title,
          content,
          total_amount,
          status,
          proposal_date,
          follow_up_date,
          notes
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, CURRENT_DATE + interval '7 days', $7)
        RETURNING *
      `;

      const values = [
        estimate.client_id,
        estimateId,
        `${estimate.project_type || 'Court'} Construction Proposal - ${estimate.project_location}`,
        proposalContent,
        estimate.total_amount,
        'draft',
        'Generated from estimate #' + estimateId
      ];

      const result = await client.query(insertQuery, values);
      await client.query('COMMIT');

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
   
    updateProposal: async function(id, proposalData) {
      const client = await db.pool.connect();
      try {
        await client.query('BEGIN');
  
        // Build update query dynamically based on provided fields
        const updates = [];
        const values = [];
        let paramCount = 1;
  
        if (proposalData.title !== undefined) {
          updates.push(`title = $${paramCount}`);
          values.push(proposalData.title);
          paramCount++;
        }
  
        if (proposalData.content !== undefined) {
          updates.push(`content = $${paramCount}`);
          values.push(proposalData.content);
          paramCount++;
        }
  
        if (proposalData.status !== undefined) {
          updates.push(`status = $${paramCount}`);
          values.push(proposalData.status);
          paramCount++;
        }
  
        if (proposalData.total_amount !== undefined) {
          updates.push(`total_amount = $${paramCount}`);
          values.push(proposalData.total_amount);
          paramCount++;
        }
  
        // Add the ID as the last parameter
        values.push(id);
  
        const query = `
          UPDATE proposals
          SET ${updates.join(', ')},
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $${paramCount}
          RETURNING *
        `;
  
        const result = await client.query(query, values);
        
        if (result.rows.length === 0) {
          throw new Error('Proposal not found');
        }
  
        await client.query('COMMIT');
        return result.rows[0];
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating proposal:', error);
        throw error;
      } finally {
        client.release();
      }
    }
};

module.exports = proposalService;