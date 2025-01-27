import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { PageContainer } from '@/components/layout/PageContainer';

const CLIENT_TYPES = ['business', 'individual', 'organization'];
const CONTACT_METHODS = ['email', 'phone', 'both'];

const ClientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
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
    notes: '',
    initial_follow_up: {
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: ''
    }
  });

  // Redirect to login if no token
  React.useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
  }, [token, navigate]);

  React.useEffect(() => {
    if (!id || !token) return;

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
        
        // Remove the notes array from the form data since we're only using it for display
        const { notes, ...clientData } = data;
        
        setFormData({
          ...clientData,
          notes: '', // Set notes to empty string for new notes
          initial_follow_up: {
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            notes: ''
          }
        });
      } catch (error) {
        console.error('Error fetching client:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message
        });
        setError('Failed to load client details');
      }
    };

    fetchClient();
  }, [id, token, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First, save the client
      const clientResponse = await fetch(id ? `/api/clients/${id}` : '/api/clients', {
        method: id ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          // Remove notes from client data
          notes: undefined
        })
      });

      if (!clientResponse.ok) {
        const errorData = await clientResponse.json();
        throw new Error(errorData.message || 'Failed to save client');
      }

      const savedClient = await clientResponse.json();

      // If there are notes, create a note entry
      if (formData.notes?.trim()) {
        const noteResponse = await fetch(`/api/clients/${savedClient.id}/notes`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            content: formData.notes,
            note_type: 'internal'  // or any default type you prefer
          })
        });

        if (!noteResponse.ok) {
          const errorData = await noteResponse.json();
          throw new Error(errorData.message || 'Failed to save note');
        }
      }

      toast({
        title: "Success",
        description: id ? "Client updated successfully" : "Client created successfully"
      });

      navigate('/clients');
    } catch (error) {
      console.error('Error saving client:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to save client'
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

             {/* Source & Notes */}
             <div>
                <h3 className="text-lg font-medium mb-4">Source & Notes</h3>
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
                  
                  {/* Notes Section with adjusted spacing */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <div>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          notes: e.target.value
                        }))}
                        className="w-full p-3 border rounded min-h-[120px]"
                        placeholder="Add any additional notes about the client..."
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Add any relevant information about the client that doesn't fit in the fields above.
                      </p>
                    </div>
                  </div>

                  {!id && (
                    <div className="mt-6">
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
     </PageContainer>
  );
};

export default ClientForm;