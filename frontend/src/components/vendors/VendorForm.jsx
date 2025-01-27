import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/PageContainer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const VENDOR_TYPES = [
  'Material Supplier',
  'Equipment Supplier',
  'Service Provider',
  'Contractor',
  'Other'
];

const PAYMENT_TERMS = [
  'net15',
  'net30',
  'net45',
  'net60',
  'due on receipt'
];

const INITIAL_FORM_STATE = {
  name: '',
  vendor_type: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  payment_terms: '',
  notes: '',
  // Sales contact
  sales_contact_name: '',
  sales_contact_email: '',
  sales_contact_phone: '',
  // AP contact
  ap_contact_name: '',
  ap_contact_email: '',
  ap_contact_phone: ''
};

const VendorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  // Redirect to login if no token
  React.useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const loadVendor = useCallback(async () => {
    if (!id || !token) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/vendors/${id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to fetch vendor');
      
      setFormData({
        name: data.name || '',
        vendor_type: data.vendor_type || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zip: data.postal_code || data.zip || '',
        payment_terms: data.payment_terms || '',
        notes: data.notes || '',
        sales_contact_name: data.sales_contact_name || '',
        sales_contact_email: data.sales_contact_email || '',
        sales_contact_phone: data.sales_contact_phone || '',
        ap_contact_name: data.ap_contact_name || '',
        ap_contact_email: data.ap_contact_email || '',
        ap_contact_phone: data.ap_contact_phone || ''
      });
    } catch (err) {
      console.error('Error loading vendor:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [id, token, toast]);

  useEffect(() => {
    loadVendor();
  }, [loadVendor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name) {
      toast({
        title: 'Error',
        description: 'Company Name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Prepare the data for submission
      const submitData = {
        ...formData,
        // Remove zip and set postal_code
        postal_code: formData.zip || null,
        zip: undefined, // Remove zip from the data
        // Convert empty strings to null
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        payment_terms: formData.payment_terms || null,
        notes: formData.notes || null,
        vendor_type: formData.vendor_type || null,
        sales_contact_name: formData.sales_contact_name || null,
        sales_contact_email: formData.sales_contact_email || null,
        sales_contact_phone: formData.sales_contact_phone || null,
        ap_contact_name: formData.ap_contact_name || null,
        ap_contact_email: formData.ap_contact_email || null,
        ap_contact_phone: formData.ap_contact_phone || null
      };

      const response = await fetch(id ? `/api/vendors/${id}` : '/api/vendors', {
        method: id ? 'PUT' : 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to save vendor');
      
      toast({
        title: 'Success',
        description: id ? 'Vendor updated successfully' : 'Vendor added successfully',
        variant: 'default'
      });
      
      navigate('/vendors');
    } catch (err) {
      console.error('Error saving vendor:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  return (
    <PageContainer>
      <Card>
        <CardHeader>
          <CardTitle>{id ? 'Edit Vendor' : 'Add New Vendor'}</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Vendor Type</label>
                  <select
                    value={formData.vendor_type}
                    onChange={(e) => handleInputChange('vendor_type', e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select type...</option>
                    {VENDOR_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-lg font-medium mb-4">Address</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Street Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">ZIP Code</label>
                    <input
                      type="text"
                      value={formData.zip}
                      onChange={(e) => handleInputChange('zip', e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sales Contact */}
            <div>
              <h3 className="text-lg font-medium mb-4">Sales Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.sales_contact_name}
                    onChange={(e) => handleInputChange('sales_contact_name', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.sales_contact_email}
                    onChange={(e) => handleInputChange('sales_contact_email', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.sales_contact_phone}
                    onChange={(e) => handleInputChange('sales_contact_phone', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>

            {/* AP Contact */}
            <div>
              <h3 className="text-lg font-medium mb-4">AP Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.ap_contact_name}
                    onChange={(e) => handleInputChange('ap_contact_name', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.ap_contact_email}
                    onChange={(e) => handleInputChange('ap_contact_email', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.ap_contact_phone}
                    onChange={(e) => handleInputChange('ap_contact_phone', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>

            {/* Payment & Notes */}
            <div>
              <h3 className="text-lg font-medium mb-4">Payment & Notes</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Terms</label>
                  <select
                    value={formData.payment_terms}
                    onChange={(e) => handleInputChange('payment_terms', e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select terms...</option>
                    {PAYMENT_TERMS.map(term => (
                      <option key={term} value={term}>{term}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full p-2 border rounded h-24"
                    placeholder="Additional notes about this vendor..."
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/vendors')}
              >
                Cancel
              </Button>
              <Button type="submit">
                {id ? 'Update Vendor' : 'Add Vendor'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </PageContainer>
  );
};

export default VendorForm;