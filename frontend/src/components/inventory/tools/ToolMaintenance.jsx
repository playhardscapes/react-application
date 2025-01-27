//src/components/inventory/tools/ToolMaintenance.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wrench, Calendar } from 'lucide-react';

const MAINTENANCE_TYPES = [
  { value: 'routine', label: 'Routine Maintenance' },
  { value: 'repair', label: 'Repair' },
  { value: 'inspection', label: 'Inspection/Check' },
  { value: 'calibration', label: 'Calibration' },
  { value: 'replacement', label: 'Parts Replacement' }
];

const ToolMaintenance = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    maintenanceType: 'routine',
    maintenanceDate: new Date().toISOString().split('T')[0],
    nextMaintenanceDate: '',
    cost: '',
    performedBy: '',
    description: '',
    parts: '',
    notes: ''
  });

  useEffect(() => {
    const fetchTool = async () => {
      try {
        const response = await fetch(`/api/tools/${id}`);
        if (!response.ok) throw new Error('Failed to fetch tool');
        const data = await response.json();
        setTool(data);

        // Set default next maintenance date based on interval
        if (data.maintenance_interval_days) {
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + data.maintenance_interval_days);
          setFormData(prev => ({
            ...prev,
            nextMaintenanceDate: nextDate.toISOString().split('T')[0]
          }));
        }
      } catch (error) {
        console.error('Error fetching tool:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTool();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/tools/${id}/maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to record maintenance');

      navigate(`/inventory/tools/${id}`);
    } catch (error) {
      console.error('Error recording maintenance:', error);
      alert('Failed to record maintenance');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!tool) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-600">Tool not found</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/inventory/tools')}
            className="mt-4"
          >
            Back to Tools
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/inventory/tools/${id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Record Maintenance</h1>
            <p className="text-gray-600">{tool.name}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Maintenance Type
                  </label>
                  <select
                    value={formData.maintenanceType}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      maintenanceType: e.target.value
                    }))}
                    className="w-full p-2 border rounded"
                    required
                  >
                    {MAINTENANCE_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Maintenance Date
                  </label>
                  <input
                    type="date"
                    value={formData.maintenanceDate}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      maintenanceDate: e.target.value
                    }))}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Next Maintenance Due
                  </label>
                  <input
                    type="date"
                    value={formData.nextMaintenanceDate}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      nextMaintenanceDate: e.target.value
                    }))}
                    className="w-full p-2 border rounded"
                    min={formData.maintenanceDate}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Cost
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2">$</span>
                    <input
                      type="number"
                      value={formData.cost}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        cost: e.target.value
                      }))}
                      className="w-full p-2 pl-8 border rounded"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Performed By
                  </label>
                  <input
                    type="text"
                    value={formData.performedBy}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      performedBy: e.target.value
                    }))}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                    className="w-full p-2 border rounded h-24"
                    required
                    placeholder="Describe the maintenance performed..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Parts Used/Replaced
                  </label>
                  <textarea
                    value={formData.parts}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      parts: e.target.value
                    }))}
                    className="w-full p-2 border rounded h-24"
                    placeholder="List any parts that were used or replaced..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                    className="w-full p-2 border rounded h-24"
                    placeholder="Any additional notes or observations..."
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/inventory/tools/${id}`)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2"
                >
                  <Wrench className="h-4 w-4" />
                  {submitting ? 'Recording...' : 'Record Maintenance'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Last Maintenance Info */}
        {tool.last_maintenance_date && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Previous Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Last Maintenance Date</p>
                  <p className="font-medium">
                    {new Date(tool.last_maintenance_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Maintenance Type</p>
                  <p className="font-medium">{tool.last_maintenance_type}</p>
                </div>
                {tool.last_maintenance_cost && (
                  <div>
                    <p className="text-sm text-gray-600">Cost</p>
                    <p className="font-medium">${tool.last_maintenance_cost.toLocaleString()}</p>
                  </div>
                )}
                {tool.last_maintenance_by && (
                  <div>
                    <p className="text-sm text-gray-600">Performed By</p>
                    <p className="font-medium">{tool.last_maintenance_by}</p>
                  </div>
                )}
                {tool.last_maintenance_notes && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Notes</p>
                    <p className="font-medium">{tool.last_maintenance_notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ToolMaintenance;