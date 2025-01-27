// src/components/inventory/tools/EditTool.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, AlertCircle } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';

const TOOL_STATUSES = [
  'available', 
  'in-use', 
  'maintenance', 
  'retired'
];

const EditTool = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    brand: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    purchase_price: '',
    expected_lifetime_months: '',
    maintenance_interval_days: '',
    status: 'available',
    notes: ''
  });

  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        const response = await fetch(`/api/tools/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tool details');
        }
        const data = await response.json();
        setTool(data);
        setFormData({
          name: data.name || '',
          type: data.type || '',
          brand: data.brand || '',
          model: data.model || '',
          serial_number: data.serial_number || '',
          purchase_date: data.purchase_date 
            ? new Date(data.purchase_date).toISOString().split('T')[0] 
            : '',
          purchase_price: data.purchase_price || '',
          expected_lifetime_months: data.expected_lifetime_months || '',
          maintenance_interval_days: data.maintenance_interval_days || '',
          status: data.status || 'available',
          notes: data.notes || ''
        });
      } catch (error) {
        console.error('Error fetching tool details:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchToolDetails();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
  
    try {
      const response = await fetch(`/api/tools/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          purchase_date: formData.purchase_date ? new Date(formData.purchase_date).toISOString() : null,
          purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
          expected_lifetime_months: formData.expected_lifetime_months ? parseInt(formData.expected_lifetime_months) : null,
          maintenance_interval_days: formData.maintenance_interval_days ? parseInt(formData.maintenance_interval_days) : null
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || 
          errorData.error || 
          'Failed to update tool'
        );
      }
  
      navigate(`/inventory/tools/${id}`);
    } catch (error) {
      console.error('Error updating tool:', error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Card>
          <CardContent className="p-8 text-center">
            Loading tool details...
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-2 text-red-600 mb-4">
              <AlertCircle className="h-6 w-6" />
              <p>{error}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/inventory/tools')}
            >
              Back to Tools
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="3xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-8">
          <div>
            <CardTitle>Edit Tool</CardTitle>
            <p className="text-gray-600 mt-1">{tool.name}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(`/inventory/tools/${id}`)}
          >
            Cancel
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Model</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Serial Number</label>
                <input
                  type="text"
                  name="serial_number"
                  value={formData.serial_number}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  {TOOL_STATUSES.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Financial Information */}
              <div>
                <label className="block text-sm font-medium mb-1">Purchase Date</label>
                <input
                  type="date"
                  name="purchase_date"
                  value={formData.purchase_date}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Purchase Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5">$</span>
                  <input
                    type="number"
                    name="purchase_price"
                    value={formData.purchase_price}
                    onChange={handleChange}
                    className="w-full p-2 pl-8 border rounded"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Lifecycle Information */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Expected Lifetime (months)
                </label>
                <input
                  type="number"
                  name="expected_lifetime_months"
                  value={formData.expected_lifetime_months}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Maintenance Interval (days)
                </label>
                <input
                  type="number"
                  name="maintenance_interval_days"
                  value={formData.maintenance_interval_days}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  min="1"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full p-2 border rounded h-24"
                placeholder="Additional information about the tool..."
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default EditTool;