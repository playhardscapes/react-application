import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Check, RefreshCw } from 'lucide-react';

const CommunicationCard = ({ communication, onStatusUpdate }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{communication.client_name}</h3>
            <p className="text-sm text-gray-600">{communication.message_content}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-xs text-gray-500">
                {formatDate(communication.received_at)}
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                {communication.type.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onStatusUpdate(communication.id, 'in_progress')}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              In Progress
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => onStatusUpdate(communication.id, 'resolved')}
            >
              <Check className="h-4 w-4 mr-2" />
              Resolve
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CommunicationsPage = () => {
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommunications = async () => {
      try {
        const response = await fetch('/api/communications/unhandled');
        if (!response.ok) {
          throw new Error('Failed to fetch communications');
        }
        const data = await response.json();
        setCommunications(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching communications:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchCommunications();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      const response = await fetch(`/api/communications/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update communication status');
      }

      // Remove the communication from the list
      setCommunications(prev => prev.filter(comm => comm.id !== id));
    } catch (error) {
      console.error('Error updating communication status:', error);
    }
  };

  if (loading) return <div>Loading communications...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <MessageCircle className="h-6 w-6 mr-2" />
                Communications
              </CardTitle>
              <span className="text-sm text-gray-600">
                {communications.length} Unhandled Communications
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {communications.length === 0 ? (
              <p className="text-center text-gray-500">No unhandled communications</p>
            ) : (
              communications.map(comm => (
                <CommunicationCard 
                  key={comm.id} 
                  communication={comm} 
                  onStatusUpdate={handleStatusUpdate}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommunicationsPage;