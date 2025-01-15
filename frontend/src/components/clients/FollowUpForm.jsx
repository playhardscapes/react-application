// src/components/clients/FollowUpForm.jsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const FOLLOW_UP_TYPES = [
  { value: 'call', label: 'Phone Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'site_visit', label: 'Site Visit' },
  { value: 'other', label: 'Other' }
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

const FollowUpForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [clientName, setClientName] = React.useState('');
  const [formData, setFormData] = React.useState({
    follow_up_date: new Date().toISOString().split('T')[0],
    type: 'call',
    priority: 'medium',
    notes: '',
  });

  // Fetch client details when component mounts
  React.useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await fetch(`/api/clients/${id}`);
        const data = await response.json();
        setClientName(data.name);
      } catch (error) {
        console.error('Error fetching client:', error);
        setError('Failed to load client details');
      }
    };

    fetchClient();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/clients/${id}/follow-ups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to schedule follow-up');
      }

      navigate(`/clients/${id}`);
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
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
            <CardTitle>Schedule Follow-up</CardTitle>
            {clientName && (
              <p className="text-gray-600">For {clientName}</p>
            )}
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Follow-up Date *</label>
                <input
                  type="date"
                  value={formData.follow_up_date}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    follow_up_date: e.target.value
                  }))}
                  className="w-full p-2 border rounded"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      type: e.target.value
                    }))}
                    className="w-full p-2 border rounded"
                  >
                    {FOLLOW_UP_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      priority: e.target.value
                    }))}
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
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  className="w-full p-2 border rounded h-32"
                  placeholder="What needs to be followed up on?"
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
                <Button 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? 'Scheduling...' : 'Schedule Follow-up'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FollowUpForm;