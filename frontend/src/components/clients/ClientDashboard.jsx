import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Plus, 
  Archive,
  ArchiveRestore,
  Calendar
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import ClientList from './ClientList';
import FollowUpsList from './FollowUpsList';
import { PageContainer } from '@/components/layout/PageContainer';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchivedClients, setShowArchivedClients] = useState(false);
  const [activeTab, setActiveTab] = useState('clients');

  // Redirect to login if no token
  React.useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  return (
    <PageContainer>
        <Card>
          <CardHeader className="border-b">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl">Client Management</CardTitle>
                <CardDescription className="text-gray-600">
                  Manage clients and follow-ups
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => navigate('/clients/new')}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Client
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/follow-ups')}
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  View Follow-ups
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="flex mb-4 border-b">
              <button
                className={`px-4 py-2 ${activeTab === 'clients' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setActiveTab('clients')}
              >
                Clients
              </button>
              <button
                className={`px-4 py-2 ${activeTab === 'followups' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setActiveTab('followups')}
              >
                Follow-ups
              </button>
            </div>

            {activeTab === 'clients' && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <Button
                    variant={showArchivedClients ? "default" : "outline"}
                    onClick={() => setShowArchivedClients(!showArchivedClients)}
                    className="flex items-center gap-2"
                  >
                    {showArchivedClients ? (
                      <>
                        <Archive className="h-4 w-4" />
                        Hide Archived
                      </>
                    ) : (
                      <>
                        <ArchiveRestore className="h-4 w-4" />
                        Show Archived
                      </>
                    )}
                  </Button>

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
                
                <ClientList 
                  searchTerm={searchTerm}
                  showArchivedClients={showArchivedClients}
                />
              </>
            )}

            {activeTab === 'followups' && (
              <FollowUpsList />
            )}
          </CardContent>
        </Card>
     </PageContainer>
  );
};

export default ClientDashboard;