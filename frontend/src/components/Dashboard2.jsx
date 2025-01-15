// src/components/Dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  PenTool, 
  Files,
  FileText,
  Building2,
  Package,
  Clock,
  Calendar,
  Users,
  Truck,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

// Quick Action Card Component
const DashboardCard = ({ icon: Icon, title, description, onClick, status }) => (
  <Card 
    className="cursor-pointer transition-all hover:shadow-lg"
    onClick={onClick}
  >
    <CardHeader>
      <div className="flex items-center space-x-3">
        <Icon className="h-6 w-6 text-blue-600" />
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          {status && (
            <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
              {status}
            </span>
          )}
        </div>
      </div>
    </CardHeader>
  </Card>
);

// Attention Needed Section
const AttentionNeeded = () => (
  <Card className="col-span-full">
    <CardHeader>
      <CardTitle className="text-red-600 flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        Needs Attention
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 p-3 rounded">
     /    <p className="font-medium">3 Proposals Awaiting Follow-up</p>
          <p className="text-sm text-gray-600">Oldest: 8 days ago</p>
        </div>
        <div className="bg-yellow-50 p-3 rounded">
          <p className="font-medium">2 Projects Need Scheduling</p>
          <p className="text-sm text-gray-600">Weather window closing</p>
        </div>
        <div className="bg-blue-50 p-3 rounded">
          <p className="font-medium">4 Invoices Due This Week</p>
          <p className="text-sm text-gray-600">Total: $3,450</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Play Hardscapes Portal</h1>
          <p className="text-gray-600 mt-2">Business Management System</p>
        </div>

        {/* Attention Needed Section */}
        <AttentionNeeded />

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Client Management */}
          <DashboardCard
            icon={Users}
            title="Clients"
            description="Client management and follow-ups"
            onClick={() => navigate('/clients')}
          />

          {/* Estimates & Proposals Section */}
          <DashboardCard
            icon={FileSpreadsheet}
            title="Estimates"
            description="View and manage saved estimates"
            onClick={() => navigate('/estimates')}
          />

          <DashboardCard
            icon={PenTool}
            title="Create Estimate"
            description="Build a new project estimate"
            onClick={() => navigate('/estimate/new')}
          />

          <DashboardCard
            icon={Files}
            title="Proposals"
            description="View and manage existing proposals"
            onClick={() => navigate('/proposals')}
          />

          <DashboardCard
            icon={FileText}
            title="Contracts"
            description="Generate and track contracts"
            onClick={() => navigate('/contracts')}
          />

          {/* Project Management */}
          <DashboardCard
            icon={Calendar}
            title="Scheduling"
            description="Weather-integrated project scheduling"
            onClick={() => navigate('/scheduling')}
            status="Coming Soon"
          />

          <DashboardCard
            icon={Building2}
            title="Active Projects"
            description="Track ongoing projects"
            onClick={() => navigate('/projects')}
            status="Coming Soon"
          />

          {/* Business Management */}
          <DashboardCard
            icon={Truck}
            title="Vendors"
            description="Manage vendors and payments"
            onClick={() => navigate('/vendors')}
          />

          <DashboardCard
            icon={Package}
            title="Inventory"
            description="Track materials and equipment"
            onClick={() => navigate('/inventory')}
            status="Coming Soon"
          />

          <DashboardCard
            icon={Clock}
            title="Time Tracking"
            description="Manage hours and schedules"
            onClick={() => navigate('/time')}
            status="Coming Soon"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;