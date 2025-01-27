// src/components/Dashboard/DashboardCard.jsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const DashboardCard = ({ 
  icon: Icon, 
  title, 
  description, 
  onClick, 
  badge,
  subItems 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleSubItemClick = (subItemClick, e) => {
    e.stopPropagation(); // Prevent the parent card's onClick
    subItemClick();
  };

  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-lg relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader onClick={onClick}>
        <div className="flex items-center space-x-3">
          <Icon className="h-6 w-6 text-blue-600" />
          <div className="flex-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {badge > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {badge}
            </span>
          )}
        </div>
      </CardHeader>
      
      {subItems && (
        <div 
          className={`
            absolute z-10 left-0 right-0 top-full mt-2 
            bg-white border rounded-lg shadow-lg p-2 
            transition-all duration-300 ease-in-out
            ${isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'}
          `}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {subItems.map((subItem, index) => (
            <div 
              key={index}
              className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
              onClick={(e) => handleSubItemClick(subItem.onClick, e)}
            >
              {subItem.title}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};