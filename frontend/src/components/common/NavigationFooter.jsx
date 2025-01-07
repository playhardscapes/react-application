// src/components/common/NavigationFooter.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NavigationFooter = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Home
        </Button>
      </div>
    </div>
  );
};

export default NavigationFooter;