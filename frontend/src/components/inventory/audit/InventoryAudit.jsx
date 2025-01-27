// src/components/inventory/audit/InventoryAudit.jsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ClipboardCheck, AlertCircle } from 'lucide-react';
import MaterialAudit from './MaterialAudit';
import AuditHistory from './AuditHistory';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';

const InventoryAudit = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('materials');
  return (
    <PageContainer>
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Inventory Audit</h1>
            <p className="text-gray-600">Perform inventory counts and reconciliation</p>
          </div>
          <Button onClick={() => navigate('/inventory')}>
            Back to Inventory
          </Button>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="materials">Materials Audit</TabsTrigger>
                <TabsTrigger value="tools">Tools Audit</TabsTrigger>
                <TabsTrigger value="history">Audit History</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <TabsContent value="materials">
              <MaterialAudit />
            </TabsContent>
            <TabsContent value="tools">
              <ToolAudit />
            </TabsContent>
            <TabsContent value="history">
              <AuditHistory />
            </TabsContent>
          </CardContent>
        </Card>
     </PageContainer>
  );
};

export default InventoryAudit;