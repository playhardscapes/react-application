import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const CLIENT_TYPES = ['business', 'individual', 'organization'];
const CONTACT_METHODS = ['email', 'phone', 'both'];

const ClientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    organization: '',
    type: 'business',
    preferred_contact_method: 'email',
    source: '',
    initial_follow_up: {
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: ''
    }
  });

  React.useEffect(() => {
    if (id) {
      const fetchClient = async () => {
        try {
          const response = await fetch(`/api/clients/${id}`);
          const data = await response.json();
          setFormData({
            ...data,
            initial_follow_up: {
              date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              notes: ''
            }
          });
        } catch (error) {
          console.error('Error fetching client:', error);
          setError('Failed to load client details');
        }
      };
      fetchClient();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(id ? `/api/clients/${id}` : '/api/clients', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save client');
      }

      navigate('/clients');
    } catch (error) {
      console.error('Error saving client:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{id ? 'Edit Client' : 'Add New Client'}</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        name: e.target.value
                      }))}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Organization</label>
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        organization: e.target.value
                      }))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        email: e.target.value
                      }))}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        phone: e.target.value
                      }))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-lg font-medium mb-4">Address</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Street Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: e.target.value
                      }))}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">City</label>
                      
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          city: e.target.value
                        }))}
                        className="w-full p-2 border rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">State</label>
                      <input
                        type="text"
                        maxLength={2}
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          state: e.target.value.toUpperCase()
                        }))}
                        className="w-full p-2 border rounded"
                        placeholder="VA"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">ZIP</label>
                      <input
                        type="text"
                        value={formData.zip}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          zip: e.target.value
                        }))}
                        className="w-full p-2 border rounded"
                        maxLength={5}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Type & Preferences */}
              <div>
                <h3 className="text-lg font-medium mb-4">Client Type & Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Client Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        type: e.target.value
                      }))}
                      className="w-full p-2 border rounded"
                    >
                      {CLIENT_TYPES.map(type => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Preferred Contact Method</label>
                    <select
                      value={formData.preferred_contact_method}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        preferred_contact_method: e.target.value
                      }))}
                      className="w-full p-2 border rounded"
                    >
                      {CONTACT_METHODS.map(method => (
                        <option key={method} value={method}>
                          {method.charAt(0).toUpperCase() + method.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Source & Initial Follow-up */}
              <div>
                <h3 className="text-lg font-medium mb-4">Source & Follow-up</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Source</label>
                    <input
                      type="text"
                      value={formData.source}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        source: e.target.value
                      }))}
                      className="w-full p-2 border rounded"
                      placeholder="How did they find us?"
                    />
                  </div>

                  {!id && ( // Only show for new clients
                    <div>
                      <label className="block text-sm font-medium mb-1">Schedule Initial Follow-up</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Follow-up Date</label>
                          <input
                            type="date"
                            value={formData.initial_follow_up.date}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              initial_follow_up: {
                                ...prev.initial_follow_up,
                                date: e.target.value
                              }
                            }))}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Notes</label>
                          <textarea
                            value={formData.initial_follow_up.notes}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              initial_follow_up: {
                                ...prev.initial_follow_up,
                                notes: e.target.value
                              }
                            }))}
                            className="w-full p-2 border rounded"
                            placeholder="Follow-up notes or reminders..."
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/clients')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : id ? 'Update Client' : 'Create Client'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientForm;