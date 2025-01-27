// src/components/finance/hub/FinanceHubCard.jsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FinanceHubCard = () => {
  const navigate = useNavigate();

  return (
    <Card className="bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors">
      <CardContent className="p-4">
        <div 
          className="flex justify-between items-center"
          onClick={() => navigate('/finance/hub')}
        >
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium">Financial Hub</p>
              <p className="text-sm text-gray-600">Complete financial management</p>
            </div>
          </div>
          
          <Button variant="ghost">
            Open Hub
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinanceHubCard;