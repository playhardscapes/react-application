import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/PageContainer';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs';
import {
  FileText,
  Building2,
  FolderKanban,
  Briefcase,
  Plus,
  Search,
  Trash2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import documentService from '@/services/documentServiceClient';

// Document categories constant
const DOCUMENT_CATEGORIES = {
  vendor: [
    'specifications',
    'technical_data',
    'product_data',
    'safety_data',
    'bills',
    'packing_lists',
    'other'
  ],
  client: [
    'invoice',
    'contract',
    'photos',
    'specifications',
    'other'
  ],
  project: [
    'project_specifications',
    'project_photos',
    'other'
  ],
  internal: [
    'tax_documents',
    'insurance_policies',
    'licenses',
    'certifications',
    'company_policies',
    'employee_documents',
    'legal_documents',
    'marketing_materials',
    'templates',
    'other'
  ]
};

const DocumentDashboard = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('client');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [entities, setEntities] = useState([]);
  const [error, setError] = useState(null);

  // Redirect to login if no token
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Tab configuration
  // Tab configuration in DocumentDashboard.jsx
const tabs = [
  {
    id: 'client',
    label: 'Client Documents',
    icon: Building2,
    fetchEntities: async (authToken) => {
      const clients = await documentService.getClients(token);
      return clients.filter(client => client.status === 'active');
    },
    entityType: 'client'
  },
  {
    id: 'vendor',
    label: 'Vendor Documents',
    icon: Briefcase,
    fetchEntities: async (authToken) => await documentService.getVendors(token),
    entityType: 'vendor'
  },
  {
    id: 'project',
    label: 'Project Documents',
    icon: FolderKanban,
    fetchEntities: async (authToken) => {
      const projects = await documentService.getProjects(token);
      return projects.filter(project =>
        ['pending', 'in_progress', 'on_hold'].includes(project.status)
      );
    },
    entityType: 'project'
  },
  {
    id: 'internal',
    label: 'Internal Documents',
    icon: Briefcase,
    fetchEntities: async (authToken) => [{
      id: 1,
      name: 'Play Hardscapes',
      type: 'internal'
    }],
    entityType: 'internal'
  }
];

// Entity fetching effect
useEffect(() => {
  const fetchEntities = async () => {
    if (!token) return;
    
    try {
      setError(null);
      setLoading(true);
      const currentTab = tabs.find(tab => tab.id === activeTab);
      if (!currentTab?.fetchEntities) return;

      const fetchedEntities = await currentTab.fetchEntities(token);
      setEntities(Array.isArray(fetchedEntities) ? fetchedEntities : []);
    } catch (error) {
      console.error('Failed to fetch entities:', error);
      setError('Failed to load ' + activeTab + 's');
      setEntities([]);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to load ${activeTab}s. Please try again.`
      });
    } finally {
      setLoading(false);
    }
  };

  setSelectedEntityId(null);
  setDocuments([]);
  fetchEntities();
}, [activeTab, token, toast]);

  // Document fetching effect
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!token || !selectedEntityId || !activeTab) return;
  
      try {
        setError(null);
        setLoading(true);
        const response = await fetch(
          `/api/documents/${activeTab}/${selectedEntityId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
  
        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }
  
        const data = await response.json();
        console.log('Fetched documents:', data);
        setDocuments(data);
      } catch (error) {
        console.error('Error fetching documents:', error);
        setError('Failed to load documents');
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load documents"
        });
      } finally {
        setLoading(false);
      }
    };
  
    fetchDocuments();
  }, [activeTab, selectedEntityId, token]);

  // Handle document deletion
  const handleDelete = async (documentId) => {
    if (!token) return;
    
    try {
      await documentService.deleteDocument(documentId, token);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast({
        title: "Success",
        description: "Document deleted successfully"
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete document"
      });
    }
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch =
      doc.original_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !selectedCategory || doc.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Get entity display name
  const getEntityDisplayName = (entity, entityType) => {
    if (!entity) return 'Unnamed';

    switch(entityType) {
      case 'project':
        return entity.title || `Project #${entity.id}`;
      case 'vendor':
      case 'client':
      default:
        return entity.name || `${entityType} #${entity.id}`;
    }
  };

  return (
    <PageContainer>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Document Management</CardTitle>
              <p className="text-gray-600 text-sm">Organize and manage your documents</p>
            </div>
            <Button
              onClick={() => navigate('/documents/upload')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Upload Document
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                {tabs.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {error ? (
              <p className="text-red-500 mt-4">{error}</p>
            ) : (
              <>
                <div className="mt-4">
                  <Select
                    value={selectedEntityId ? selectedEntityId.toString() : ''}
                    onValueChange={(value) => setSelectedEntityId(parseInt(value, 10))}
                  >
                    <SelectTrigger className="w-[300px]">
                      <SelectValue
                        placeholder={`Select ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {entities.map(entity => (
                        <SelectItem
                          key={`${activeTab}-${entity.id}`}
                          value={entity.id.toString()}
                        >
                          {getEntityDisplayName(entity, activeTab)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedEntityId && (
                  <>
                    <div className="flex space-x-4 mt-4">
                      <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Search documents..."
                          className="pl-10 w-full"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>

                      <Select
                        value={selectedCategory || 'all'}
                        onValueChange={(value) => setSelectedCategory(value === 'all' ? null : value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {['all', ...(DOCUMENT_CATEGORIES[activeTab] || [])].map(category => (
                            <SelectItem key={category} value={category}>
                              {category === 'all' ? 'All Categories' :
                                category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="mt-4 space-y-2">
                      {loading ? (
                        <p className="text-center text-gray-500">Loading documents...</p>
                      ) : filteredDocuments.length === 0 ? (
                        <p className="text-center text-gray-500">No documents found</p>
                      ) : (
                        filteredDocuments.map(doc => (
                          <div
                            key={`doc-${doc.id}`}
                            className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                          >
                            <div className="flex items-center space-x-3">
                              <FileText className="h-5 w-5 text-blue-500" />
                              <div>
                                <p className="font-medium">{doc.original_name}</p>
                                <p className="text-sm text-gray-500">
                                  {doc.category?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                  {doc.description && ` - ${doc.description}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`/api/documents/${doc.id}/download?token=${token}`, '_blank')}
                              >
                                Download
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(doc.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default DocumentDashboard;