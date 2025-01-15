import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle2, 
  Circle,
  Clock,
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Plus
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const TASK_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'blocked', label: 'Blocked' }
];

const TASK_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

const TaskForm = ({ task, onSave, onCancel }) => {
  const [formData, setFormData] = useState(task || {
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: '',
    estimated_hours: '',
    assigned_to: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full p-2 border rounded h-24"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full p-2 border rounded"
          >
            {TASK_STATUSES.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full p-2 border rounded"
          >
            {TASK_PRIORITIES.map(priority => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <input
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Estimated Hours</label>
          <input
            type="number"
            value={formData.estimated_hours}
            onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
            min="0"
            step="0.5"
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

const TaskItem = ({ task, onStatusChange, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'blocked':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="border rounded-lg hover:bg-gray-50">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <button 
              onClick={() => onStatusChange(task.id)}
              className="mt-1"
            >
              {getStatusIcon(task.status)}
            </button>
            
            <div>
              <h4 className="font-medium">{task.title}</h4>
              {!expanded && task.description && (
                <p className="text-sm text-gray-600 line-clamp-1">
                  {task.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            
            <button onClick={() => setExpanded(!expanded)}>
              {expanded ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 space-y-4">
            {task.description && (
              <p className="text-gray-600">{task.description}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-600">
              {task.due_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </div>
              )}
              
              {task.estimated_hours && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {task.estimated_hours} hours
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEdit(task)}
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="text-red-600"
                onClick={() => onDelete(task.id)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TaskList = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/tasks`);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId]);

  const handleSaveTask = async (taskData) => {
    try {
      const isEditing = Boolean(editingTask);
      const url = isEditing 
        ? `/api/projects/${projectId}/tasks/${editingTask.id}`
        : `/api/projects/${projectId}/tasks`;
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) throw new Error('Failed to save task');
      
      const savedTask = await response.json();
      
      if (isEditing) {
        setTasks(tasks.map(t => t.id === savedTask.id ? savedTask : t));
      } else {
        setTasks([...tasks, savedTask]);
      }
      
      setShowTaskForm(false);
      setEditingTask(null);
    } catch (err) {
      console.error('Error saving task:', err);
      setError(err.message);
    }
  };

  const handleStatusChange = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    const currentStatus = task.status;
    
    // Cycle through statuses
    const statusIndex = TASK_STATUSES.findIndex(s => s.value === currentStatus);
    const nextStatus = TASK_STATUSES[(statusIndex + 1) % TASK_STATUSES.length].value;

    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...task,
          status: nextStatus
        })
      });

      if (!response.ok) throw new Error('Failed to update task status');
      
      const updatedTask = await response.json();
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
    } catch (err) {
      console.error('Error updating task status:', err);
      setError(err.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete task');
      
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading tasks...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Tasks</h3>
          <p className="text-sm text-gray-600">
            {tasks.filter(t => t.status === 'completed').length} of {tasks.length} completed
          </p>
        </div>

        <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </DialogTitle>
              <DialogDescription>
                Add task details below. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <TaskForm
              task={editingTask}
              onSave={handleSaveTask}
              onCancel={() => {
                setShowTaskForm(false);
                setEditingTask(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onStatusChange={handleStatusChange}
            onEdit={(task) => {
              setEditingTask(task);
              setShowTaskForm(true);
            }}
            onDelete={handleDeleteTask}
          />
        ))}

        {tasks.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              No tasks yet. Click "Add Task" to create one.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TaskList;