//src/components/inventory/tools/ToolsList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Drill, Plus, Search, AlertCircle, Calendar, ArrowUpDown } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';

const ToolsList = () => {
  const navigate = useNavigate();
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch('/api/tools');
        if (!response.ok) throw new Error('Failed to fetch tools');
        const data = await response.json();
        setTools(data);
      } catch (error) {
        console.error('Error fetching tools:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'in-use':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'retired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTools = tools
    .filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tool.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tool.serial_number?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || tool.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'last_used') {
        comparison = new Date(b.last_used || 0) - new Date(a.last_used || 0);
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(current => current === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <PageContainer>
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Tools & Equipment</h1>
            <p className="text-gray-600">Manage tools and their maintenance</p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => navigate('/inventory/tools/add')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Tool
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tools..."
                  className="pl-9 w-full p-2 border rounded-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="in-use">In Use</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Tools List */}
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                Loading tools...
              </CardContent>
            </Card>
          ) : filteredTools.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-600">
                No tools found.
              </CardContent>
            </Card>
          ) : (
            filteredTools.map(tool => (
              <Card 
                key={tool.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/inventory/tools/${tool.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{tool.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(tool.status)}`}>
                          {tool.status.charAt(0).toUpperCase() + tool.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {tool.brand} {tool.model}
                      </p>
                      {tool.serial_number && (
                        <p className="text-sm text-gray-600">
                          S/N: {tool.serial_number}
                        </p>
                      )}
                      {tool.next_maintenance_date && new Date(tool.next_maintenance_date) <= new Date() && (
                        <div className="flex items-center gap-2 text-yellow-600 mt-1">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">Maintenance Due</span>
                        </div>
                      )}
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
                      {tool.last_maintenance_date && (
                        <p className="text-sm text-gray-600">
                          Last Maintained: {new Date(tool.last_maintenance_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </PageContainer>
  );
};

export default ToolsList;