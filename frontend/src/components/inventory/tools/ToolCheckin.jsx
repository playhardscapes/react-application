//src/components/inventory/tools/ToolCheckin.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Wrench, AlertCircle } from 'lucide-react';

const ToolCheckin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    conditionIn: '',
    needsMaintenance: false,
    maintenanceNotes: '',
    notes: ''
  });

  useEffect(() => {
    const fetchTool = async () => {
      try {
        const response = await fetch(`/api/tools/${id}`);
        if (!response.ok) throw new Error('Failed to fetch tool');
        const data = await response.json();
        setTool(data);
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
      const response = await fetch(`/api/tools/${id}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to check in tool');

      navigate(`/inventory/tools/${id}`);
    } catch (error) {
      console.error('Error checking in tool:', error);
      alert('Failed to check in tool');
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

  if (tool.status !== 'in-use') {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-lg font-medium">Tool is not checked out</p>
          <p className="text-gray-600 mb-4">
            Current status: {tool.status}
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate(`/inventory/tools/${id}`)}
          >
            Back to Tool Details
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
            <h1 className="text-3xl font-bold">Check In Tool</h1>
            <p className="text-gray-600">{tool.name}</p>
          </div>
        </div>

        {/* Current Assignment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Current Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Project</p>
                <p className="font-medium">Project #{tool.current_project}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Checked Out</p>
                <p className="font-medium">
                  {new Date(tool.current_checkout_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Expected Return</p>
                <p className="font-medium">
                  {new Date(tool.expected_return_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Checkout Condition</p>
                <p className="font-medium">{tool.condition_out || 'Not recorded'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Check-in Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Check-in Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Current Condition
                </label>
                <textarea
                  value={formData.conditionIn}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    conditionIn: e.target.value
                  }))}
                  className="w-full p-2 border rounded h-24"
                  placeholder="Note current condition, any damage or wear..."
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="needsMaintenance"
                  checked={formData.needsMaintenance}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    needsMaintenance: e.target.checked
                  }))}
                  className="h-4 w-4"
                />
                <label htmlFor="needsMaintenance" className="font-medium cursor-pointer">
                  Needs Maintenance
                </label>
              </div>

              {formData.needsMaintenance && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Maintenance Notes
                  </label>
                  <textarea
                    value={formData.maintenanceNotes}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      maintenanceNotes: e.target.value
                    }))}
                    className="w-full p-2 border rounded h-24"
                    placeholder="Describe maintenance needed..."
                    required
                  />
                </div>
              )}

              <div>
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
                  placeholder="Any additional notes..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/inventory/tools/${id}`)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                {formData.needsMaintenance ? (
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2"
                  >
                    <Wrench className="h-4 w-4" />
                    {submitting ? 'Processing...' : 'Check In & Flag for Maintenance'}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2"
                  >
                    <ArrowRight className="h-4 w-4" />
                    {submitting ? 'Processing...' : 'Check In Tool'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default ToolCheckin;