// src/components/proposals/ProposalsList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PenTool, Search } from 'lucide-react';

const ProposalsList = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Replace with actual API call
    setProposals([
      {
        id: 1,
        clientName: 'Example Client',
        date: '2024-01-15',
        location: 'Richmond, VA',
        total: 25000,
        status: 'Pending Review'
      },
      // Add more dummy data as needed
    ]);
    setLoading(false);
  }, []);

  const filteredProposals = proposals.filter(proposal => 
    proposal.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proposal.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Proposals</h1>
              <p className="text-gray-600">View and manage project proposals</p>
            </div>
            <Button 
              onClick={() => navigate('/estimate/new')}
              className="flex items-center gap-2"
            >
              <PenTool className="h-4 w-4" />
              Create Proposal
            </Button>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
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
                  onClick={() => navigate('/estimate/new')}
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
                    onClick={() => navigate(`/proposals/${proposal.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{proposal.clientName}</h3>
                        <p className="text-sm text-gray-600">{proposal.location}</p>
                        <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {proposal.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${proposal.total.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(proposal.date).toLocaleDateString()}
                        </p>
                      </div>
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

export default ProposalsList;