// src/components/finance/cash/CashFlow.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Download, Filter } from 'lucide-react';

const CashFlow = () => {
  const [period, setPeriod] = useState('week');
  const [flowData, setFlowData] = useState({
    inflows: [],
    outflows: [],
    netFlow: 0
  });

  useEffect(() => {
    const fetchFlowData = async () => {
      try {
        const response = await fetch(`/api/finance/cash-flow/${period}`);
        const data = await response.json();
        setFlowData(data);
      } catch (error) {
        console.error('Error fetching cash flow:', error);
      }
    };

    fetchFlowData();
  }, [period]);

  const downloadReport = async () => {
    try {
      const response = await fetch(`/api/finance/cash-flow/report/${period}`, {
        method: 'POST'
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cash_flow_${period}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          onClick={downloadReport}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Cash Inflows</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              +${flowData.inflows.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Cash Outflows</p>
            <p className="text-3xl font-bold text-red-600 mt-1">
              -${flowData.outflows.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Net Cash Flow</p>
            <p className={`text-3xl font-bold mt-1 ${
              flowData.netFlow >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ${flowData.netFlow.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Details */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Inflows</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Project</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flowData.inflows.map((flow, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(flow.date).toLocaleDateString()}</TableCell>
                  <TableCell>{flow.source}</TableCell>
                  <TableCell>{flow.category}</TableCell>
                  <TableCell>{flow.project}</TableCell>
                  <TableCell className="text-right font-medium text-green-600">
                    +${flow.amount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cash Outflows</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Project</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flowData.outflows.map((flow, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(flow.date).toLocaleDateString()}</TableCell>
                  <TableCell>{flow.recipient}</TableCell>
                  <TableCell>{flow.category}</TableCell>
                  <TableCell>{flow.project}</TableCell>
                  <TableCell className="text-right font-medium text-red-600">
                    -${flow.amount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashFlow;