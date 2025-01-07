// src/components/documents/DocumentList.jsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Trash2, Plus, Search } from 'lucide-react';

const DocumentCard = ({ document, onDownload, onDelete }) => {
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
    return (bytes/(1024*1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-blue-500" />
        <div>
          <h3 className="font-medium">{document.original_name}</h3>
          <p className="text-sm text-gray-600">
            {formatFileSize(document.file_size)} • {document.category}
          </p>
          {document.description && (
            <p className="text-sm text-gray-500 mt-1">{document.description}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDownload(document)}
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(document.id)}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const DocumentList = ({ documents, entityType, entityId, onUpload, onDownload, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || doc.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(documents.map(doc => doc.category))];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Documents</CardTitle>
        <Button onClick={onUpload} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Upload
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                className="pl-9 w-full p-2 border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="p-2 border rounded-md"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Document List */}
          <div className="space-y-3">
            {filteredDocuments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No documents found
              </p>
            ) : (
              filteredDocuments.map(document => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onDownload={onDownload}
                  onDelete={onDelete}
                />
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentList;