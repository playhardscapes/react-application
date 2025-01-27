import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { PageContainer } from '@/components/layout/PageContainer';

const NOTE_TYPES = [
  { value: 'communication', label: 'Communication' },
  { value: 'internal', label: 'Internal Note' },
  { value: 'meeting_notes', label: 'Meeting Notes' },
  { value: 'other', label: 'Other' }
];

const ClientNoteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [formData, setFormData] = React.useState({
    note_type: 'communication',
    content: '',
  });

  // Redirect to login if no token
  React.useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/clients/${id}/notes`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add note');
      }

      toast({
        title: "Success",
        description: "Note added successfully"
      });

      navigate(`/clients/${id}`);
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
        <Card>
          <CardHeader>
            <CardTitle>Add Client Note</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Note Type</label>
                <select
                  value={formData.note_type}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    note_type: e.target.value
                  }))}
                  className="w-full p-2 border rounded"
                >
                  {NOTE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Note Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    content: e.target.value
                  }))}
                  className="w-full p-2 border rounded h-32"
                  placeholder="Enter your note here..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/clients/${id}`)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Adding Note...' : 'Add Note'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
     </PageContainer>
  );
};

export default ClientNoteForm;