// src/components/inventory/tools/MaintenanceSchedule.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/PageContainer';
import { 
  Wrench, 
  Calendar, 
  AlertCircle, 
  Check, 
  Search,
  Filter
} from 'lucide-react';

const MaintenanceSchedule = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchMaintenanceSchedules = async () => {
      try {
        const response = await fetch('/api/tools/maintenance-schedules');
        if (!response.ok) throw new Error('Failed to fetch maintenance schedules');
        const data = await response.json();
        setSchedules(data);
      } catch (error) {
        console.error('Error fetching maintenance schedules:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenanceSchedules();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'due':
        return 'bg-red-100 text-red-800';
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSchedules = schedules
    .filter(schedule => {
      const matchesSearch = schedule.tool_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            schedule.tool_serial_number?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'due' && new Date(schedule.next_maintenance_date) <= new Date()) ||
        (statusFilter === 'upcoming' && new Date(schedule.next_maintenance_date) > new Date()) ||
        (statusFilter === 'completed' && schedule.last_maintenance_date);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(a.next_maintenance_date) - new Date(b.next_maintenance_date));

  return (
    <PageContainer>
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Maintenance Schedule</h1>
            <p className="text-gray-600">Manage tool maintenance and inspections</p>
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
                className="p-2 border rounded-md flex items-center gap-2"
              >
                <option value="all">All Status</option>
                <option value="due">Maintenance Due</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Schedules */}
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                Loading maintenance schedules...
              </CardContent>
            </Card>
          ) : filteredSchedules.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-600">
                No maintenance schedules found.
              </CardContent>
            </Card>
          ) : (
            filteredSchedules.map(schedule => {
              const isDue = new Date(schedule.next_maintenance_date) <= new Date();
              const statusLabel = schedule.last_maintenance_date ? 'completed' : (isDue ? 'due' : 'upcoming');

              return (
                <Card 
                  key={schedule.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    isDue ? 'border-red-300' : ''
                  }`}
                  onClick={() => navigate(`/inventory/tools/${schedule.tool_id}/maintenance`)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{schedule.tool_name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(statusLabel)}`}>
                            {statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          S/N: {schedule.tool_serial_number}
                        </p>
                        {schedule.last_maintenance_date && (
                          <p className="text-sm text-gray-600">
                            Last Maintained: {new Date(schedule.last_maintenance_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${isDue ? 'text-red-600' : 'text-gray-600'}`}>
                          Next Maintenance: {new Date(schedule.next_maintenance_date).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {schedule.last_maintenance_date ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className={`h-4 w-4 ${isDue ? 'text-red-500' : 'text-yellow-500'}`} />
                          )}
                          <span className={`text-sm ${isDue ? 'text-red-600' : 'text-gray-600'}`}>
                            {schedule.last_maintenance_date 
                              ? 'Completed' 
                              : (isDue ? 'Overdue' : 'Upcoming')
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
     </PageContainer>
  );
};

export default MaintenanceSchedule;