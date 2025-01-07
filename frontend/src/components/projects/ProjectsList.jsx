// src/components/projects/ProjectsList.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Fetch projects from your API
    // For now, we'll use dummy data
    setProjects([
      {
        id: 1,
        clientName: 'Example Client',
        location: 'Example Location',
        status: 'In Progress',
        progress: 60,
        startDate: '2024-01-15'
      }
    ]);
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <h1 className="text-3xl font-bold">Active Projects</h1>
            <p className="text-gray-600">View and manage ongoing projects</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading projects...</p>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="border rounded p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/project/${project.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{project.clientName}</h3>
                        <p className="text-sm text-gray-600">{project.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{project.status}</p>
                        <p className="text-sm text-gray-600">
                          Started: {new Date(project.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded h-2">
                        <div
                          className="bg-blue-600 rounded h-2"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Progress: {project.progress}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectsList;