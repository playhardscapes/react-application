// src/services/toolsService.js
const db = require('../config/database');

const toolsService = {
  /**
   * Get all tools with their next maintenance date
   */
  async getAllTools() {
    const query = `
      SELECT 
        t.*,
        (
          SELECT next_maintenance_date 
          FROM tool_maintenance 
          WHERE tool_id = t.id 
          ORDER BY maintenance_date DESC 
          LIMIT 1
        ) as next_maintenance_date
      FROM tools t
      ORDER BY t.name
    `;
    const result = await db.query(query);
    return result.rows.map(tool => ({
      ...tool,
      // Ensure next_maintenance_date is null if no maintenance record exists
      next_maintenance_date: tool.next_maintenance_date || null
    }));
  },

  /**
   * Get tool details including maintenance and assignment history
   * @param {number} id Tool ID
   * @returns {Promise<Object>} Tool details
   */
  async getToolById(id) {
    // Ensure id is a number
    const toolId = parseInt(id, 10);
    
    if (isNaN(toolId)) {
      throw new Error('Invalid tool ID');
    }
  
    const query = `
      WITH maintenance_history AS (
        SELECT 
          tm.*,
          u.name as performed_by_name
        FROM tool_maintenance tm
        LEFT JOIN users u ON tm.performed_by = u.id
        WHERE tm.tool_id = $1
        ORDER BY tm.maintenance_date DESC
      ),
      assignment_history AS (
        SELECT 
          ta.*,
          p.title as project_title,
          cu.name as checked_out_by_name,
          ciu.name as checked_in_by_name
        FROM tool_assignments ta
        LEFT JOIN projects p ON ta.project_id = p.id
        LEFT JOIN users cu ON ta.checked_out_by = cu.id
        LEFT JOIN users ciu ON ta.checked_in_by = ciu.id
        WHERE ta.tool_id = $1
        ORDER BY ta.checked_out_at DESC
      )
      SELECT 
        t.*,
        (
          SELECT next_maintenance_date 
          FROM tool_maintenance 
          WHERE tool_id = t.id 
          ORDER BY maintenance_date DESC 
          LIMIT 1
        ) as next_maintenance_date,
        (
          SELECT json_agg(json_build_object(
            'id', mh.id,
            'tool_id', mh.tool_id,
            'maintenance_date', mh.maintenance_date,
            'maintenance_type', mh.maintenance_type,
            'performed_by_name', mh.performed_by_name,
            'cost', mh.cost,
            'description', mh.description,
            'next_maintenance_date', mh.next_maintenance_date
          ))
          FROM maintenance_history mh
        ) as maintenance_history,
        (
          SELECT json_agg(json_build_object(
            'id', ah.id,
            'tool_id', ah.tool_id,
            'project_title', ah.project_title,
            'checked_out_by_name', ah.checked_out_by_name,
            'checked_in_by_name', ah.checked_in_by_name,
            'checked_out_at', ah.checked_out_at,
            'checked_in_at', ah.checked_in_at
          ))
          FROM assignment_history ah
        ) as assignment_history
      FROM tools t
      WHERE t.id = $1
    `;
    
    try {
      const result = await db.query(query, [toolId]);
      
      if (result.rows.length === 0) {
        throw new Error(`Tool with ID ${toolId} not found`);
      }
      
      const tool = result.rows[0];
      
      // Ensure empty arrays if no history
      tool.maintenance_history = tool.maintenance_history || [];
      tool.assignment_history = tool.assignment_history || [];
      
      return tool;
    } catch (error) {
      console.error('Error fetching tool details:', error);
      throw error;
    }
  },

  /**
   * Get tools requiring maintenance
   */
  async getToolsRequiringMaintenance() {
    try {
      const query = `
        WITH latest_maintenance AS (
          SELECT 
            tool_id, 
            MAX(maintenance_date) as last_maintenance_date,
            MAX(next_maintenance_date) as next_maintenance_date
          FROM tool_maintenance
          GROUP BY tool_id
        )
        SELECT 
          t.id,
          t.name, 
          t.serial_number,
          t.brand,
          t.model,
          t.status,
          COALESCE(t.last_maintenance_date, CURRENT_DATE - INTERVAL '1 year') as last_maintenance_date,
          COALESCE(
            (SELECT next_maintenance_date FROM latest_maintenance lm WHERE lm.tool_id = t.id), 
            CURRENT_DATE
          ) as next_maintenance_date,
          t.maintenance_interval_days,
          CASE 
            WHEN t.maintenance_interval_days IS NULL THEN false
            WHEN COALESCE(
              (SELECT next_maintenance_date FROM latest_maintenance lm WHERE lm.tool_id = t.id), 
              CURRENT_DATE
            ) <= CURRENT_DATE THEN true
            ELSE false
          END as needs_maintenance
        FROM tools t
        WHERE 
          t.status != 'maintenance' AND
          t.maintenance_interval_days IS NOT NULL AND
          (
            (SELECT next_maintenance_date FROM latest_maintenance lm WHERE lm.tool_id = t.id) IS NULL OR
            (SELECT next_maintenance_date FROM latest_maintenance lm WHERE lm.tool_id = t.id) <= CURRENT_DATE
          )
        ORDER BY next_maintenance_date ASC NULLS FIRST
      `;
      
      const result = await db.query(query);
      return result.rows.map(tool => ({
        ...tool,
        needs_maintenance: tool.needs_maintenance || false
      }));
    } catch (error) {
      console.error('Error fetching tools requiring maintenance:', error);
      throw error;
    }
  },
  async getToolMaintenanceHistory(toolId) {
    const query = `
      SELECT 
        tm.*,
        u.name as performed_by_name
      FROM tool_maintenance tm
      LEFT JOIN users u ON tm.performed_by = u.id
      WHERE tm.tool_id = $1
      ORDER BY tm.maintenance_date DESC
    `;
    
    try {
      const result = await db.query(query, [toolId]);
      return result.rows || [];
    } catch (error) {
      console.error('Error fetching tool maintenance history:', error);
      throw error;
    }
  },
  
  async getToolAssignmentHistory(toolId) {
    const query = `
      SELECT 
        ta.*,
        p.title as project_title,
        cu.name as checked_out_by_name,
        ciu.name as checked_in_by_name
      FROM tool_assignments ta
      LEFT JOIN projects p ON ta.project_id = p.id
      LEFT JOIN users cu ON ta.checked_out_by = cu.id
      LEFT JOIN users ciu ON ta.checked_in_by = ciu.id
      WHERE ta.tool_id = $1
      ORDER BY ta.checked_out_at DESC
    `;
    
    try {
      const result = await db.query(query, [toolId]);
      return result.rows || [];
    } catch (error) {
      console.error('Error fetching tool assignment history:', error);
      throw error;
    }
  }
};

module.exports = toolsService;