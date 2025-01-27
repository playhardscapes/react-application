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
        u.id as team_lead_id,
        u.name as team_lead_name,
        COUNT(t.id) FILTER (WHERE t.status = 'completed') as tasks_completed,
        COUNT(t.id) as total_tasks
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN contracts con ON p.contract_id = con.id
      LEFT JOIN project_team_members ptm ON p.id = ptm.project_id AND ptm.role = 'team_lead'
      LEFT JOIN users u ON ptm.user_id = u.id
      LEFT JOIN project_tasks t ON p.id = t.project_id
      GROUP BY p.id, c.id, con.id, u.id, ptm.user_id
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
        u.id as team_lead_id,
        u.name as team_lead_name,
        u.email as team_lead_email,
        COUNT(t.id) FILTER (WHERE t.status = 'completed') as tasks_completed,
        COUNT(t.id) as total_tasks
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN contracts con ON p.contract_id = con.id
      LEFT JOIN project_team_members ptm ON p.id = ptm.project_id AND ptm.role = 'team_lead'
      LEFT JOIN users u ON ptm.user_id = u.id
      LEFT JOIN project_tasks t ON p.id = t.project_id
      WHERE p.id = $1
      GROUP BY p.id, c.id, con.id, u.id, ptm.user_id
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

      // Create the project first
      const projectQuery = `
        INSERT INTO projects (
          title,
          client_id,
          location,
          status,
          start_date,
          completion_date,
          notes,
          estimated_hours,
          priority,
          complexity
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const projectValues = [
        projectData.title,
        projectData.client_id,
        projectData.location || null,
        projectData.status || 'pending',
        projectData.start_date || null,
        projectData.completion_date || null,
        projectData.notes || null,
        projectData.estimated_hours || null,
        projectData.priority || 'medium',
        projectData.complexity || 'medium'
      ];

      const result = await client.query(projectQuery, projectValues);
      const project = result.rows[0];

      // If there's a team lead assigned, create the team member entry
      if (projectData.assigned_team_lead) {
        await client.query(
          `INSERT INTO project_team_members (project_id, user_id, role)
           VALUES ($1, $2, 'team_lead')`,
          [project.id, projectData.assigned_team_lead]
        );
      }

      await client.query('COMMIT');

      // Fetch the complete project data with all relations
      return await this.getProjectById(project.id);
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
      console.log('Starting project update transaction');  // Debug log
      await client.query('BEGIN');
  
      // Handle team lead assignment if provided
      if (projectData.assigned_team_lead !== undefined) {
        console.log('Updating team lead:', projectData.assigned_team_lead);  // Debug log
        // Remove existing team lead
        await client.query(
          `DELETE FROM project_team_members 
           WHERE project_id = $1 AND role = 'team_lead'`,
          [id]
        );
  
        // Add new team lead if one is specified
        if (projectData.assigned_team_lead) {
          await client.query(
            `INSERT INTO project_team_members (project_id, user_id, role)
             VALUES ($1, $2, 'team_lead')`,
            [id, projectData.assigned_team_lead]
          );
        }
      }
    

      // Remove team lead field from project update
      const { assigned_team_lead, ...updateData } = projectData;

      // Update project fields
      if (Object.keys(updateData).length > 0) {
        const allowedFields = [
          'title', 
          'location', 
          'status', 
          'start_date', 
          'completion_date',
          'notes', 
          'estimated_hours', 
          'actual_hours',
          'priority', 
          'complexity',
          'client_id'
        ];

        const updateFields = [];
        const values = [];
        let valueIndex = 1;

        Object.entries(updateData)
          .filter(([field]) => allowedFields.includes(field))
          .forEach(([field, value]) => {
            if (value !== undefined) {
              updateFields.push(`${field} = $${valueIndex}`);
              values.push(value);
              valueIndex++;
            }
          });

        if (updateFields.length > 0) {
          updateFields.push('updated_at = CURRENT_TIMESTAMP');
          values.push(id);

          const query = `
            UPDATE projects
            SET ${updateFields.join(', ')}
            WHERE id = $${valueIndex}
            RETURNING *
          `;

          await client.query(query, values);
        }
      }

      await client.query('COMMIT');

      // Fetch and return updated project with all relations
      return await this.getProjectById(id);
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

      // Delete project team members
      await client.query(
        'DELETE FROM project_team_members WHERE project_id = $1',
        [id]
      );

      // Delete associated tasks
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