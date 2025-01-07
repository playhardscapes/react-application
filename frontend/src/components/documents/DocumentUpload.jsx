// src/components/documents/DocumentUpload.jsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

const DOCUMENT_CATEGORIES = [
  'Invoice',
  'Contract',
  'W9',
  'Insurance',
  'Specifications',
  'Product Data',
  'Technical Document',
  'Other'
];

const DocumentUpload = ({ entityType, entityId, onUpload, onCancel }) => {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    description: ''
  });
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const data = new FormData();
      data.append('file', file);
      data.append('category', formData.category);
      data.append('description', formData.description);

      const response = await fetch(`/api/documents/${entityType}/${entityId}/upload`, {
        method: 'POST',
        body: data
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      onUpload(result);
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Document</label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                id="document-upload"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
              {!file ? (
                <label
                  htmlFor="document-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PDF, Word, or image files up to 10MB
                  </span>
                </label>
              ) : (
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <span className="text-sm font-medium">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              className="w-full p-2 border rounded"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Select category...</option>
              {DOCUMENT_CATEGORIES.map(category => (
                <option key={category} value={category.toLowerCase()}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              className="w-full p-2 border rounded h-24"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description of the document..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!file || uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;