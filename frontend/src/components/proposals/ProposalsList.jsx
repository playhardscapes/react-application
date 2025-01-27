import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PenTool, Search, FileText, MoreVertical, Check } from 'lucide-react';
import { api } from '@/utils/api';
import { PageContainer } from '@/components/layout/PageContainer';

const STATUS_COLORS = {
  draft: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  sent: { bg: 'bg-blue-100', text: 'text-blue-800' },
  approved: { bg: 'bg-green-100', text: 'text-green-800' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800' }
};

const ProposalsList = () => {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const data = await api.get('/proposals');
      setProposals(data);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (proposalId, newStatus) => {
    try {
      await api.put(`/proposals/${proposalId}`, { status: newStatus });
      // Refresh the proposals list after status change
      fetchProposals();
    } catch (error) {
      console.error('Error updating proposal status:', error);
    }
  };

  const handleClick = (e, proposal) => {
    // If clicking the dropdown or its children, don't navigate
    if (e.target.closest('.status-dropdown')) {
      e.stopPropagation();
      return;
    }
    navigate(`/proposals/${proposal.id}`);
  };

  const filteredProposals = proposals.filter(proposal => 
    proposal.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proposal.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageContainer>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Proposals</CardTitle>
              <p className="text-gray-600">View and manage project proposals</p>
            </div>
            <Button 
              onClick={() => navigate('/proposals/new')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Create Proposal
            </Button>
          </CardHeader>

          <CardContent>
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search proposals..."
                className="pl-10 w-full p-2 border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <p className="text-center py-4">Loading proposals...</p>
            ) : filteredProposals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No proposals found</p>
                <Button 
                  onClick={() => navigate('/proposals/new')}
                  className="mt-4"
                >
                  Create New Proposal
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="border rounded p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={(e) => handleClick(e, proposal)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{proposal.client_name}</h3>
                        <p className="text-sm text-gray-600">{proposal.title || 'Untitled Proposal'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            STATUS_COLORS[proposal.status]?.bg || 'bg-gray-100'
                          } ${
                            STATUS_COLORS[proposal.status]?.text || 'text-gray-800'
                          }`}>
                            {proposal.status?.charAt(0).toUpperCase() + proposal.status?.slice(1)}
                          </span>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="status-dropdown h-7 w-7 p-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(proposal.id, 'draft')}
                              >
                                Mark as Draft
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(proposal.id, 'sent')}
                              >
                                Mark as Sent
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(proposal.id, 'approved')}
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Approve Proposal
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(proposal.id, 'rejected')}
                                className="text-red-600"
                              >
                                Reject Proposal
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${proposal.total_amount?.toLocaleString() || '0'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(proposal.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </PageContainer>
  );
};

export default ProposalsList;