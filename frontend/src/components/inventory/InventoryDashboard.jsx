import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PageContainer } from '@/components/layout/PageContainer';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import { 
  Package, 
  Drill,
  Plus,
  Search,
  Warehouse,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const InventoryDashboard = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('materials');
  const [materials, setMaterials] = useState([]);
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchInventoryData = async () => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      try {
        const [materialsRes, toolsRes] = await Promise.all([
          fetch('/api/inventory/materials', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }),
          fetch('/api/inventory/tools', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        ]);

        if (!materialsRes.ok) {
          throw new Error(`Materials fetch failed: ${materialsRes.status}`);
        }
        if (!toolsRes.ok) {
          throw new Error(`Tools fetch failed: ${toolsRes.status}`);
        }

        const [materialsData, toolsData] = await Promise.all([
          materialsRes.json(),
          toolsRes.json()
        ]);

        // Added console logs
        console.log('Full Materials Data:', materialsData);
        console.log('First Material Object:', materialsData[0]);
        console.log('Total Quantity of first material:', materialsData[0]?.total_quantity);

        setMaterials(Array.isArray(materialsData) ? materialsData : []);
        setTools(Array.isArray(toolsData) ? toolsData : []);
        setError(null);
      } catch (error) {
        console.error('Error fetching inventory data:', error);
        setError(error.message || 'Failed to fetch inventory data');
        setMaterials([]);
        setTools([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, [isAuthenticated, navigate, token]);

  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <PageContainer>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Inventory Management</CardTitle>
                <p className="text-gray-600 text-sm">Track materials, tools, and equipment</p>
              </div>
              <div className="flex gap-4">
                {activeTab === 'materials' ? (
                  <div className="flex gap-2">
                      <Button
                      onClick={() => navigate('/inventory/locations')}
                      className="flex items-center gap-2"
                    >
                      <Warehouse className="h-4 w-4" />
                      Manage Locations
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => navigate('/inventory/tools/maintenance')}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Record Maintenance
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          {/* Main Content */}
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="materials" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Materials
                  </TabsTrigger>
                  <TabsTrigger value="tools" className="flex items-center gap-2">
                    <Drill className="h-4 w-4" />
                    Tools
                  </TabsTrigger>
                </TabsList>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search inventory..."
                    className="pl-9 w-full p-2 border rounded-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <TabsContent value="materials" className="space-y-4">
                {loading ? (
                  <p className="text-center py-4">Loading materials...</p>
                ) : filteredMaterials.length === 0 ? (
                  <p className="text-center py-4">No materials found</p>
                ) : (
                  filteredMaterials.map(material => (
                    <div
                      key={material.id}
                      className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/inventory/materials/${material.id}`)}
                    >
                      <div>
                        <h3 className="font-medium">{material.name}</h3>
                        <p className="text-sm text-gray-600">
                          {material.category} - {material.unit}
                        </p>
                        {material.quantity <= material.min_quantity && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                            Low Stock
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                         Total: {material.total_stock} {material.unit}
                        </p>
                        <p className="text-sm text-gray-600">
                          Min: {material.min_quantity} {material.unit}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="tools" className="space-y-4">
                {loading ? (
                  <p className="text-center py-4">Loading tools...</p>
                ) : filteredTools.length === 0 ? (
                  <p className="text-center py-4">No tools found</p>
                ) : (
                  filteredTools.map(tool => (
                    <div
                      key={tool.id}
                      className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/inventory/tools/${tool.id}`)}
                    >
                      <div>
                        <h3 className="font-medium">{tool.name}</h3>
                        <p className="text-sm text-gray-600">
                          {tool.brand} {tool.model}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                            tool.status === 'available' 
                              ? 'bg-green-100 text-green-800'
                              : tool.status === 'in-use'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {tool.status}
                          </span>
                          {tool.needs_maintenance && (
                            <span className="inline-block px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                              Maintenance Due
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {tool.current_project && (
                          <p className="text-sm text-gray-600">
                            Project #{tool.current_project}
                          </p>
                        )}
                        {tool.expected_return_date && (
                          <p className="text-sm text-gray-600">
                            Due: {new Date(tool.expected_return_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </PageContainer>
  );
};

export default InventoryDashboard;