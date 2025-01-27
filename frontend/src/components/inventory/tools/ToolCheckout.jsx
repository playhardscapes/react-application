//src/components/inventory/tools/ToolCheckout.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';

const ToolCheckout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tool, setTool] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    projectId: '',
    expectedReturnDate: '',
    conditionOut: '',
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [toolRes, projectsRes] = await Promise.all([
          fetch(`/api/tools/${id}`),
          fetch('/api/projects?status=active')
        ]);

        if (!toolRes.ok) throw new Error('Failed to fetch tool');

        const [toolData, projectsData] = await Promise.all([
          toolRes.json(),
          projectsRes.json()
        ]);

        setTool(toolData);
        setProjects(projectsData);

        // Set default return date to 1 week from now
        const defaultReturn = new Date();
        defaultReturn.setDate(defaultReturn.getDate() + 7);
        setFormData(prev => ({
          ...prev,
          expectedReturnDate: defaultReturn.toISOString().split('T')[0]
        }));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/tools/${id}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to check out tool');

      navigate(`/inventory/tools/${id}`);
    } catch (error) {
      console.error('Error checking out tool:', error);
      alert('Failed to check out tool');
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

  if (tool.status !== 'available') {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-lg font-medium">Tool is not available</p>
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
            <h1 className="text-3xl font-bold">Check Out Tool</h1>
            <p className="text-gray-600">{tool.name}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Checkout Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Project
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    projectId: e.target.value
                  }))}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      Project #{project.id} - {project.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Expected Return Date
                </label>
                <input
                  type="date"
                  value={formData.expectedReturnDate}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    expectedReturnDate: e.target.value
                  }))}
                  className="w-full p-2 border rounded"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Condition at Checkout
                </label>
                <textarea
                  value={formData.conditionOut}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    conditionOut: e.target.value
                  }))}
                  className="w-full p-2 border rounded h-24"
                  placeholder="Note any existing damage or wear..."
                  required
                />
              </div>

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
                  placeholder="Any special instructions or notes..."
                />
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
                  <ArrowRight className="h-4 w-4" />
                  {submitting ? 'Processing...' : 'Check Out Tool'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default ToolCheckout;