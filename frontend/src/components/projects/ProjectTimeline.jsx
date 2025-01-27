import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/PageContainer';
import {
  HardHat,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Cloud
} from 'lucide-react';

const TimelineBar = ({ schedule, totalDays, startDate }) => {
  const scheduleStart = new Date(schedule.start_date);
  const scheduleEnd = new Date(schedule.end_date);
  const daysFromStart = Math.floor((scheduleStart - startDate) / (1000 * 60 * 60 * 24));
  const duration = Math.ceil((scheduleEnd - scheduleStart) / (1000 * 60 * 60 * 24));
  
  // Calculate position and width as percentages
  const leftPosition = (daysFromStart / totalDays) * 100;
  const width = (duration / totalDays) * 100;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'delayed':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div 
      className={`absolute h-6 rounded ${getStatusColor(schedule.status)} transition-all`}
      style={{
        left: `${leftPosition}%`,
        width: `${width}%`,
        minWidth: '2px'
      }}
      title={`${schedule.status} (${scheduleStart.toLocaleDateString()} - ${scheduleEnd.toLocaleDateString()})`}
    >
      {schedule.weather_dependent && (
        <Cloud className="absolute -top-3 -right-2 h-4 w-4 text-white" />
      )}
    </div>
  );
};

const ProjectTimeline = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedProjects, setExpandedProjects] = useState({});

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      const projectData = await response.json();
      
      // Fetch schedules for each project
      const projectsWithSchedules = await Promise.all(
        projectData.map(async (project) => {
          const scheduleResponse = await fetch(`/api/projects/${project.id}/schedule`);
          if (!scheduleResponse.ok) throw new Error('Failed to fetch schedules');
          const schedules = await scheduleResponse.json();
          return { ...project, schedules };
        })
      );

      setProjects(projectsWithSchedules);
      setError(null);
    } catch (error) {
      console.error('Error fetching project data:', error);
      setError('Failed to load project timeline');
    } finally {
      setLoading(false);
    }
  };

  const toggleProject = (projectId) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  // Calculate timeline range
  const getTimelineRange = () => {
    let minDate = new Date();
    let maxDate = new Date();
    
    projects.forEach(project => {
      project.schedules?.forEach(schedule => {
        const startDate = new Date(schedule.start_date);
        const endDate = new Date(schedule.end_date);
        if (startDate < minDate) minDate = startDate;
        if (endDate > maxDate) maxDate = endDate;
      });
    });

    // Add padding days
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);

    return {
      startDate: minDate,
      endDate: maxDate,
      totalDays: Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24))
    };
  };

  const timelineRange = getTimelineRange();

  // Generate month labels
  const getMonthLabels = () => {
    const labels = [];
    let currentDate = new Date(timelineRange.startDate);
    
    while (currentDate <= timelineRange.endDate) {
      labels.push({
        month: currentDate.toLocaleString('default', { month: 'short' }),
        year: currentDate.getFullYear(),
        position: ((currentDate - timelineRange.startDate) / (timelineRange.endDate - timelineRange.startDate)) * 100
      });
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return labels;
  };

  return (
    <PageContainer>
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Project Timeline</h1>
            <p className="text-gray-600">View and manage project schedules</p>
          </div>
          <Button onClick={() => navigate('/projects/schedule')}>
            View Calendar
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Timeline View */}
        <Card>
          <CardHeader>
            <CardTitle>Project Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">Loading timeline...</div>
            ) : (
              <div className="space-y-6">
                {/* Month Labels */}
                <div className="relative h-6 border-b">
                  {getMonthLabels().map((label, index) => (
                    <div
                      key={index}
                      className="absolute text-sm text-gray-600"
                      style={{ left: `${label.position}%` }}
                    >
                      {label.month} {label.year}
                    </div>
                  ))}
                </div>

                {/* Projects and Schedules */}
                <div className="space-y-4">
                  {projects.map(project => (
                    <div key={project.id} className="space-y-2">
                      {/* Project Header */}
                      <div 
                        className="flex items-center space-x-2 cursor-pointer"
                        onClick={() => toggleProject(project.id)}
                      >
                        {expandedProjects[project.id] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <HardHat className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">{project.title}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          project.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : project.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                      </div>

                      {/* Timeline Bars */}
                      {expandedProjects[project.id] && (
                        <div className="relative h-8 ml-6 bg-gray-50 rounded">
                          {project.schedules?.map(schedule => (
                            <TimelineBar
                              key={schedule.id}
                              schedule={schedule}
                              totalDays={timelineRange.totalDays}
                              startDate={timelineRange.startDate}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded" />
                <span className="text-sm">Pending</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                <span className="text-sm">In Progress</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span className="text-sm">Completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded" />
                <span className="text-sm">Delayed</span>
              </div>
              <div className="flex items-center space-x-2">
                <Cloud className="h-4 w-4 text-gray-600" />
                <span className="text-sm">Weather Dependent</span>
              </div>
            </div>
          </CardContent>
        </Card>
     </PageContainer>
  );
};

export default ProjectTimeline;