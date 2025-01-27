// src/components/finance/reports/Reports.jsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  DollarSign
} from 'lucide-react';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('pl');
  const [dateRange, setDateRange] = useState('month');

  const reports = [
    { id: 'pl', name: 'Profit & Loss', icon: TrendingUp },
    { id: 'balance', name: 'Balance Sheet', icon: DollarSign },
    { id: 'expenses', name: 'Expense Report', icon: FileText },
    { id: 'tax', name: 'Tax Summary', icon: Calendar }
  ];

  const generateReport = async () => {
    try {
      const response = await fetch('/api/finance/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedReport,
          dateRange: dateRange
        })
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedReport}_${dateRange}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Financial Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Report Type</label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Report" />
                </SelectTrigger>
                <SelectContent>
                  {reports.map(report => (
                    <SelectItem key={report.id} value={report.id}>
                      <div className="flex items-center gap-2">
                        <report.icon className="h-4 w-4" />
                        {report.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Current Month</SelectItem>
                  <SelectItem value="quarter">Current Quarter</SelectItem>
                  <SelectItem value="year">Year to Date</SelectItem>
                  <SelectItem value="last_year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={generateReport}
            className="w-full flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            Generate Report
          </Button>
        </CardContent>
      </Card>

      {/* Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Revenue YTD</p>
              <p className="text-2xl font-bold">$429,842</p>
              <p className="text-sm text-green-600">↑ 12% vs last year</p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Profit Margin</p>
              <p className="text-2xl font-bold">24.8%</p>
              <p className="text-sm text-blue-600">↑ 3.2% vs last year</p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold">$323,281</p>
              <p className="text-sm text-purple-600">↑ 8% vs last year</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'December P&L', date: '2024-01-01', type: 'Profit & Loss' },
              { name: 'Q4 Balance Sheet', date: '2024-01-01', type: 'Balance Sheet' },
              { name: 'Year End Tax Summary', date: '2024-01-01', type: 'Tax' }
            ].map((report, index) => (
              <div 
                key={index}
                className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div>
                  <p className="font-medium">{report.name}</p>
                  <p className="text-sm text-gray-600">Generated {report.date}</p>
                </div>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;