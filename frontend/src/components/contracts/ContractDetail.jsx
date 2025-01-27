// src/components/contracts/ContractDetail.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Edit, ArrowLeft } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';

const ContractDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const response = await fetch(`/api/contracts/${id}`);
        if (!response.ok) throw new Error('Failed to fetch contract');
        const data = await response.json();
        setContract(data);
      } catch (error) {
        console.error('Error fetching contract:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [id]);

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/contracts/${id}/pdf`);
      if (!response.ok) throw new Error('Failed to generate PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contract-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  if (loading) {
    return (
      <PageContainer>
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2">Loading contract...</p>
            </CardContent>
          </Card>
        </PageContainer>
    );
  }

  return (
    <PageContainer>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate('/contracts')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <CardTitle>Contract Details</CardTitle>
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  onClick={() => navigate(`/contracts/${id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Contract
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Contract Summary */}
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Client</p>
                  <p className="font-medium">{contract.client_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium capitalize">{contract.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-medium">${contract.contract_amount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-medium">{new Date(contract.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Contract Content */}
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: contract.content }}
            />
          </CardContent>
        </Card>
     </PageContainer>
  );
};

export default ContractDetail;