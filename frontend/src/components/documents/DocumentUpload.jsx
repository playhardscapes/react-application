import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Upload, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { PageContainer } from '@/components/layout/PageContainer';
import AzureOCRService from '@/services/ocrService';
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

const DocumentUpload = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [useOCR, setUseOCR] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [metadata, setMetadata] = useState({
    entityType: '',
    entityId: '',
    category: '',
    description: '',
    isConfidential: false
  });
  const [entities, setEntities] = useState([]);

  // Auth check
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Fetch entities when entity type changes
  useEffect(() => {
    const fetchEntities = async () => {
      if (!metadata.entityType || !token) return;
      
      try {
        let fetchedEntities = [];
        switch (metadata.entityType) {
          case 'client':
            fetchedEntities = await documentService.getClients(token);
            break;
          case 'vendor':
            fetchedEntities = await documentService.getVendors(token);
            break;
          case 'project':
            fetchedEntities = await documentService.getProjects(token);
            break;
          case 'internal':
            fetchedEntities = [{
              id: 1,
              name: 'Play Hardscapes',
              type: 'internal'
            }];
            break;
        }
        setEntities(fetchedEntities);
      } catch (error) {
        console.error('Failed to fetch entities:', error);
        setError('Failed to load ' + metadata.entityType + 's');
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to load ${metadata.entityType}s. Please try again.`
        });
      }
    };

    fetchEntities();
  }, [metadata.entityType, token, toast]);

  // Handle file selection and OCR processing
  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
  
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
  
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF or image file (JPG, PNG)');
      return;
    }
  
    setFile(selectedFile);
    setError('');
  
    if (useOCR) {
      setProcessing(true);
      try {
        const result = await AzureOCRService.extractText(selectedFile, token);
        setExtractedText(result.text || '');
        if (result.text) {
          setMetadata(prev => ({
            ...prev,
            description: result.text.slice(0, 100) + '...'
          }));
        }
      } catch (error) {
        console.error('OCR Error:', error);
        setError('Failed to process document text. Continuing without OCR.');
      } finally {
        setProcessing(false);
      }
    }
  };
  
  const handleSubmit = async () => {
    console.log('Submitting with file:', file);
    console.log('Metadata:', metadata);
  
    if (!file || !metadata.entityType || !metadata.entityId || !metadata.category) {
      setError('Please fill in all required fields');
      return;
    }
  
    setIsUploading(true);
    setError('');
  
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', metadata.category);
      formData.append('description', metadata.description || '');
      
      if (extractedText) {
        formData.append('extracted_text', extractedText);
      }
  
      // Log FormData contents
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
  
      const response = await fetch(
        `/api/documents/${metadata.entityType}/${metadata.entityId}/upload`, 
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );
  
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server error:', errorData);
        throw new Error(`Upload failed: ${response.status} - ${errorData}`);
      }
  
      const result = await response.json();
      console.log('Upload result:', result);
      
      toast({
        title: "Success",
        description: "Document uploaded successfully"
      });
      navigate('/documents');
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Failed to upload document. Please try again.');
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to upload document"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <PageContainer>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Upload Document</CardTitle>
              <p className="text-gray-600 text-sm">Upload and categorize your document</p>
            </div>
          </div>
        </CardHeader>

          <CardContent className="space-y-6">
            {/* OCR Toggle */}
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="ocr">Document File</Label>
                <div className="text-sm text-gray-500">
                  Upload PDF or image files
                </div>
              </div>
              <div className="flex items-center space-x-2">
  <Label htmlFor="ocr" className="text-sm text-gray-600">
    Enable OCR
  </Label>
  <Switch
  id="ocr"
  checked={useOCR}
  onCheckedChange={(checked) => {
    console.log('OCR Toggle clicked:', checked);
    setUseOCR(checked);
  }}
  disabled={processing}
  className="relative h-[24px] w-[24px] cursor-pointer rounded-full bg-gray-200 transition-colors data-[state=checked]:bg-blue-500"
>
  <div
    className="absolute h-[20px] w-[20px] rounded-full bg-white transition-transform duration-200"
    style={{
      transform: useOCR ? 'translateX(22px)' : 'translateX(2px)',
      top: '2px'
    }}
  />
</Switch>
</div>
            </div>
           {/* File Upload Area */}
<div className="border-2 border-dashed rounded-lg p-8 text-center">
  <input
    type="file"
    id="file-upload"
    name="file"  // Added name attribute
    className="hidden"
    accept=".pdf,.jpg,.jpeg,.png"
    onChange={handleFileSelect}
    disabled={processing}
  />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-600">
                Click to upload or drag and drop
              </span>
              <span className="text-xs text-gray-500">
                PDF, PNG, JPG up to 10MB
              </span>
            </label>
            {file && (
              <p className="mt-2 text-sm text-blue-600">
                Selected: {file.name}
              </p>
            )}
          </div>

          {/* Document Type and Entity Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select
                value={metadata.entityType}
                onValueChange={(value) => setMetadata(prev => ({ 
                  ...prev, 
                  entityType: value,
                  entityId: value === 'internal' ? '1' : '',
                  category: '' 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client Document</SelectItem>
                  <SelectItem value="vendor">Vendor Document</SelectItem>
                  <SelectItem value="project">Project Document</SelectItem>
                  <SelectItem value="internal">Internal Document</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {metadata.entityType && metadata.entityType !== 'internal' && (
              <div className="space-y-2">
                <Label>Select {metadata.entityType}</Label>
                <Select
                  value={metadata.entityId}
                  onValueChange={(value) => setMetadata(prev => ({ 
                    ...prev, 
                    entityId: value 
                  }))}
                  disabled={!metadata.entityType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${metadata.entityType}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {entities.map(entity => (
                      <SelectItem 
                        key={entity.id} 
                        value={entity.id.toString()}
                      >
                        {entity.name || entity.title || `#${entity.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={metadata.category}
              onValueChange={(value) => setMetadata(prev => ({ 
                ...prev, 
                category: value 
              }))}
              disabled={!metadata.entityType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {metadata.entityType && DOCUMENT_CATEGORIES[metadata.entityType]?.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={metadata.description}
              onChange={(e) => setMetadata(prev => ({ 
                ...prev, 
                description: e.target.value 
              }))}
              placeholder="Enter document description"
              rows={3}
            />
          </div>

          {/* Extracted Text (if OCR enabled) */}
          {useOCR && extractedText && (
            <div className="space-y-2">
              <Label>Extracted Text</Label>
              <div className="p-4 bg-gray-50 rounded-lg text-sm max-h-40 overflow-y-auto">
                {extractedText}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/documents')}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!file || isUploading || !metadata.entityType || !metadata.entityId || !metadata.category}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Save Document'
            )}
          </Button>
        </CardFooter>
      </Card>
    </PageContainer>
  );
};

export default DocumentUpload;