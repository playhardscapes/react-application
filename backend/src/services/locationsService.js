// src/services/locationsService.js
const db = require('../config/database');

class LocationsService {
  // Get all active locations
  async getAllLocations() {
    const query = `
      SELECT 
        id,
        name,
        type,
        address,
        notes,
        created_at,
        updated_at,
        project_id
      FROM material_locations
      WHERE archived = false OR archived IS NULL
      ORDER BY name
    `;
    
    const result = await db.query(query);
    return result.rows;
  }

  // Get archived locations
  async getArchivedLocations() {
    const query = `
      SELECT 
        id,
        name,
        type,
        address,
        notes,
        created_at,
        updated_at,
        project_id,
        archived_at
      FROM material_locations
      WHERE archived = true
      ORDER BY name
    `;
    
    const result = await db.query(query);
    return result.rows;
  }

  // Create new location
  async createLocation(locationData) {
    const { name, type, address, notes, project_id } = locationData;
    
    const query = `
      INSERT INTO material_locations (
        name,
        type,
        address,
        notes,
        project_id,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const result = await db.query(query, [
      name,
      type || null,
      address || null,
      notes || null,
      project_id || null
    ]);
    
    return result.rows[0];
  }

  // Get location by ID
  async getLocationById(id) {
    const query = `
      SELECT *
      FROM material_locations
      WHERE id = $1
    `;

    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Archive location
  async archiveLocation(id) {
    const query = `
      UPDATE material_locations
      SET 
        archived = true,
        archived_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Restore archived location
  async restoreLocation(id) {
    const query = `
      UPDATE material_locations
      SET 
        archived = false,
        archived_at = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Update location
  async updateLocation(id, locationData) {
    const { name, type, address, notes, project_id } = locationData;
    
    const query = `
      UPDATE material_locations
      SET 
        name = $2,
        type = $3,
        address = $4,
        notes = $5,
        project_id = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query(query, [
      id,
      name,
      type || null,
      address || null,
      notes || null,
      project_id || null
    ]);
    
    return result.rows[0];
  }
}

module.exports = new LocationsService();