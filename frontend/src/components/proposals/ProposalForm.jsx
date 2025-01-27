// src/components/proposals/ProposalForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Editor } from '@tinymce/tinymce-react';
import { PageContainer } from '@/components/layout/PageContainer';

const INITIAL_FORM_STATE = {
  client_id: null,
  title: '',
  content: '',
  total_amount: 0,
  notes: '',
  status: 'draft'
};

const ProposalForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [currentTab, setCurrentTab] = useState('details');

  // Fetch clients and existing proposal (if editing)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch clients
        const clientsResponse = await fetch('/api/clients');
        const clientsData = await clientsResponse.json();
        setClients(clientsData);

        // If editing, fetch existing proposal
        if (id) {
          const proposalResponse = await fetch(`/api/proposals/${id}`);
          const proposalData = await proposalResponse.json();
          setFormData(proposalData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [id]);

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    if (!formData.client_id) {
      newErrors.client_id = 'Client is required';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.total_amount || formData.total_amount <= 0) {
      newErrors.total_amount = 'Total amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) return;

    setLoading(true);

    try {
      const url = id ? `/api/proposals/${id}` : '/api/proposals';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save proposal');
      }

      // Redirect to proposals list or proposal detail
      navigate('/proposals');
    } catch (error) {
      console.error('Error saving proposal:', error);
      // TODO: Add user-friendly error handling
    } finally {
      setLoading(false);
    }
  };

  // Send proposal
  const handleSendProposal = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetch(`/api/proposals/${id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to send proposal');
      }

      navigate('/proposals');
    } catch (error) {
      console.error('Error sending proposal:', error);
      // TODO: Add user-friendly error handling
    }
  };

  // Update form data
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <PageContainer>
        <Card>
          <CardHeader>
            <CardTitle>{id ? 'Edit Proposal' : 'Create New Proposal'}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid grid-cols-3 w-full mb-6">
                <TabsTrigger value="details">Proposal Details</TabsTrigger>
                <TabsTrigger value="content">Proposal Content</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Client</label>
                    <select
                      value={formData.client_id || ''}
                      onChange={(e) => handleChange('client_id', e.target.value)}
                      className={`w-full p-2 border rounded ${errors.client_id ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select a client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                    {errors.client_id && (
                      <p className="text-red-500 text-sm mt-1">{errors.client_id}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Proposal Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      className={`w-full p-2 border rounded ${errors.title ? 'border-red-500' : ''}`}
                      placeholder="Enter proposal title"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Total Amount</label>
                    <input
                      type="number"
                      value={formData.total_amount}
                      onChange={(e) => handleChange('total_amount', parseFloat(e.target.value))}
                      className={`w-full p-2 border rounded ${errors.total_amount ? 'border-red-500' : ''}`}
                      placeholder="Enter total project amount"
                    />
                    {errors.total_amount && (
                      <p className="text-red-500 text-sm mt-1">{errors.total_amount}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      className="w-full p-2 border rounded h-24"
                      placeholder="Additional notes or comments"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="content">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Proposal Content</h3>
                  <Editor
                    apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                    init={{
                      height: 500,
                      menubar: true,
                      plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 
                        'charmap', 'preview', 'anchor', 'searchreplace', 
                        'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'help', 'wordcount'
                      ],
                      toolbar: 'undo redo | blocks | ' +
                        'bold italic forecolor | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist outdent indent | ' +
                        'removeformat | help'
                    }}
                    value={formData.content}
                    onEditorChange={(content) => handleChange('content', content)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="preview">
                <div className="bg-gray-50 p-6 rounded">
                  <h3 className="text-xl font-semibold mb-4">Proposal Preview</h3>
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{__html: formData.content}} />
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end space-x-4">
              <Button 
                type="button"
                variant="outline"
                onClick={() => navigate('/proposals')}
              >
                Cancel
              </Button>
              {currentTab === 'details' && (
                <Button 
                  type="button"
                  onClick={() => setCurrentTab('content')}
                >
                  Next: Edit Content
                </Button>
              )}
              {currentTab === 'content' && (
                <Button 
                  type="button"
                  onClick={() => setCurrentTab('preview')}
                >
                  Preview
                </Button>
              )}
              {currentTab === 'preview' && (
                <Button 
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Proposal'}
                </Button>
              )}
              {id && formData.status === 'draft' && (
                <Button 
                  type="button"
                  onClick={handleSendProposal}
                >
                  Send Proposal
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
    </PageContainer>
  );
};

export default ProposalForm;