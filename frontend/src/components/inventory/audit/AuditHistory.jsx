// src/components/inventory/audit/AuditHistory.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

const AuditHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/inventory/audit/history');
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        console.error('Error fetching audit history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Audit History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading history...</p>
        ) : history.length === 0 ? (
          <p>No audit history found</p>
        ) : (
          <div className="space-y-4">
            {history.map(audit => (
              <div 
                key={audit.id} 
                className="border rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {audit.type === 'materials' ? 'Materials Audit' : 'Tools Audit'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Performed by: {audit.performed_by_name}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">
                    {new Date(audit.created_at).toLocaleDateString()}
                  </p>
                </div>
                {audit.discrepancies > 0 && (
                  <div className="mt-2 text-sm text-red-600">
                    {audit.discrepancies} discrepancies found
                  </div>
                )}
                {audit.notes && (
                  <p className="mt-2 text-sm text-gray-700">
                    {audit.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditHistory;