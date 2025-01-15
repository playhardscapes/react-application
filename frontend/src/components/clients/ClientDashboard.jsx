// src/components/clients/ClientDashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Search, 
  Plus, 
  AlertCircle,
  Calendar
} from 'lucide-react';

// Components
import ClientList from './ClientList';
import FollowUpsList from './FollowUpsList';
import ClientStats from './ClientStats';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Client Management</h1>
            <p className="text-gray-600">Manage clients and follow-ups</p>
          </div>
          <Button 
            onClick={() => navigate('/clients/new')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        </div>

        {/* Quick Stats */}
        <ClientStats />

        {/* Client List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Clients</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  className="pl-9 w-full p-2 border rounded-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ClientList searchTerm={searchTerm} />
          </CardContent>
        </Card>

        {/* Follow-ups Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Follow-ups</CardTitle>
          </CardHeader>
          <CardContent>
            <FollowUpsList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;