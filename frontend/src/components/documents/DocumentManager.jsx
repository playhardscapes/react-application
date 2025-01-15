// src/components/documents/DocumentManager.jsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Folder, File, Upload, Trash2 } from 'lucide-react';

const DOCUMENT_CATEGORIES = {
  'brochures': 'Brochures',
  'csi-spec': 'CSI SPEC',
  'installation-guides': 'Installation Guides',
  'maintenance-guides': 'Maintenance Guides',
  'sds': 'SDS - Safety Data Sheets',
  'tds': 'TDS - Technical Data Sheets'
};

const DocumentManager = ({ entityType, entityId, vendorName }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [documents, setDocuments] = useState([]);

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    setUploadingFiles(true);
    try {
      const formData = new FormData();
      formData.append('entity_type', entityType);
      formData.append('entity_id', entityId);
      formData.append('category', selectedCategory);
      
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const newDocs = await response.json();
      setDocuments(prev => [...prev, ...newDocs]);

    } catch (error) {
      console.error('Upload error:', error);
      // TODO: Add error notification
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleDelete = async (documentId) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Delete failed');

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (error) {
      console.error('Delete error:', error);
      // TODO: Add error notification
    }
  };

  const sanitizePath = (name) => {
    return name.replace(/[^a-zA-Z0-9]/g, '');
  };

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(DOCUMENT_CATEGORIES).map(([key, label]) => (
          <Card 
            key={key}
            className={`cursor-pointer ${
              selectedCategory === key ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedCategory(key)}
          >
            <CardContent className="p-4 text-center">
              <Folder 
                className={`mx-auto h-8 w-8 mb-2 ${
                  selectedCategory === key ? 'text-blue-500' : 'text-gray-400'
                }`} 
              />
              <p className="text-sm font-medium">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload Section */}
      {selectedCategory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{DOCUMENT_CATEGORIES[selectedCategory]}</span>
              <div>
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploadingFiles}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file-upload').click()}
                  disabled={uploadingFiles}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingFiles ? 'Uploading...' : 'Upload PDF'}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Document List */}
            <div className="space-y-2">
              {documents
                .filter(doc => doc.category === selectedCategory)
                .map(doc => (
                  <div 
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <File className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">{doc.original_name}</p>
                        <p className="text-sm text-gray-500">
                          {doc.description || 'No description'}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/vendors/${sanitizePath(vendorName)}/${selectedCategory}/${doc.filename}`, '_blank')}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentManager;