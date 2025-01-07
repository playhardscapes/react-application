// src/components/contracts/ContractsList.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ContractsList = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Fetch contracts from your API
    // For now, we'll use dummy data
    setContracts([
      {
        id: 1,
        clientName: 'Example Client',
        date: '2024-01-15',
        status: 'Pending Signature',
        projectValue: 25000
      }
    ]);
    setLoading(false);
  }, []);

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
              <p>Loading contracts...</p>
            ) : (
              <div className="space-y-4">
                {contracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="border rounded p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/contract/${contract.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{contract.clientName}</h3>
                        <p className="text-sm text-gray-600">{contract.status}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${contract.projectValue.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(contract.date).toLocaleDateString()}
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

export default ContractsList;