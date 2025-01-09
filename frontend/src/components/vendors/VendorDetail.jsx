import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DocumentList } from '../documents';

const InfoRow = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p>{value || 'N/A'}</p>
  </div>
);

const VendorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const [vendorRes, documentsRes] = await Promise.all([
          fetch(`/api/vendors/${id}`),
          fetch(`/api/documents/vendor/${id}`)
        ]);

        if (!vendorRes.ok) throw new Error('Failed to fetch vendor');

        const [vendorData, documentsData] = await Promise.all([
          vendorRes.json(),
          documentsRes.json()
        ]);

        setVendor(vendorData);
        setDocuments(documentsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching vendor data:', err);
        setError('Failed to load vendor details');
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/vendors/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete vendor');
      
      navigate('/vendors');
    } catch (error) {
      console.error('Error deleting vendor:', error);
      setError('Failed to delete vendor');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              Loading vendor details...
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
        <div className="max-w-7xl mx-auto">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{vendor.name}</h1>
            <p className="text-gray-600">
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

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium">Company Details</h3>
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
          </CardContent>
        </Card>

        {/* Associated Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentList
              documents={documents}
              entityType="vendor"
              entityId={id}
            />
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
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
      </div>
    </div>
  );
};

export default VendorDetail;