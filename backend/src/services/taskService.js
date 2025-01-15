// src/services/taskService.js
const db = require('../config/database');

const taskService = {
  async getProjectTasks(projectId) {
    const query = `
      SELECT 
        t.*,
        u.name as assigned_to_name,
        u.email as assigned_to_email
      FROM project_tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.project_id = $1
      ORDER BY 
        CASE 
          WHEN t.status = 'in_progress' THEN 1
          WHEN t.status = 'pending' THEN 2
          WHEN t.status = 'blocked' THEN 3
          WHEN t.status = 'completed' THEN 4
          ELSE 5
        END,
        t.due_date ASC NULLS LAST,
        t.created_at DESC
    `;

    try {
      const result = await db.query(query, [projectId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      throw error;
    }
  },

  async getTaskById(taskId) {
    const query = `
      SELECT 
        t.*,
        u.name as assigned_to_name,
        u.email as assigned_to_email
      FROM project_tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.id = $1
    `;

    try {
      const result = await db.query(query, [taskId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  },

  async createTask(taskData) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const query = `
        INSERT INTO project_tasks (
          project_id,
          title,
          description,
          status,
          priority,
          due_date,
          estimated_hours,
          assigned_to,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const values = [
        taskData.project_id,
        taskData.title,
        taskData.description,
        taskData.status || 'pending',
        taskData.priority || 'medium',
        taskData.due_date,
        taskData.estimated_hours,
        taskData.assigned_to
      ];

      const result = await client.query(query, values);
      const task = result.rows[0];

      // Update project actual hours if provided
      if (taskData.actual_hours) {
        await client.query(
          'UPDATE projects SET actual_hours = COALESCE(actual_hours, 0) + $1 WHERE id = $2',
          [taskData.actual_hours, taskData.project_id]
        );
      }

      await client.query('COMMIT');
      return task;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating task:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  async updateTask(taskId, taskData) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Get current task for comparison
      const currentTask = await this.getTaskById(taskId);
      if (!currentTask) {
        throw new Error('Task not found');
      }

      let updateFields = [];
      let values = [];
      let valueIndex = 1;

      const fields = [
        'title', 'description', 'status', 'priority',
        'due_date', 'estimated_hours', 'assigned_to'
      ];

      fields.forEach(field => {
        if (taskData[field] !== undefined) {
          updateFields.push(`${field} = $${valueIndex}`);
          values.push(taskData[field]);
          valueIndex++;
        }
      });

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(taskId);

      const query = `
        UPDATE project_tasks
        SET ${updateFields.join(', ')}
        WHERE id = $${valueIndex}
        RETURNING *
      `;

      const result = await client.query(query, values);
      const updatedTask = result.rows[0];

      // Update project status if task status changed to completed
      if (currentTask.status !== 'completed' && updatedTask.status === 'completed') {
        // Check if all tasks are completed
        const tasksQuery = `
          SELECT COUNT(*) as total,
                 COUNT(*) FILTER (WHERE status = 'completed') as completed
          FROM project_tasks
          WHERE project_id = $1
        `;
        const tasksResult = await client.query(tasksQuery, [updatedTask.project_id]);
        
        if (tasksResult.rows[0].total === tasksResult.rows[0].completed) {
          await client.query(
            'UPDATE projects SET status = $1 WHERE id = $2',
            ['completed', updatedTask.project_id]
          );
        }
      }

      await client.query('COMMIT');
      return updatedTask;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating task:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  async deleteTask(taskId) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Get task details before deletion
      const task = await this.getTaskById(taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      // Delete the task
      await client.query(
        'DELETE FROM project_tasks WHERE id = $1',
        [taskId]
      );

      // Update project completion status
      const tasksQuery = `
        SELECT COUNT(*) as total,
               COUNT(*) FILTER (WHERE status = 'completed') as completed
        FROM project_tasks
        WHERE project_id = $1
      `;
      const tasksResult = await client.query(tasksQuery, [task.project_id]);
      
      if (tasksResult.rows[0].total === 0) {
        await client.query(
          'UPDATE projects SET status = $1 WHERE id = $2',
          ['in_progress', task.project_id]
        );
      }

      await client.query('COMMIT');
      return { success: true };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting task:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  async getTaskMetrics(projectId) {
    const query = `
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_tasks,
        COUNT(*) FILTER (WHERE status = 'blocked') as blocked_tasks,
        SUM(estimated_hours) as total_estimated_hours,
        COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND status != 'completed') as overdue_tasks
      FROM project_tasks
      WHERE project_id = $1
    `;

    try {
      const result = await db.query(query, [projectId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching task metrics:', error);
      throw error;
    }
  }
};

module.exports = taskService;