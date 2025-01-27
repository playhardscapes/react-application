import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  FileText, 
  Download, 
  Trash2, 
  Search, 
  ChevronDown,
  ChevronUp,
  Eye,
  File,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const DocumentCard = ({ document, onDownload, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
    return (bytes/(1024*1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className="border rounded-lg bg-white shadow-sm"
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3 flex-grow">
            <div className="mt-1">
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{document.original_name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <span>{formatFileSize(document.file_size)}</span>
                    <span>•</span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                      {document.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDownload(document.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(document.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>
              
              {/* Document Metadata */}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(document.created_at)}</span>
                </div>
                {document.description && (
                  <div className="flex items-center gap-1">
                    <File className="h-4 w-4" />
                    <span>{document.description}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <CollapsibleContent>
        {document.extracted_text && (
          <div className="px-4 pb-4">
            <div className="mt-2 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <Eye className="h-4 w-4" />
                <span>Extracted Text</span>
              </div>
              <div className="text-sm text-gray-600 whitespace-pre-wrap">
                {document.extracted_text}
              </div>
            </div>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

const DocumentList = ({ documents = [], entityType, entityId, onDelete }) => {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleDownload = async (documentId) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const filename = response.headers.get('content-disposition')
        ?.split('filename=')[1]
        ?.replace(/['"]/g, '') || 'download';

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download document');
    }
  };

  const safeDocuments = Array.isArray(documents) ? documents : [];

  const filteredDocuments = safeDocuments.filter(doc => {
    const matchesSearch = (
      (doc.original_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.extracted_text || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(safeDocuments.map(doc => doc.category).filter(Boolean))];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>

      {/* Search and Filters */}
      <div className="px-6 pb-4 border-b">
        <div className="flex items-center gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' 
                    ? 'All Categories' 
                    : category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Document List */}
      <CardContent className="p-6">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No documents found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map(doc => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onDownload={handleDownload}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentList;