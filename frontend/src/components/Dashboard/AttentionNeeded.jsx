// src/components/Dashboard/AttentionNeeded.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

const AttentionNeeded = () => {
  const [communications, setCommunications] = useState([]);
  const [aiSummary, setAiSummary] = useState(null);

  useEffect(() => {
    const fetchCommunications = async () => {
      try {
        const response = await fetch('/api/communications/unhandled');
        const data = await response.json();
        setCommunications(data);

        // Optional: Use Claude or ChatGPT to summarize communications
        if (data.length > 0) {
          const summary = await generateAISummary(data);
          setAiSummary(summary);
        }
      } catch (error) {
        console.error('Failed to fetch communications', error);
      }
    };

    fetchCommunications();
  }, []);

  // AI Summary Generation Function (implementation details would depend on your AI service setup)
  const generateAISummary = async (communications) => {
    // Placeholder for AI summary generation
    // This would integrate with Claude or ChatGPT API
    return null;
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-red-600 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Needs Attention
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Existing Attention Items */}
          <div className="bg-red-50 p-3 rounded">
            <p className="font-medium">3 Proposals Awaiting Follow-up</p>
            <p className="text-sm text-gray-600">Oldest: 8 days ago</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded">
            <p className="font-medium">2 Projects Need Scheduling</p>
            <p className="text-sm text-gray-600">Weather window closing</p>
          </div>
          <div className="bg-blue-50 p-3 rounded">
            <p className="font-medium">4 Invoices Due This Week</p>
            <p className="text-sm text-gray-600">Total: $3,450</p>
          </div>

          {/* Communications Section */}
          <div className="bg-green-50 p-3 rounded">
            <p className="font-medium">{communications.length} Unhandled Communications</p>
            {aiSummary && (
              <div className="text-sm text-gray-700 mt-2">
                <p>AI Summary:</p>
                <p className="italic">{aiSummary}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttentionNeeded;