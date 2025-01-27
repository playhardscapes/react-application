// src/components/inventory/audit/MaterialAudit.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ClipboardCheck, 
  AlertCircle,
  Plus,
  Minus,
  Save
} from 'lucide-react';

const MaterialAudit = () => {
  const [materials, setMaterials] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [counts, setCounts] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [materialsRes, locationsRes] = await Promise.all([
          fetch('/api/materials'),
          fetch('/api/materials/locations')
        ]);

        const [materialsData, locationsData] = await Promise.all([
          materialsRes.json(),
          locationsRes.json()
        ]);

        setMaterials(materialsData);
        setLocations(locationsData);

        // Initialize counts object
        const initialCounts = {};
        materialsData.forEach(material => {
          initialCounts[material.id] = material.quantity || 0;
        });
        setCounts(initialCounts);
      } catch (error) {
        console.error('Error fetching audit data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCountChange = (materialId, value) => {
    setCounts(prev => ({
      ...prev,
      [materialId]: Math.max(0, value)
    }));
  };

  const handleSubmit = async () => {
    if (!selectedLocation) {
      alert('Please select a location');
      return;
    }

    setSubmitting(true);
    try {
      const countData = Object.entries(counts).map(([materialId, quantity]) => ({
        materialId: parseInt(materialId),
        locationId: parseInt(selectedLocation),
        quantity
      }));

      const response = await fetch('/api/inventory/audit/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ counts: countData })
      });

      if (!response.ok) throw new Error('Failed to submit audit');

      const result = await response.json();
      
      // Show discrepancies if any
      if (result.discrepancies.length > 0) {
        alert(`Found ${result.discrepancies.length} discrepancies. Please review.`);
      } else {
        alert('Audit completed successfully');
      }
    } catch (error) {
      console.error('Error submitting audit:', error);
      alert('Failed to submit audit');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Material Count</h3>
          <p className="text-sm text-gray-600">
            Enter current quantities for each material
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">Select Location</option>
            {locations.map(location => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
          <Button
            onClick={handleSubmit}
            disabled={!selectedLocation || submitting}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {submitting ? 'Saving...' : 'Submit Audit'}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {materials.map(material => {
          const currentCount = counts[material.id] || 0;
          const systemCount = material.quantity || 0;
          const discrepancy = currentCount !== systemCount;

          return (
            <Card key={material.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{material.name}</h4>
                    <p className="text-sm text-gray-600">
                      {material.category} - {material.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCountChange(material.id, currentCount - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <input
                        type="number"
                        value={currentCount}
                        onChange={(e) => handleCountChange(material.id, parseInt(e.target.value) || 0)}
                        className="w-24 p-2 border rounded text-center"
                        min="0"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCountChange(material.id, currentCount + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {discrepancy && (
                      <div className="flex items-center gap-2 text-yellow-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">
                          System shows: {systemCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MaterialAudit;