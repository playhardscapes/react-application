// src/components/proposals/CreateFromEstimate.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Editor } from '@tinymce/tinymce-react';
import { Loader2 } from 'lucide-react';

const CreateFromEstimate = () => {
  const { estimateId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const [proposalContent, setProposalContent] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEstimate = async () => {
      try {
        const response = await fetch(`/api/estimates/${estimateId}`);
        if (!response.ok) throw new Error('Failed to fetch estimate');
        const data = await response.json();
        setEstimate(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEstimate();
  }, [estimateId]);

  const handleGenerateProposal = async () => {
    setGenerating(true);
    try {
      const response = await fetch(`/api/proposals/generate/${estimateId}`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to generate proposal');
      
      const data = await response.json();
      setProposalContent(data.content);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/proposals/from-estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          estimateId,
          content: proposalContent,
          title: `${estimate.project_type || 'Court'} Construction Proposal - ${estimate.project_location}`
        })
      });

      if (!response.ok) throw new Error('Failed to save proposal');
      
      const proposal = await response.json();
      navigate(`/proposals/${proposal.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2">Loading estimate details...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-500">{error}</p>
              <Button 
                onClick={() => navigate('/estimates')}
                className="mt-4"
              >
                Back to Estimates
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <PageContainer>
        <Card>
          <CardHeader>
            <CardTitle>Create Proposal from Estimate</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Estimate Summary */}
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">Estimate Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Client</p>
                  <p className="font-medium">{estimate.client_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{estimate.project_location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-medium">${estimate.total_amount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Area</p>
                  <p className="font-medium">{estimate.square_footage} sq ft</p>
                </div>
              </div>
            </div>

            {!proposalContent ? (
              <div className="text-center py-8">
                <Button
                  onClick={handleGenerateProposal}
                  disabled={generating}
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Proposal...
                    </>
                  ) : (
                    'Generate Proposal with AI'
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Editor
                  apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                  value={proposalContent}
                  onEditorChange={(content) => setProposalContent(content)}
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
                />

                <div className="flex justify-end space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/estimates/${estimateId}`)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGenerateProposal}
                    variant="outline"
                    disabled={generating}
                  >
                    Regenerate
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Proposal'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateFromEstimate;