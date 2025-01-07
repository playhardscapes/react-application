// src/components/inventory/ReceiveMaterials.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ReceiveMaterials = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    materialId: '',
    vendorId: '',
    locationId: '',
    quantity: '',
    unitPrice: '',
    batchNumber: '',
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [materialsRes, vendorsRes, locationsRes] = await Promise.all([
          fetch('http://localhost:5000/api/materials'),
          fetch('http://localhost:5000/api/vendors'),
          fetch('http://localhost:5000/api/materials/locations')
        ]);

        const [materialsData, vendorsData, locationsData] = await Promise.all([
          materialsRes.json(),
          vendorsRes.json(),
          locationsRes.json()
        ]);

        setMaterials(materialsData);
        setVendors(vendorsData);
        setLocations(locationsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/materials/receive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          transactionType: 'receive',
          transactionDate: new Date().toISOString()
        }),
      });

      if (response.ok) {
        navigate('/inventory');
      }
    } catch (error) {
      console.error('Error receiving materials:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Receive Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Material</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={formData.materialId}
                    onChange={(e) => setFormData({ ...formData, materialId: e.target.value })}
                    required
                  >
                    <option value="">Select material...</option>
                    {materials.map((material) => (
                      <option key={material.id} value={material.id}>
                        {material.name} ({material.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Vendor</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={formData.vendorId}
                    onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                    required
                  >
                    <option value="">Select vendor...</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={formData.locationId}
                    onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                    required
                  >
                    <option value="">Select location...</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Unit Price</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Batch Number</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    className="w-full p-2 border rounded h-24"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/inventory')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Receive Materials
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};