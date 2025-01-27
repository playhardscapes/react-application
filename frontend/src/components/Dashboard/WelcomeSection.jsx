// src/components/Dashboard/WelcomeSection.jsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserCircle, LogOut } from 'lucide-react';

const WelcomeSection = ({ user, onLogout }) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Play Hardscapes Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name || 'User'}</p>
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2"
        >
          <UserCircle className="h-4 w-4" />
          Profile
        </Button>
        <Button
          variant="ghost"
          onClick={onLogout}
          className="flex items-center gap-2 text-gray-600 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default WelcomeSection;