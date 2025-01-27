// src/components/layout/PageContainer.jsx
import React from 'react';
import { cn } from "@/lib/utils";

export const PageContainer = ({ 
  children, 
  className,
  maxWidth = "2xl"  // default max width
}) => {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className={cn(`max-w-${maxWidth} mx-auto`, className)}>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
