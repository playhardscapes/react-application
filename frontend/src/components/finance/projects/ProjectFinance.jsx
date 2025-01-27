// src/components/finance/projects/ProjectFinance.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  PieChart, BarChart, CartesianGrid, XAxis, YAxis, 
  Tooltip, Legend, Pie, Bar, ResponsiveContainer 
} from 'recharts';

const ProjectFinance = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [profitLoss, setProfitLoss] = useState({
    revenue: 0,
    expenses: 0,
    profit: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/finance/projects/summary');
        const data = await response.json();
        setProjects(data.projects);
        setExpenses(data.expenses);
        setProfitLoss(data.profitLoss);
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };

    fetchData();
  }, []);

  const expenseCategories = [
    { name: 'Materials', value: 35000 },
    { name: 'Labor', value: 45000 },
    { name: 'Equipment', value: 15000 },
    { name: 'Other', value: 5000 }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Project Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Project Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-2xl font-bold">${profitLoss.revenue.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Expenses</p>
              <p className="text-2xl font-bold">${profitLoss.expenses.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Net Profit</p>
              <p className="text-2xl font-bold">${profitLoss.profit.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expense Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseCategories}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label
                />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#4CAF50" />
                <Bar dataKey="expenses" fill="#FF5722" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Project List */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.map(project => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{project.name}</h3>
                      <p className="text-sm text-gray-600">
                        {project.status} • Started {new Date(project.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        ${project.totalRevenue.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        ${project.totalExpenses.toLocaleString()} expenses
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectFinance;