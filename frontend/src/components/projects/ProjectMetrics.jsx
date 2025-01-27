// src/components/projects/ProjectMetrics.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  Clock, 
  TrendingUp,
  AlertCircle,
  Calendar,
  CheckCircle,
  Users
} from 'lucide-react';

const ProjectMetrics = () => {
  const [metrics, setMetrics] = useState({
    projectsByStatus: [],
    projectsByMonth: [],
    completionRates: [],
    teamUtilization: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Fetch all necessary metrics
        const [
          projectsResponse,
          completionResponse,
          utilizationResponse
        ] = await Promise.all([
          fetch('/api/projects/metrics/status'),
          fetch('/api/projects/metrics/completion'),
          fetch('/api/projects/metrics/utilization')
        ]);

        const projectsData = await projectsResponse.json();
        const completionData = await completionResponse.json();
        const utilizationData = await utilizationResponse.json();

        setMetrics({
          projectsByStatus: projectsData.byStatus,
          projectsByMonth: projectsData.byMonth,
          completionRates: completionData,
          teamUtilization: utilizationData
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return <div>Loading metrics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{metrics.projectsByStatus.find(s => s.status === 'in_progress')?.count || 0}</p>
                <p className="text-sm text-gray-600">Active Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{metrics.projectsByStatus.find(s => s.status === 'completed')?.count || 0}</p>
                <p className="text-sm text-gray-600">Completed Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{metrics.projectsByStatus.find(s => s.status === 'delayed')?.count || 0}</p>
                <p className="text-sm text-gray-600">Delayed Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{metrics.teamUtilization.length}</p>
                <p className="text-sm text-gray-600">Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.projectsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="started" stroke="#3b82f6" name="Started" />
                <Line type="monotone" dataKey="completed" stroke="#22c55e" name="Completed" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Team Utilization */}
      <Card>
        <CardHeader>
          <CardTitle>Team Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.teamUtilization}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="assigned_hours" fill="#3b82f6" name="Assigned Hours" />
                <Bar dataKey="available_hours" fill="#22c55e" name="Available Hours" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Completion Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Project Completion Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.completionRates}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="completion_rate" 
                  stroke="#3b82f6" 
                  name="Completion Rate %" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectMetrics;