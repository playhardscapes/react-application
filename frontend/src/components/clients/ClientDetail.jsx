// src/components/clients/ClientDetail.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Edit,
  Plus 
} from 'lucide-react';

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2">
    <Icon className="h-5 w-5 text-gray-400 mt-0.5" />
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p>{value || 'N/A'}</p>
    </div>
  </div>
);

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await fetch(`/api/clients/${id}`);
        if (!response.ok) throw new Error('Failed to fetch client');
        const data = await response.json();
        setClient(data);
      } catch (err) {
        console.error('Error fetching client:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!client) return <div>Client not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{client.name}</h1>
            <p className="text-gray-600">{client.organization}</p>
            {client.type && (
              <span className="inline-block mt-2 px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                {client.type}
              </span>
            )}
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/clients/${id}/edit`)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              onClick={() => navigate(`/clients/${id}/follow-up`)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Follow-up
            </Button>
          </div>
        </div>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoRow 
              icon={Building2}
              label="Organization"
              value={client.organization}
            />
            
            <InfoRow 
              icon={Mail}
              label="Email"
              value={client.email}
            />
            <InfoRow 
              icon={Phone}
              label="Phone"
              value={client.phone}
            />
            <InfoRow 
              icon={MapPin}
              label="Address"
              value={[
                client.address,
                client.city,
                client.state,
              ].filter(Boolean).join(', ')}
            />
          </CardContent>
        </Card>

        {/* Project History */}
        <Card>
          <CardHeader>
            <CardTitle>Project History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold">{client.total_projects}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold">
                    ${client.total_project_value?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Active Projects</p>
                  <p className="text-2xl font-bold">
                    {client.projects?.filter(p => p.status === 'active').length || 0}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Last Project</p>
                  <p className="text-2xl font-bold">
                    {client.last_project_date ? 
                      new Date(client.last_project_date).toLocaleDateString() : 
                      'N/A'}
                  </p>
                </div>
              </div>

              {client.projects && client.projects.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-4">Recent Projects</h4>
                  <div className="space-y-3">
                    {client.projects.map(project => (
                      <div 
                        key={project.id}
                        className="flex justify-between items-center p-4 border rounded hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        <div>
                          <h5 className="font-medium">{project.title}</h5>
                          <p className="text-sm text-gray-600">
                            {project.project_location}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ${project.total_amount?.toLocaleString()}
                          </p>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            project.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Follow-ups */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Follow-ups</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/clients/${id}/follow-up`)}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Schedule Follow-up
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {client.follow_ups && client.follow_ups.length > 0 ? (
              <div className="space-y-4">
                {client.follow_ups.map(followUp => (
                  <div
                    key={followUp.id}
                    className="p-4 border rounded"
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{followUp.type}</p>
                        <p className="text-sm text-gray-600">{followUp.notes}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {new Date(followUp.follow_up_date).toLocaleDateString()}
                        </p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          followUp.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : followUp.status === 'pending' && new Date(followUp.follow_up_date) < new Date()
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {followUp.status}
                        </span>
                      </div>
                    </div>
                    {followUp.completion_notes && (
                      <p className="mt-2 text-sm text-gray-600 border-t pt-2">
                        {followUp.completion_notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 py-4">
                No follow-ups scheduled
              </p>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Notes</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/clients/${id}/notes/new`)}
              >
                Add Note
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {client.notes && client.notes.length > 0 ? (
              <div className="space-y-4">
                {client.notes.map(note => (
                  <div key={note.id} className="p-4 border rounded">
                    <div className="flex justify-between items-start">
                      <p>{note.content}</p>
                      <span className="text-sm text-gray-600">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 py-4">No notes added</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDetail;