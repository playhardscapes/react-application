const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const communicationService = {
  async createCommunication(data) {
    const query = `
      INSERT INTO communications 
      (client_id, type, direction, channel, sender_name, 
       sender_contact, recipient_contact, message_content, 
       subject, metadata, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      data.client_id,
      data.type, 
      data.direction,
      data.channel,
      data.sender_name,
      data.sender_contact,
      data.recipient_contact,
      data.message_content,
      data.subject,
      data.metadata || {},
      data.status || 'unhandled'
    ];

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating communication:', error);
      throw error;
    }
  },

  async getUnhandledCommunications() {
    const query = `
      SELECT c.*, cl.name as client_name, cl.phone, cl.email
      FROM communications c
      LEFT JOIN clients cl ON c.client_id = cl.id
      WHERE c.status = 'unhandled'
      ORDER BY c.received_at DESC
    `;

    try {
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching unhandled communications:', error);
      throw error;
    }
  },

  async updateCommunicationStatus(id, status) {
    const query = `
      UPDATE communications 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `;

    try {
      const result = await db.query(query, [status, id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating communication status:', error);
      throw error;
    }
  }
};

module.exports = communicationService;