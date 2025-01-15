// src/services/projectService.js
const db = require('../config/database');

const projectService = {
  async getAllProjects() {
    const query = `
      SELECT 
        p.*,
        c.name as client_name,
        c.email as client_email,
        con.contract_amount,
        u.name as team_lead_name,
        COUNT(t.id) FILTER (WHERE t.status = 'completed') as tasks_completed,
        COUNT(t.id) as total_tasks
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN contracts con ON p.contract_id = con.id
      LEFT JOIN users u ON p.assigned_team_lead = u.id
      LEFT JOIN project_tasks t ON p.id = t.project_id
      GROUP BY p.id, c.id, con.id, u.id
      ORDER BY 
        CASE 
          WHEN p.priority = 'high' THEN 1
          WHEN p.priority = 'medium' THEN 2
          WHEN p.priority = 'low' THEN 3
          ELSE 4
        END,
        p.start_date ASC NULLS LAST
    `;

    try {
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  async getProjectById(id) {
    const query = `
      SELECT 
        p.*,
        c.name as client_name,
        c.email as client_email,
        c.phone as client_phone,
        con.contract_amount,
        con.content as contract_content,
        u.name as team_lead_name,
        u.email as team_lead_email,
        COUNT(t.id) FILTER (WHERE t.status = 'completed') as tasks_completed,
        COUNT(t.id) as total_tasks
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN contracts con ON p.contract_id = con.id
      LEFT JOIN users u ON p.assigned_team_lead = u.id
      LEFT JOIN project_tasks t ON p.id = t.project_id
      WHERE p.id = $1
      GROUP BY p.id, c.id, con.id, u.id
    `;

    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  },

  async createProject(projectData) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Create the project
      const projectQuery = `
        INSERT INTO projects (
          title,
          client_id,
          contract_id,
          location,
          status,
          start_date,
          completion_date,
          notes,
          assigned_team_lead,
          estimated_hours,
          priority,
          complexity,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const projectValues = [
        projectData.title,
        projectData.client_id,
        projectData.contract_id,
        projectData.location,
        projectData.status || 'pending',
        projectData.start_date,
        projectData.completion_date,
        projectData.notes,
        projectData.assigned_team_lead,
        projectData.estimated_hours,
        projectData.priority || 'medium',
        projectData.complexity || 'medium'
      ];

      const result = await client.query(projectQuery, projectValues);
      const project = result.rows[0];

      await client.query('COMMIT');
      return project;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating project:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  async updateProject(id, projectData) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      let updateFields = [];
      let values = [];
      let valueIndex = 1;

      const fields = [
        'title', 'location', 'status', 'start_date', 'completion_date',
        'notes', 'assigned_team_lead', 'estimated_hours', 'actual_hours',
        'priority', 'complexity'
      ];

      fields.forEach(field => {
        if (projectData[field] !== undefined) {
          updateFields.push(`${field} = $${valueIndex}`);
          values.push(projectData[field]);
          valueIndex++;
        }
      });

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const query = `
        UPDATE projects
        SET ${updateFields.join(', ')}
        WHERE id = $${valueIndex}
        RETURNING *
      `;

      const result = await client.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Project not found');
      }

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating project:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  async updateProjectHours(id, hours) {
    const query = `
      UPDATE projects
      SET 
        actual_hours = COALESCE(actual_hours, 0) + $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    try {
      const result = await db.query(query, [hours, id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating project hours:', error);
      throw error;
    }
  },

  async deleteProject(id) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Delete associated tasks first
      await client.query(
        'DELETE FROM project_tasks WHERE project_id = $1',
        [id]
      );

      // Delete the project
      const result = await client.query(
        'DELETE FROM projects WHERE id = $1 RETURNING id',
        [id]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting project:', error);
      throw error;
    } finally {
      client.release();
    }
  }
};

module.exports = projectService;