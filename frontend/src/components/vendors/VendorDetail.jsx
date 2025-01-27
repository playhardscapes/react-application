import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DocumentList } from '../documents';
import { PageContainer } from '@/components/layout/PageContainer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const InfoRow = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p>{value || 'N/A'}</p>
  </div>
);

const VendorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const [vendor, setVendor] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Redirect to login if no token
  React.useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchVendorData = async () => {
      if (!token) return;

      try {
        const [vendorRes, documentsRes] = await Promise.all([
          fetch(`/api/vendors/${id}`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch(`/api/documents/vendor/${id}`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        ]);

        const vendorData = await vendorRes.json();

        let documentsData = [];
        if (documentsRes.ok) {
          documentsData = await documentsRes.json();
        }

        setVendor(vendorData);
        setDocuments(Array.isArray(documentsData) ? documentsData : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching vendor data:', err);
        setError('Failed to load vendor details');
        toast({
          title: 'Error',
          description: 'Failed to load vendor details',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [id, token, toast]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/vendors/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to delete vendor');
      
      toast({
        title: 'Success',
        description: 'Vendor deleted successfully',
        variant: 'default'
      });
      navigate('/vendors');
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete vendor',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleDocumentDelete = async (documentId) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast({
        title: 'Success',
        description: 'Document deleted successfully',
        variant: 'default'
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Card>
          <CardContent className="p-8 text-center">
            Loading vendor details...
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  if (error || !vendor) {
    return (
      <PageContainer>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-500">{error || 'Vendor not found'}</p>
            <Button 
              onClick={() => navigate('/vendors')}
              className="mt-4"
            >
              Back to Vendors
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{vendor.name}</CardTitle>
              <p className="text-gray-600 text-sm">
                {vendor.city}{vendor.state ? `, ${vendor.state}` : ''}
              </p>
              {vendor.vendor_type && (
                <span className="inline-block mt-2 px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                  {vendor.vendor_type}
                </span>
              )}
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => navigate(`/vendors/${id}/edit`)}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
              >
                Delete Vendor
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* Contact Information */}
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Company Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InfoRow label="Main Email" value={vendor.email} />
                    <InfoRow label="Main Phone" value={vendor.phone} />
                  </div>
                  <div>
                    <InfoRow 
                      label="Address" 
                      value={[
                        vendor.address,
                        [vendor.city, vendor.state, vendor.postal_code || vendor.zip]
                          .filter(Boolean)
                          .join(', ')
                      ].filter(Boolean).join('\n')}
                    />
                  </div>
                  <InfoRow label="Payment Terms" value={vendor.payment_terms} />
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Sales Contact</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <InfoRow label="Name" value={vendor.sales_contact_name} />
                    <InfoRow label="Phone" value={vendor.sales_contact_phone} />
                    <div className="col-span-2">
                      <InfoRow label="Email" value={vendor.sales_contact_email} />
                    </div>
                  </div>

                  <h3 className="font-medium pt-4">AP Contact</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <InfoRow label="Name" value={vendor.ap_contact_name} />
                    <InfoRow label="Phone" value={vendor.ap_contact_phone} />
                    <div className="col-span-2">
                      <InfoRow label="Email" value={vendor.ap_contact_email} />
                    </div>
                  </div>
                </div>
              </div>

              {vendor.notes && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium mb-2">Notes</h3>
                  <p className="text-gray-600">{vendor.notes}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        {/* Associated Documents */}
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Documents</CardTitle>
            <Button 
              variant="outline"
              onClick={() => navigate(`/documents/upload?type=vendor&id=${id}`)}
            >
              Upload Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DocumentList
            documents={documents}
            entityType="vendor"
            entityId={id}
            onDelete={handleDocumentDelete}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium mb-4">Delete Vendor</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this vendor? This action cannot be undone,
              and all associated invoices and documents will also be deleted.
            </p>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default VendorDetail;