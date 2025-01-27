// src/components/projects/ProjectDashboardCard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  HardHat,
  Calendar,
  AlertCircle,
  Clock,
  TrendingUp,
  MoreHorizontal
} from 'lucide-react';

const ProjectDashboardCard = () => {
  const navigate = useNavigate();
  const [projectStats, setProjectStats] = useState({
    active: 0,
    upcoming: 0,
    delayed: 0,
    totalHours: 0,
    averageCompletion: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectStats = async () => {
      try {
        const response = await fetch('/api/projects/stats');
        if (!response.ok) throw new Error('Failed to fetch project stats');
        const data = await response.json();
        setProjectStats(data);
      } catch (error) {
        console.error('Error fetching project stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectStats();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <HardHat className="h-6 w-6 text-blue-600" />
          Project Management
        </CardTitle>
        <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Active Projects</p>
                <p className="text-2xl font-bold text-blue-700">
                  {loading ? '...' : projectStats.active}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Due Soon</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {loading ? '...' : projectStats.upcoming}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-900">Delayed</p>
                <p className="text-2xl font-bold text-red-700">
                  {loading ? '...' : projectStats.delayed}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => navigate('/projects/new')}
            className="flex-1"
          >
            New Project
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/projects/schedule')}
            className="flex-1"
          >
            View Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectDashboardCard;