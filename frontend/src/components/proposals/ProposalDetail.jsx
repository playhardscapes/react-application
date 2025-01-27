// src/components/proposals/ProposalDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Editor } from '@tinymce/tinymce-react';
import { Loader2, Edit, Save } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';

const ProposalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const response = await fetch(`/api/proposals/${id}`);
        if (!response.ok) throw new Error('Failed to fetch proposal');
        const data = await response.json();
        setProposal(data);
        setContent(data.content);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/proposals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...proposal,
          content
        })
      });

      if (!response.ok) throw new Error('Failed to save proposal');
      
      const updatedProposal = await response.json();
      setProposal(updatedProposal);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2">Loading proposal...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <PageContainer>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-500">{error}</p>
              <Button 
                onClick={() => navigate('/proposals')}
                className="mt-4"
              >
                Back to Proposals
              </Button>
            </CardContent>
          </Card>
        </PageContainer>
    );
  }

  if (!proposal) return null;

  return (
    <PageContainer>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{proposal.title}</CardTitle>
                <p className="text-gray-600">For {proposal.client_name}</p>
              </div>
              <div className="flex gap-4">
                {editing ? (
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setEditing(true)}
                    variant="outline"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Proposal
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {editing ? (
              <Editor
                apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                value={content}
                onEditorChange={(newContent) => setContent(newContent)}
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
            ) : (
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}
          </CardContent>
        </Card>
      </PageContainer>
  );
};

export default ProposalDetail;