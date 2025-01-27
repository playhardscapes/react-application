import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/PageContainer';
import { 
  Drill,
  Calendar,
  ArrowLeft,
  Edit,
  AlertCircle,
  CheckSquare,
  History,
  Wrench,
  ArrowRight
} from 'lucide-react';

const MaintenanceHistory = ({ history }) => (
  <div className="space-y-3">
    {history.map(record => (
      <div 
        key={record.id}
        className="flex justify-between items-start p-3 border rounded bg-gray-50"
      >
        <div>
          <p className="font-medium">{record.maintenance_type}</p>
          <p className="text-sm text-gray-600">{record.description}</p>
          <p className="text-sm text-gray-600">
            Performed by: {record.performed_by_name}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">
            {new Date(record.maintenance_date).toLocaleDateString()}
          </p>
          {record.cost && (
            <p className="text-sm font-medium">
              ${record.cost.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    ))}
  </div>
);

const AssignmentHistory = ({ history }) => (
  <div className="space-y-3">
    {history.map(assignment => (
      <div 
        key={assignment.id}
        className="flex justify-between items-start p-3 border rounded bg-gray-50"
      >
        <div>
          <p className="font-medium">Project #{assignment.project_id}</p>
          <p className="text-sm text-gray-600">
            Checked out by: {assignment.checked_out_by_name}
          </p>
          {assignment.checked_in_by_name && (
            <p className="text-sm text-gray-600">
              Returned by: {assignment.checked_in_by_name}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">
            {new Date(assignment.checked_out_at).toLocaleDateString()} 
            {assignment.checked_in_at && (
              <>
                <ArrowRight className="inline h-4 w-4 mx-1" />
                {new Date(assignment.checked_in_at).toLocaleDateString()}
              </>
            )}
          </p>
          {assignment.condition_in && (
            <p className="text-sm text-gray-600">
              Condition: {assignment.condition_in}
            </p>
          )}
        </div>
      </div>
    ))}
  </div>
);

const ToolDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [assignmentHistory, setAssignmentHistory] = useState([]);

  useEffect(() => {
    const fetchToolData = async () => {
      try {
        const [toolRes, maintenanceRes, assignmentsRes] = await Promise.all([
          fetch(`/api/tools/${id}`),
          fetch(`/api/tools/${id}/maintenance`),
          fetch(`/api/tools/${id}/assignments`)
        ]);

        if (!toolRes.ok) throw new Error('Failed to fetch tool');

        const [toolData, maintenanceData, assignmentsData] = await Promise.all([
          toolRes.json(),
          maintenanceRes.json(),
          assignmentsRes.json()
        ]);

        setTool(toolData);
        setMaintenanceHistory(maintenanceData);
        setAssignmentHistory(assignmentsData);
      } catch (error) {
        console.error('Error fetching tool details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchToolData();
  }, [id]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in-use': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'retired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (!tool) {
    return (
      <PageContainer>
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
          </PageContainer>
    );
  }

  const maintenanceDue = tool.next_maintenance_date && 
    new Date(tool.next_maintenance_date) <= new Date();

  return (
    <PageContainer>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                
                <div>
                  <CardTitle>{tool.name}</CardTitle>
                  <p className="text-gray-600">{tool.brand} {tool.model}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/inventory/tools/${id}/edit`)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                {tool.status === 'in-use' && (
                  <Button
                    onClick={() => navigate(`/inventory/tools/${id}/checkin`)}
                    className="flex items-center gap-2"
                  >
                    <CheckSquare className="h-4 w-4" />
                    Check In
                  </Button>
                )}
                {tool.status === 'available' && (
                  <Button
                    onClick={() => navigate(`/inventory/tools/${id}/checkout`)}
                    className="flex items-center gap-2"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Check Out
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Drill className="h-8 w-8 text-blue-600" />
                <div>
                  <p className={`inline-block px-2 py-0.5 text-sm rounded-full ${getStatusBadgeClass(tool.status)}`}>
                    {tool.status.charAt(0).toUpperCase() + tool.status.slice(1)}
                  </p>
                  <p className="text-sm text-gray-600">Current Status</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <History className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium">
                    {tool.last_maintenance_date ? 
                      new Date(tool.last_maintenance_date).toLocaleDateString() : 
                      'Never'
                    }
                  </p>
                  <p className="text-sm text-gray-600">Last Maintenance</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="font-medium">{assignmentHistory.length}</p>
                  <p className="text-sm text-gray-600">Total Projects</p>
                </div>
              </div>
            </div>

            {/* Maintenance Warning */}
            {maintenanceDue && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Maintenance Due</p>
                    <p className="text-sm">
                      Next maintenance was scheduled for {new Date(tool.next_maintenance_date).toLocaleDateString()}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/inventory/tools/${id}/maintenance`)}
                      className="mt-2"
                    >
                      <Wrench className="h-4 w-4 mr-2" />
                      Record Maintenance
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Tool Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Details</h3>
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Serial Number</p>
                  <p className="font-medium">{tool.serial_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Purchase Date</p>
                  <p className="font-medium">
                    {tool.purchase_date ? 
                      new Date(tool.purchase_date).toLocaleDateString() : 
                      'N/A'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Purchase Price</p>
                  <p className="font-medium">
                    {tool.purchase_price ? 
                      `$${tool.purchase_price.toLocaleString()}` : 
                      'N/A'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Expected Lifetime</p>
                  <p className="font-medium">
                    {tool.expected_lifetime_months ? 
                      `${tool.expected_lifetime_months} months` : 
                      'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Maintenance History */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Maintenance History</h3>
              {maintenanceHistory.length === 0 ? (
                <p className="text-center text-gray-600 p-4 border rounded-lg">
                  No maintenance records found
                </p>
              ) : (
                <MaintenanceHistory history={maintenanceHistory} />
              )}
            </div>

            {/* Assignment History */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Project Assignment History</h3>
              {assignmentHistory.length === 0 ? (
                <p className="text-center text-gray-600 p-4 border rounded-lg">
                  No assignment records found
                </p>
              ) : (
                <AssignmentHistory history={assignmentHistory} />
              )}
            </div>
          </CardContent>
        </Card>
        </PageContainer>
  );
};

export default ToolDetail;