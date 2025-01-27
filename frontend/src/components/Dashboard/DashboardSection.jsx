// src/components/Dashboard/DashboardSection.jsx
import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardCard } from './DashboardCard';

const DashboardSection = ({ title, items }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <DashboardCard 
            key={item.title}
            icon={item.icon}
            title={item.title}
            description={item.description}
            onClick={item.onClick}
            badge={item.badge}
            subItems={item.subItems}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardSection;