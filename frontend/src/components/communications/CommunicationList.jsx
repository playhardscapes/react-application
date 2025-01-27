// src/components/communications/CommunicationList.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, MessageCircle, PhoneCall, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageContainer } from '@/components/layout/PageContainer';

const CommunicationBadge = ({ type }) => {
  const badgeStyles = {
    email: 'bg-blue-100 text-blue-800',
    sms: 'bg-green-100 text-green-800',
    call: 'bg-purple-100 text-purple-800'
  };

  const icons = {
    email: Mail,
    sms: MessageCircle,
    call: PhoneCall
  };

  const Icon = icons[type] || MessageCircle;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${badgeStyles[type] || 'bg-gray-100'}`}>
      <Icon className="h-3 w-3 mr-1" />
      {type.toUpperCase()}
    </span>
  );
};

const CommunicationItem = ({ communication, onAction }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
      <div className="p-4 flex justify-between items-start">
        <div className="flex-1 pr-4">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-medium">{communication.sender_name || communication.client_name}</h3>
            <CommunicationBadge type={communication.type || 'email'} />
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {communication.message_content || communication.subject}
          </p>
        </div>
        <div className="text-right">
          <time className="text-xs text-gray-500 block mb-2">
            {formatDate(communication.received_at)}
          </time>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onAction(communication, 'in_progress')}
            >
              In Progress
            </Button>
            <Button 
              size="sm"
              onClick={() => onAction(communication, 'resolved')}
            >
              Resolve
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CommunicationList = () => {
  const { token } = useAuth();
  const [communications, setCommunications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunications = async () => {
      if (!token) return;
      
      try {
        const [emailsResponse, communicationsResponse] = await Promise.all([
          fetch('/api/emails?status=unhandled', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/communications/unhandled', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        const emailsData = await emailsResponse.json();
        const communicationsData = await communicationsResponse.json();

        const combinedCommunications = [
          ...emailsData.emails.map(email => ({
            ...email,
            type: 'email'
          })),
          ...communicationsData.map(comm => ({
            ...comm,
            type: comm.type || 'sms'
          }))
        ];

        setCommunications(combinedCommunications);
      } catch (error) {
        console.error('Error fetching communications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunications();
  }, [token]);

  const handleCommunicationAction = async (communication, action) => {
    try {
      const endpoint = communication.type === 'email' 
        ? `/api/emails/${communication.id}/status`
        : `/api/communications/${communication.id}/status`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: action })
      });

      if (response.ok) {
        setCommunications(prev => 
          prev.filter(comm => comm.id !== communication.id)
        );
      }
    } catch (error) {
      console.error('Error updating communication status:', error);
    }
  };

  // Filter and search logic
  const filteredCommunications = communications.filter(comm => {
    const matchesFilter = filter === 'all' || comm.type === filter;
    const matchesSearch = comm.sender_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.message_content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            <div className="flex items-center">
              <MessageCircle className="h-6 w-6 mr-2" />
              Communication Hub
            </div>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search communications..."
                className="pl-8 pr-2 py-2 border rounded w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs 
          value={filter} 
          onValueChange={setFilter}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4 border-b">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="email">Emails</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
            <TabsTrigger value="call">Calls</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="text-center py-6">Loading communications...</div>
        ) : filteredCommunications.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No communications to handle
          </div>
        ) : (
          <div className="divide-y">
            {filteredCommunications.map(comm => (
              <CommunicationItem
                key={`${comm.type}-${comm.id}`}
                communication={comm}
                onAction={handleCommunicationAction}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommunicationList;