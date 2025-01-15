import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { FileText, AlertCircle } from 'lucide-react';

const ContractsList = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await fetch('/api/contracts');
        if (!response.ok) {
          throw new Error('Failed to fetch contracts');
        }
        const data = await response.json();
        setContracts(data);
      } catch (err) {
        console.error('Error fetching contracts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeStyle = (status) => {
    const baseStyle = "px-2 py-1 text-xs rounded-full ";
    switch (status?.toLowerCase()) {
      case 'draft':
        return baseStyle + "bg-gray-100 text-gray-800";
      case 'pending':
        return baseStyle + "bg-yellow-100 text-yellow-800";
      case 'active':
        return baseStyle + "bg-green-100 text-green-800";
      case 'completed':
        return baseStyle + "bg-blue-100 text-blue-800";
      default:
        return baseStyle + "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Contracts</h1>
              <p className="text-gray-600">View and manage your contracts</p>
            </div>
            <Button onClick={() => navigate('/contract/new')}>
              New Contract
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading contracts...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>{error}</p>
              </div>
            ) : contracts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">No contracts found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contracts.map((contract) => (
                  <div
                  key={contract.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/contracts/${contract.id}`)}  // Updated from /contract/ to /contracts/
                >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-medium">
                          {contract.proposal_title || 'Untitled Contract'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {contract.client_name || 'No client name'}
                        </p>
                        <span className={getStatusBadgeStyle(contract.status)}>
                          {contract.status || 'Draft'}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${Number(contract.contract_amount || 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Created: {formatDate(contract.created_at)}
                        </p>
                        {contract.start_date && (
                          <p className="text-sm text-gray-600">
                            Starts: {formatDate(contract.start_date)}
                          </p>
                        )}
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

export default ContractsList;