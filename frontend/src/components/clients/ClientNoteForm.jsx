// src/components/clients/ClientNoteForm.jsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const NOTE_TYPES = [
  { value: 'communication', label: 'Communication' },
  { value: 'internal', label: 'Internal Note' },
  { value: 'meeting_notes', label: 'Meeting Notes' },
  { value: 'other', label: 'Other' }
];

const ClientNoteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [formData, setFormData] = React.useState({
    note_type: 'communication',
    content: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/clients/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to add note');
      }

      navigate(`/clients/${id}`);
    } catch (error) {
      console.error('Error adding note:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-2xl mx-auto">
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
      </div>
    </div>
  );
};

export default ClientNoteForm;