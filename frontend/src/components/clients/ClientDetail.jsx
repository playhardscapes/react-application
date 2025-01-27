import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Edit,
  Plus,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { PageContainer } from '@/components/layout/PageContainer';

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
  const { token } = useAuth();
  const { toast } = useToast();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Redirect to login if no token
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;

    const fetchClient = async () => {
      try {
        const response = await fetch(`/api/clients/${id}`, {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch client');
        }

        const data = await response.json();
        setClient(data);
      } catch (err) {
        console.error('Error fetching client:', err);
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message
        });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id, token, toast]);

  const handleArchiveClient = async () => {
    if (!token) return;

    try {
      const response = await fetch(`/api/clients/${id}/archive`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to archive client');
      }

      toast({
        title: "Client Archived",
        description: `Client "${client.name}" has been successfully archived.`,
        variant: "success"
      });
      navigate('/clients');
    } catch (error) {
      console.error('Archive client error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (isDeleting || !token) return;
  
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/clients/${id}/notes/${noteId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete note');
      }
  
      setClient((prevClient) => ({
        ...prevClient,
        notes: prevClient.notes.filter((note) => note.id !== noteId),
      }));
  
      toast({
        title: 'Success',
        description: 'Note deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!client) return <div>Client not found</div>;

  return (
    <PageContainer>
        <Card>
          <CardHeader className="border-b">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl">{client.name}</CardTitle>
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
                  variant="destructive"
                  onClick={handleArchiveClient}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Archive Client
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 pt-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>
            </div>

            {/* Project History */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Project History</h3>
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
            </div>

            {/* Follow-ups */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Follow-ups</h3>
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
            </div>

            {/* Notes */}
<div>
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-lg font-semibold">Notes</h3>
    <Button
      variant="outline"
      size="sm"
      onClick={() => navigate(`/clients/${id}/notes/new`)}
      className="flex items-center gap-2"
    >
      <Plus className="h-4 w-4" />
      Add Note
    </Button>
  </div>
  {client.notes && client.notes.length > 0 ? (
    <div className="space-y-4">
      {client.notes.map((note) => (
        <div key={note.id} className="p-4 border rounded">
          <div className="flex justify-between items-center">
            <p>{note.content}</p>
            <Button
              onClick={() => handleDeleteNote(note.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
          <span className="text-sm text-gray-600">
            {new Date(note.created_at).toLocaleDateString()}
          </span>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-center text-gray-600 py-4">No notes added</p>
  )}
</div>

          </CardContent>
        </Card>
      </PageContainer>
  );
};

export default ClientDetail;