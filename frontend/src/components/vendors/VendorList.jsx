import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Plus, Upload } from 'lucide-react';
import { DocumentUpload } from '../documents';
import { PageContainer } from '@/components/layout/PageContainer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const VendorList = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();

  // Redirect to login if no token
  React.useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchVendors = async () => {
      if (!token) return;

      try {
        const response = await fetch('/api/vendors', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        // Ensure data is an array and has the expected structure
        const processedVendors = Array.isArray(data) ? data : 
          (data.vendors ? data.vendors : []);
        
        setVendors(processedVendors);
        setError(null);
      } catch (error) {
        console.error('Error fetching vendors:', error);
        setError(error.message);
        setVendors([]);
        toast({
          title: 'Error',
          description: 'Failed to load vendors',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [token, toast]);

  const filteredVendors = vendors.filter(vendor =>
    (vendor.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vendor.city || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBulkUpload = () => {
    setShowUploadModal(true);
  };

  const handleUploadComplete = (newDocuments) => {
    // Handle successful upload if needed
    setShowUploadModal(false);
    toast({
      title: 'Success',
      description: 'Vendors uploaded successfully',
      variant: 'default'
    });
  };

  if (loading) return (
    <PageContainer>
      <Card>
        <CardContent className="p-8 text-center">
          Loading vendors...
        </CardContent>
      </Card>
    </PageContainer>
  );

  if (error) return (
    <PageContainer>
      <Card>
        <CardContent className="p-8 text-center text-red-600">
          Error loading vendors: {error}
        </CardContent>
      </Card>
    </PageContainer>
  );

  return (
    <PageContainer>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Vendors</CardTitle>
              <p className="text-gray-600 text-sm">Manage vendors and payments</p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline"
                onClick={handleBulkUpload}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Bulk Upload
              </Button>
              <Button 
                onClick={() => navigate('/vendors/new')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Vendor
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative w-full mb-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors..."
              className="pl-9 w-full p-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Vendor List */}
          <div className="space-y-4">
            {filteredVendors.length === 0 ? (
              <p className="text-center py-4 text-gray-600">No vendors found</p>
            ) : (
              filteredVendors.map(vendor => (
                <div
                  key={vendor.id}
                  className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/vendors/${vendor.id}`)}
                >
                  <div>
                    <h3 className="font-medium">{vendor.name}</h3>
                    <p className="text-sm text-gray-600">
                      {vendor.city}, {vendor.state}
                    </p>
                    {vendor.payment_terms && (
                      <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        Terms: {vendor.payment_terms}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    {vendor.open_invoices > 0 && (
                      <p className="text-sm text-gray-600">
                        {vendor.open_invoices} open {vendor.open_invoices === 1 ? 'invoice' : 'invoices'}
                      </p>
                    )}
                    {vendor.total_outstanding > 0 && (
                      <p className="font-medium">
                        ${vendor.total_outstanding.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      

      {/* Document Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md">
            <DocumentUpload
              entityType="vendor"
              entityId="bulk"
              onUpload={handleUploadComplete}
              onCancel={() => setShowUploadModal(false)}
            />
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default VendorList;