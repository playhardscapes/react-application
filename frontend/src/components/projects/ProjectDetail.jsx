// src/components/projects/ProjectDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TaskList from './TaskList';
import { PageContainer } from '@/components/layout/PageContainer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  ArrowLeft,
  Save,
  Trash2,
  AlertCircle,
  Calendar,
  Timer,
  Users,
  CheckCircle2,
  ClipboardList
} from 'lucide-react';

const PROJECT_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' }
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

const COMPLEXITY_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [originalProject, setOriginalProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${id}`);
        if (!response.ok) throw new Error('Failed to fetch project');
        const data = await response.json();
        
        // Format dates before setting state
        const formattedData = {
          ...data,
          start_date: data.start_date ? data.start_date.split('T')[0] : '',
          completion_date: data.completion_date ? data.completion_date.split('T')[0] : ''
        };
        
        setProject(formattedData);
        setOriginalProject(formattedData); // Keep original for comparison
      } catch (error) {
        console.error('Error fetching project:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const [teamLeads, setTeamLeads] = useState([]);

// Add this useEffect to fetch team leads
useEffect(() => {
  const fetchTeamLeads = async () => {
    try {
      const response = await fetch('/api/users/team-leads');
      if (!response.ok) throw new Error('Failed to fetch team leads');
      const data = await response.json();
      setTeamLeads(data);
    } catch (error) {
      console.error('Error fetching team leads:', error);
    }
  };

  fetchTeamLeads();
}, []);

  // Handle unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Keep essential fields and format dates
      const updateData = {
        title: project.title,
        status: project.status,
        priority: project.priority,
        complexity: project.complexity,
        location: project.location,
        notes: project.notes,
        start_date: project.start_date || null,
        completion_date: project.completion_date || null,
        estimated_hours: project.estimated_hours ? Number(project.estimated_hours) : null,
        actual_hours: project.actual_hours ? Number(project.actual_hours) : null,
        client_id: project.client_id,  // Preserve the client_id
        contract_id: project.contract_id, // Preserve the contract_id
        assigned_team_lead: project.assigned_team_lead
      };
  
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save project');
      }
      
      const updatedProject = await response.json();
      // Format dates in the response
      const formattedProject = {
        ...updatedProject,
        start_date: updatedProject.start_date ? updatedProject.start_date.split('T')[0] : '',
        completion_date: updatedProject.completion_date ? updatedProject.completion_date.split('T')[0] : ''
      };
      
      setProject(formattedProject);
      setOriginalProject(formattedProject);
      setEditMode(false);
      setHasUnsavedChanges(false);
      setError(null);
    } catch (error) {
      console.error('Error saving project:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete project');
      
      navigate('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      setError(error.message);
    }
  };

  const handleStatusChange = async (newStatus) => {
    const previousStatus = project.status;
    
    // Optimistic update
    setProject(prev => ({ ...prev, status: newStatus }));
    setHasUnsavedChanges(true);
    
    try {
      const response = await fetch(`/api/projects/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) throw new Error('Failed to update status');
      
      const updatedProject = await response.json();
      // Format dates in the response
      const formattedProject = {
        ...updatedProject,
        start_date: updatedProject.start_date ? updatedProject.start_date.split('T')[0] : '',
        completion_date: updatedProject.completion_date ? updatedProject.completion_date.split('T')[0] : ''
      };
      
      setProject(formattedProject);
      setOriginalProject(formattedProject);
      setHasUnsavedChanges(false);
    } catch (error) {
      // Revert on error
      setProject(prev => ({ ...prev, status: previousStatus }));
      setError(error.message);
    }
  };

  const handleChange = (field, value) => {
    setProject(prev => {
      // Handle number fields
      if (field === 'estimated_hours' || field === 'actual_hours') {
        value = value ? Math.max(0, Number(value)) : '';
      }

      return {
        ...prev,
        [field]: value
      };
    });
    setHasUnsavedChanges(true);
  };

  const getProgressPercentage = () => {
    if (!project?.total_tasks) return 0;
    return Math.round((project.tasks_completed / project.total_tasks) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2">Loading project details...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-8 w-8 mx-auto text-red-500" />
              <p className="mt-2">Project not found</p>
              <Button 
                onClick={() => navigate('/projects')}
                className="mt-4"
              >
                Return to Projects
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <PageContainer>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (hasUnsavedChanges) {
                      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                        navigate('/projects');
                      }
                    } else {
                      navigate('/projects');
                    }
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  {editMode ? (
                    <input
                      type="text"
                      value={project.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      className="text-xl font-bold p-1 border rounded"
                    />
                  ) : (
                    <CardTitle>{project.title}</CardTitle>
                  )}
                  <p className="text-sm text-gray-500">
                    Client: {project.client_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {editMode ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setProject(originalProject);
                        setEditMode(false);
                        setHasUnsavedChanges(false);
                      }}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saving || !hasUnsavedChanges}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                    <Button onClick={() => setEditMode(true)}>
                      Edit Project
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 rounded-full h-2 transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">
                Project Progress: {getProgressPercentage()}%
              </p>
            </div>
          </CardHeader>

          {error && (
          <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Details Column */}
            <div>
              <h3 className="font-medium mb-4">Project Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={project.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={!editMode}
                    className="w-full p-2 border rounded"
                  >
                    {PROJECT_STATUSES.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    value={project.priority || 'medium'}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    disabled={!editMode}
                    className="w-full p-2 border rounded"
                  >
                    {PRIORITY_LEVELS.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Complexity</label>
                  <select
                    value={project.complexity || 'medium'}
                    onChange={(e) => handleChange('complexity', e.target.value)}
                    disabled={!editMode}
                    className="w-full p-2 border rounded"
                  >
                    {COMPLEXITY_LEVELS.map(complexity => (
                      <option key={complexity.value} value={complexity.value}>
                        {complexity.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={project.location || ''}
                    onChange={(e) => handleChange('location', e.target.value)}
                    disabled={!editMode}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                <label className="block text-sm font-medium mb-1">Team Lead</label>
                <select
                value={project.assigned_team_lead || ''}
                onChange={(e) => handleChange('assigned_team_lead', e.target.value ? Number(e.target.value) : null)}
                disabled={!editMode}
                className="w-full p-2 border rounded">
               <option value="">Select Team Lead...</option>
               {teamLeads.map(lead => (
               <option key={lead.id} value={lead.id}>
               {lead.name}
               </option>
               ))}
              </select>
              </div>


                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    value={project.notes || ''}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    disabled={!editMode}
                    className="w-full p-2 border rounded h-24"
                  />
                </div>
              </div>
            </div>

            {/* Schedule & Hours Column */}
            <div>
              <h3 className="font-medium mb-4">Schedule & Hours</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={project.start_date || ''}
                    onChange={(e) => handleChange('start_date', e.target.value)}
                    disabled={!editMode}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Completion Date</label>
                  <input
                    type="date"
                    value={project.completion_date || ''}
                    onChange={(e) => handleChange('completion_date', e.target.value)}
                    disabled={!editMode}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    value={project.estimated_hours || ''}
                    onChange={(e) => handleChange('estimated_hours', e.target.value)}
                    disabled={!editMode}
                    min="0"
                    step="0.5"
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Actual Hours</label>
                  <input
                    type="number"
                    value={project.actual_hours || ''}
                    onChange={(e) => handleChange('actual_hours', e.target.value)}
                    disabled={!editMode}
                    min="0"
                    step="0.5"
                    className="w-full p-2 border rounded"
                  />
                </div>

                {/* Progress Stats */}
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Tasks Completed</p>
                      <p className="text-xl font-medium">
                        {project.tasks_completed || 0}/{project.total_tasks || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Hours Progress</p>
                      <p className="text-xl font-medium">
                        {project.actual_hours || 0}/{project.estimated_hours || 0}
                      </p>
                    </div>
                  </div>

                  {/* Hours Progress Bar */}
                  <div className="mt-4 space-y-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 rounded-full h-2 transition-all duration-300"
                        style={{ 
                          width: `${Math.min(
                            ((project.actual_hours || 0) / (project.estimated_hours || 1)) * 100,
                            100
                          )}%` 
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-right">
                      {Math.round(((project.actual_hours || 0) / (project.estimated_hours || 1)) * 100)}% of estimated hours used
                    </p>
                  </div>
                </div>

                {/* Contract Information */}
                {project.contract_amount && (
                  <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Contract Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-700">Contract Amount:</span>
                        <span className="font-medium text-blue-900">
                          ${Number(project.contract_amount).toLocaleString()}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => navigate(`/contracts/${project.contract_id}`)}
                      >
                        View Contract
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Tasks Section */}
        <Card>
          <CardContent className="p-6">
            <TaskList projectId={id} />
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog 
          open={showDeleteDialog} 
          onOpenChange={setShowDeleteDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this project? This action cannot be undone.
                All associated tasks and data will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Unsaved Changes Dialog */}
        {hasUnsavedChanges && !editMode && (
          <AlertDialog open={true}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                <AlertDialogDescription>
                  You have unsaved changes. Would you like to save them before leaving edit mode?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel 
                  onClick={() => {
                    setProject(originalProject);
                    setHasUnsavedChanges(false);
                  }}
                >
                  Discard Changes
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save Changes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </PageContainer>
  );
};

export default ProjectDetail;