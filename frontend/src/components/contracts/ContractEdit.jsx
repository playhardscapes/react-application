import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CONTRACT_STATUSES } from '@/constants/contracts';
import { Editor } from '@tinymce/tinymce-react';
import { 
  Loader2, 
  Save, 
  Download, 
  ArrowLeft, 
  Trash2,
  AlertCircle
} from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ContractEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const response = await fetch(`/api/contracts/${id}`);
        if (!response.ok) throw new Error('Failed to fetch contract');
        const data = await response.json();
        setContract(data);
        setContent(data.content);
      } catch (error) {
        console.error('Error fetching contract:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/contracts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: content,
          status: contract.status
        })
      });

      if (!response.ok) throw new Error('Failed to save contract');
      
      const updatedContract = await response.json();
      setContract(updatedContract);
      // Show success message or navigate
    } catch (error) {
      console.error('Error saving contract:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch(`/api/contracts/${id}/details`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }
      
      const updatedContract = await response.json();
      setContract(updatedContract);
    } catch (error) {
      console.error('Error updating status:', error);
      setError(error.message);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/contracts/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete contract');
      
      navigate('/contracts');
    } catch (error) {
      console.error('Error deleting contract:', error);
      setError(error.message);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/contracts/${id}/pdf`);
      if (!response.ok) throw new Error('Failed to generate PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contract-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2">Loading contract...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate('/contracts')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <CardTitle>Edit Contract</CardTitle>
                  {contract?.client_name && (
                    <p className="text-sm text-gray-500">
                      {contract.client_name}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Status Selector */}
                <select
  value={contract?.status || 'draft'}
  onChange={(e) => handleStatusChange(e.target.value)}
  className="px-3 py-1 border rounded-md text-sm"
>
  {CONTRACT_STATUSES.map(status => (
    <option key={status.value} value={status.value}>
      {status.label}
    </option>
  ))}
</select>

                <Button
                  variant="outline"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>

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
              </div>
            </div>
          </CardHeader>

          {error && (
            <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <CardContent>
            <Editor
              apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
              initialValue={content}
              onEditorChange={(newContent) => setContent(newContent)}
              init={{
                height: 800,
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
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={showDeleteDialog} 
        onOpenChange={setShowDeleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contract</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contract? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContractEdit;