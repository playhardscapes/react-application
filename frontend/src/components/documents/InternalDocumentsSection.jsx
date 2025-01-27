import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Download, Trash2, FileText } from 'lucide-react';

const InternalDocumentsSection = ({
  documents,
  loading,
  searchTerm,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
  onDelete,
  categories
}) => {
  const { token } = useAuth();



  return (
    <>
      {/* Search and Filter */}
      <div className="flex space-x-4 mt-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search documents..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <Select 
          value={selectedCategory || 'all'} 
          onValueChange={(value) => onCategoryChange(value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Document List */}
      <Card className="mt-4">
        <CardContent className="p-4">
          {loading ? (
            <p className="text-center text-gray-500">Loading documents...</p>
          ) : documents.length === 0 ? (
            <p className="text-center text-gray-500">No documents found</p>
          ) : (
            <div className="grid gap-4">
              {documents.map(doc => (
                <div 
                  key={`doc-${doc.id}`}
                  className="flex items-center justify-between p-4 border rounded hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-medium">{doc.original_name}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span className="px-2 py-1 bg-gray-100 rounded">
                          {doc.category?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                        {doc.description && (
                          <span>- {doc.description}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
    variant="ghost"
    size="sm"
    onClick={() => window.open(`/api/documents/${doc.id}/download?token=${token}`, '_blank')}
    className="text-gray-600 hover:text-gray-800"
  >
    <Download className="h-4 w-4" />
    <span className="ml-2">Download</span>
  </Button>
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(doc.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default InternalDocumentsSection;