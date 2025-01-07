// src/components/inventory/RecordUsage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const RecordUsage = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [locations, setLocations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [formData, setFormData] = useState({
    materialId: '',
    locationId: '',
    projectId: '',
    quantity: '',
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [materialsRes, locationsRes, projectsRes] = await Promise.all([
          fetch('http://localhost:5000/api/materials/stock'),
          fetch('http://localhost:5000/api/materials/locations'),
          fetch('http://localhost:5000/api/projects')
        ]);

        const [materialsData, locationsData, projectsData] = await Promise.all([
          materialsRes.json(),
          locationsRes.json(),
          projectsRes.json()
        ]);

        setMaterials(materialsData);
        setLocations(locationsData);
        setProjects(projectsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (formData.materialId && formData.locationId) {
      const material = materials.find(m => 
        m.id === parseInt(formData.materialId) && 
        m.location_id === parseInt(formData.locationId)
      );
      setSelectedMaterial(material);
    } else {
      setSelectedMaterial(null);
    }
  }, [formData.materialId, formData.locationId, materials]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/materials/use', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to record usage');
      }

      navigate('/inventory');
    } catch (error) {
      console.error('Error recording material usage:', error);
      alert(error.message);
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
            <CardTitle>Record Material Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Project</label>
                <select
                  className="w-full p-2 border rounded"
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  required
                >
                  <option value="">Select project...</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title || `Project #${project.id}`}
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

              <div>
                <label className="block text-sm font-medium mb-1">Material</label>
                <select
                  className="w-full p-2 border rounded"
                  value={formData.materialId}
                  onChange={(e) => setFormData({ ...formData, materialId: e.target.value })}
                  required
                >
                  <option value="">Select material...</option>
                  {materials
                    .filter(m => !formData.locationId || m.location_id === parseInt(formData.locationId))
                    .map((material) => (
                      <option key={material.id} value={material.id}>
                        {material.name} - Available: {material.quantity} {material.unit}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                  min="0.01"
                  step="0.01"
                  max={selectedMaterial?.quantity || 0}
                />
                {selectedMaterial && (
                  <p className="text-sm text-gray-600 mt-1">
                    Available: {selectedMaterial.quantity} {selectedMaterial.unit}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  className="w-full p-2 border rounded h-24"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes about this usage..."
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
                  Record Usage
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecordUsage;