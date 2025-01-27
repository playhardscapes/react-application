// src/components/projects/ProjectForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  AlertCircle,
  Loader2,
  Save,
  Building2,
  Calendar,
  BadgeInfo,
  Users
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

// Filter for active clients only
const filterActiveClients = (clients) => {
  return clients.filter(client => client.status === 'active' && !client.archived_at);
};

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);
  const [teamLeads, setTeamLeads] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    client_id: '',
    location: '',
    status: 'pending',
    start_date: '',
    completion_date: '',
    notes: '',
    assigned_team_lead: '',
    estimated_hours: '',
    priority: 'medium',
    complexity: 'medium'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch active clients
        const clientsResponse = await fetch('/api/clients?status=active');
        if (!clientsResponse.ok) throw new Error('Failed to fetch clients');
        const clientsData = await clientsResponse.json();
        
        const clientsArray = Array.isArray(clientsData) ? clientsData : clientsData.clients || [];
        const activeClients = filterActiveClients(clientsArray);
        setClients(activeClients);

        // Fetch team leads
        const teamLeadsResponse = await fetch('/api/users/team-leads');
        if (!teamLeadsResponse.ok) throw new Error('Failed to fetch team leads');
        const teamLeadsData = await teamLeadsResponse.json();
        setTeamLeads(teamLeadsData);

        // If editing, fetch project data
        if (id && id !== 'new') {
          const projectResponse = await fetch(`/api/projects/${id}`);
          if (!projectResponse.ok) throw new Error('Failed to fetch project');
          const projectData = await projectResponse.json();
          
          setFormData({
            ...projectData,
            start_date: projectData.start_date ? new Date(projectData.start_date).toISOString().split('T')[0] : '',
            completion_date: projectData.completion_date ? new Date(projectData.completion_date).toISOString().split('T')[0] : '',
            assigned_team_lead: projectData.team_lead_id || ''
          });

          // Fetch client details if client_id exists
          if (projectData.client_id) {
            const clientResponse = await fetch(`/api/clients/${projectData.client_id}`);
            if (clientResponse.ok) {
              const clientData = await clientResponse.json();
              setSelectedClient(clientData);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleClientChange = async (clientId) => {
    setFormData(prev => ({ ...prev, client_id: clientId }));
    
    if (clientId) {
      try {
        const response = await fetch(`/api/clients/${clientId}`);
        if (response.ok) {
          const clientData = await response.json();
          setSelectedClient(clientData);
          
          if (clientData.address) {
            setFormData(prev => ({
              ...prev,
              location: clientData.address
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching client details:', error);
      }
    } else {
      setSelectedClient(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!formData.client_id) {
        setError('Please select a client');
        setSaving(false);
        return;
      }

      const submissionData = {
        ...formData,
        client_id: parseInt(formData.client_id),
        assigned_team_lead: formData.assigned_team_lead ? parseInt(formData.assigned_team_lead) : null,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        start_date: formData.start_date || null,
        completion_date: formData.completion_date || null
      };

      // Remove empty string properties
      Object.keys(submissionData).forEach(key => {
        if (submissionData[key] === '') {
          submissionData[key] = null;
        }
      });

      const method = id && id !== 'new' ? 'PUT' : 'POST';
      const url = id && id !== 'new' ? `/api/projects/${id}` : '/api/projects';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save project');
      }

      const savedProject = await response.json();
      navigate(`/projects/${savedProject.id}`);
    } catch (error) {
      console.error('Error saving project:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => {
      if (field === 'estimated_hours') {
        value = value ? Math.max(0, Number(value)) : '';
      }
      
      if (field === 'client_id') {
        value = value ? Number(value) : '';
      }

      if (field === 'assigned_team_lead') {
        value = value ? Number(value) : '';
      }

      return { ...prev, [field]: value };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2">Loading...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/projects')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {id && id !== 'new' ? 'Edit Project' : 'New Project'}
            </h1>
            <p className="text-gray-600">
              {id && id !== 'new' ? 'Update project details' : 'Create a new project'}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Project Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Enter project title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Client*</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={formData.client_id}
                      onChange={(e) => handleClientChange(e.target.value)}
                      className="flex-1 p-2 border rounded"
                      required
                    >
                      <option value="">Select client...</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name} {client.organization ? `(${client.organization})` : ''}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/clients/new')}
                      title="Add New Client"
                    >
                      <Building2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {selectedClient && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <BadgeInfo className="h-4 w-4" />
                        <span>{selectedClient.email}</span>
                        {selectedClient.phone && <span>• {selectedClient.phone}</span>}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
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
                      value={formData.priority}
                      onChange={(e) => handleChange('priority', e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      {PRIORITY_LEVELS.map(priority => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Project location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Team Lead</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={formData.assigned_team_lead}
                      onChange={(e) => handleChange('assigned_team_lead', e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Select team lead...</option>
                      {teamLeads.map(lead => (
                        <option key={lead.id} value={lead.id}>
                          {lead.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/users')}
                      title="Manage Users"
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => handleChange('start_date', e.target.value)}
                        className="flex-1 p-2 border rounded"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Completion Date</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={formData.completion_date}
                        onChange={(e) => handleChange('completion_date', e.target.value)}
                        className="flex-1 p-2 border rounded"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Estimated Hours</label>
                    <input
                      type="number"
                      value={formData.estimated_hours}
                      onChange={(e) => handleChange('estimated_hours', e.target.value)}
                      className="w-full p-2 border rounded"
                      min="0"
                      step="0.5"
                      placeholder="0.0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Complexity</label>
                    <select
                      value={formData.complexity}
                      onChange={(e) => handleChange('complexity', e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      {COMPLEXITY_LEVELS.map(complexity => (
                        <option key={complexity.value} value={complexity.value}>
                          {complexity.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    className="w-full p-2 border rounded h-32 resize-none"
                    placeholder="Enter any additional project notes..."
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/projects')}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {id && id !== 'new' ? 'Update Project' : 'Create Project'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectForm;