import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/PageContainer';
import { 
  Loader2, 
  Calendar, 
  User, 
  MapPin,
  AlertCircle,
  ClipboardList,
  Search,
  Filter,
  SlidersHorizontal
} from 'lucide-react';

const PROJECT_STATUSES = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' }
];

const getStatusStyle = (status) => {
  const baseStyle = "px-2 py-1 text-xs rounded-full ";
  switch (status?.toLowerCase()) {
    case 'pending':
      return baseStyle + "bg-yellow-100 text-yellow-800";
    case 'in_progress':
      return baseStyle + "bg-blue-100 text-blue-800";
    case 'completed':
      return baseStyle + "bg-green-100 text-green-800";
    case 'on_hold':
      return baseStyle + "bg-orange-100 text-orange-800";
    case 'cancelled':
      return baseStyle + "bg-red-100 text-red-800";
    default:
      return baseStyle + "bg-gray-100 text-gray-800";
  }
};

const ProjectMetrics = ({ projects }) => {
  const metrics = {
    total: projects.length,
    inProgress: projects.filter(p => p.status === 'in_progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    pending: projects.filter(p => p.status === 'pending').length
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-600">Total Projects</p>
          <p className="text-2xl font-bold">{metrics.total}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-600">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">{metrics.inProgress}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-green-600">{metrics.completed}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{metrics.pending}</p>
        </CardContent>
      </Card>
    </div>
  );
};

const ProjectsList = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) throw new Error('Failed to fetch projects');
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = 
        project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a[sortBy] || 0);
      const dateB = new Date(b[sortBy] || 0);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  if (loading) {
    return (
      <PageContainer>
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2">Loading projects...</p>
            </CardContent>
          </Card>
        </PageContainer>
          );
  }

  if (error) {
    return (
      <PageContainer>
          <Card>
            <CardContent className="p-8 text-center text-red-500">
              <AlertCircle className="h-8 w-8 mx-auto" />
              <p className="mt-2">{error}</p>
            </CardContent>
          </Card>
        </PageContainer>
    );
  }

  return (
    <PageContainer>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-gray-600">Manage and track all projects</p>
          </div>
        </div>

        <ProjectMetrics projects={projects} />

        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    className="pl-9 w-full p-2 border rounded-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="p-2 border rounded-md"
                >
                  {PROJECT_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>

                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="p-2 border rounded-md"
                >
                  <option value="created_at-desc">Newest First</option>
                  <option value="created_at-asc">Oldest First</option>
                  <option value="start_date-desc">Start Date (Newest)</option>
                  <option value="start_date-asc">Start Date (Oldest)</option>
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              {filteredProjects.map((project) => (
                <Card 
                  key={project.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">
                          {project.title || `Project #${project.id}`}
                        </h3>
                        
                        <div className="flex items-center text-sm text-gray-600 gap-4">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {project.client_name}
                          </div>
                          
                          {project.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {project.location}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <span className={getStatusStyle(project.status)}>
                            {project.status}
                          </span>

                          {project.start_date && (
                            <span className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              Starts: {new Date(project.start_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {project.tasks_completed || 0}/{project.total_tasks || 0} Tasks
                          </span>
                        </div>
                        {project.contract_amount && (
                          <p className="font-medium">
                            ${Number(project.contract_amount).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredProjects.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ClipboardList className="h-8 w-8 mx-auto mb-2" />
                  <p>No projects found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
     </PageContainer>
  );
};

export default ProjectsList;