// src/components/clients/ClientStats.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Calendar, AlertCircle } from 'lucide-react';

const ClientStats = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    pendingFollowUps: 0,
    overdueFollowUps: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [clientsRes, followUpsRes] = await Promise.all([
          fetch('/api/clients'),
          fetch('/api/clients/follow-ups/upcoming')
        ]);

        if (!clientsRes.ok || !followUpsRes.ok) {
          throw new Error('Failed to fetch statistics');
        }

        const [clientsData, followUps] = await Promise.all([
          clientsRes.json(),
          followUpsRes.json()
        ]);

        setStats({
          totalClients: clientsData.clients ? clientsData.clients.length : 0,
          pendingFollowUps: Array.isArray(followUps) ? followUps.length : 0,
          overdueFollowUps: Array.isArray(followUps) ? 
            followUps.filter(f => new Date(f.follow_up_date) < new Date()).length : 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []); 

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{stats.totalClients}</p>
              <p className="text-sm text-gray-600">Total Clients</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">{stats.pendingFollowUps}</p>
              <p className="text-sm text-gray-600">Pending Follow-ups</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold">{stats.overdueFollowUps}</p>
              <p className="text-sm text-gray-600">Overdue Follow-ups</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientStats;