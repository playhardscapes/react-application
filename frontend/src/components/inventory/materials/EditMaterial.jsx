// src/components/inventory/materials/EditMaterial.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PageContainer } from '@/components/layout/PageContainer';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const EditMaterial = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    unit: '',
    min_quantity: '',
    reorder_quantity: '',
    reorder_point: '',
    unit_cost: '',
    manufacturer: '',
    notes: ''
  });

  useEffect(() => {
    // Check authentication status
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { from: `/inventory/materials/${id}/edit` },
        replace: true 
      });
      return;
    }

    const fetchMaterialData = async () => {
      try {
        const headers = {
          'Authorization': `Bearer ${token}`
        };

        const materialRes = await fetch(`/api/materials/${id}`, { headers });

        // Handle potential authentication errors
        if (materialRes.status === 401) {
          throw new Error('Unauthorized');
        }

        if (!materialRes.ok) {
          throw new Error('Failed to fetch material details');
        }

        const materialData = await materialRes.json();

        // Populate form data
        setFormData({
          name: materialData.name || '',
          sku: materialData.sku || '',
          category: materialData.category || '',
          unit: materialData.unit || '',
          min_quantity: materialData.min_quantity?.toString() || '',
          reorder_quantity: materialData.reorder_quantity?.toString() || '',
          reorder_point: materialData.reorder_point?.toString() || '',
          unit_cost: materialData.unit_cost?.toString() || '',
          manufacturer: materialData.manufacturer || '',
          notes: materialData.notes || ''
        });

        setMaterial(materialData);
      } catch (error) {
        console.error('Error fetching material details:', error);
        
        if (error.message === 'Unauthorized') {
          navigate('/login', { 
            state: { from: `/inventory/materials/${id}/edit` },
            replace: true 
          });
          return;
        }

        setError(error.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMaterialData();
  }, [id, navigate, token, isAuthenticated]);

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
      const response = await fetch(`/api/materials/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update material');
      }

      toast({
        title: "Success",
        description: "Material updated successfully"
      });
      navigate(`/inventory/materials/${id}`);
    } catch (error) {
      console.error('Error updating material:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <Card>
          <CardContent className="p-8 text-center">
            Loading material details...
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
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              onClick={() => navigate('/inventory/materials')}
              className="mt-4"
            >
              Back to Materials
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Edit Material: {material.name}</CardTitle>
            <Button
              variant="outline"
              onClick={() => navigate(`/inventory/materials/${id}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">SKU</label>
                <Input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <Input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Unit</label>
                <Input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                />
              </div>

              {/* Stock Information */}
              <div>
                <label className="block text-sm font-medium mb-1">Minimum Quantity</label>
                <Input
                  type="number"
                  name="min_quantity"
                  value={formData.min_quantity}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Reorder Quantity</label>
                <Input
                  type="number"
                  name="reorder_quantity"
                  value={formData.reorder_quantity}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Reorder Point</label>
                <Input
                  type="number"
                  name="reorder_point"
                  value={formData.reorder_point}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Financial Information */}
              <div>
                <label className="block text-sm font-medium mb-1">Unit Cost</label>
                <Input
                  type="number"
                  name="unit_cost"
                  value={formData.unit_cost}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Manufacturer</label>
                <Input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional information..."
                className="h-24"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/inventory/materials/${id}`)}
                disabled={submitting}
              >
                Cancel
              </Button>
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

export default EditMaterial;