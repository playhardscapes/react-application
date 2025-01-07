// src/components/vendors/VendorForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const VendorForm = ({ existingVendor = null }) => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    payment_terms: '',
    notes: '',
    // Contact fields
    sales_contact_name: '',
    sales_contact_email: '',
    ap_contact_name: '',
    ap_contact_email: '',
    ap_contact_phone: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      console.log('Submitting vendor data:', formData);

      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save vendor');
      }

      navigate('/vendors');
    } catch (error) {
      console.error('Error saving vendor:', error);
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Add New Vendor</CardTitle>
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
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Terms</label>
                    <select
                      value={formData.payment_terms}
                      onChange={e => setFormData({ ...formData, payment_terms: e.target.value })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Select terms...</option>
                      <option value="net15">Net 15</option>
                      <option value="net30">Net 30</option>
                      <option value="net45">Net 45</option>
                      <option value="net60">Net 60</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sales Contact */}
              <div>
                <h3 className="text-lg font-medium mb-4">Sales Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={formData.sales_contact_name}
                      onChange={e => setFormData({ ...formData, sales_contact_name: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={formData.sales_contact_email}
                      onChange={e => setFormData({ ...formData, sales_contact_email: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              </div>

              {/* AP Contact */}
              <div>
                <h3 className="text-lg font-medium mb-4">Accounts Payable Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={formData.ap_contact_name}
                      onChange={e => setFormData({ ...formData, ap_contact_name: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={formData.ap_contact_email}
                      onChange={e => setFormData({ ...formData, ap_contact_email: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      value={formData.ap_contact_phone}
                      onChange={e => setFormData({ ...formData, ap_contact_phone: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">Address Information</h3>
                <div>
                  <label className="block text-sm font-medium mb-1">Street Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={e => setFormData({ ...formData, state: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">ZIP Code</label>
                    <input
                      type="text"
                      value={formData.zip}
                      onChange={e => setFormData({ ...formData, zip: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-lg font-medium mb-4">Additional Notes</h3>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2 border rounded h-24"
                  placeholder="Add any additional notes about this vendor..."
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/vendors')}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Add Vendor
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorForm;