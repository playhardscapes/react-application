// src/components/finance/reports/TaxCenter.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Download, 
  Upload, 
  FileText,
  Calculator,
  Receipt 
} from 'lucide-react';

const TaxCenter = () => {
  const [taxSummary, setTaxSummary] = useState({
    income: 0,
    expenses: 0,
    deductions: 0,
    estimatedTax: 0
  });

  const [deductions, setDeductions] = useState([]);

  useEffect(() => {
    const fetchTaxData = async () => {
      try {
        const [summaryRes, deductionsRes] = await Promise.all([
          fetch('/api/finance/tax/summary'),
          fetch('/api/finance/tax/deductions')
        ]);
        
        const [summaryData, deductionsData] = await Promise.all([
          summaryRes.json(),
          deductionsRes.json()
        ]);

        setTaxSummary(summaryData);
        setDeductions(deductionsData);
      } catch (error) {
        console.error('Error fetching tax data:', error);
      }
    };

    fetchTaxData();
  }, []);

  const generateTaxReport = async (type) => {
    try {
      const response = await fetch(`/api/finance/tax/reports/${type}`, {
        method: 'POST'
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tax_${type}_${new Date().getFullYear()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating tax report:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Tax Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Summary {new Date().getFullYear()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Income</p>
              <p className="text-2xl font-bold">${taxSummary.income.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold">${taxSummary.expenses.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Deductions</p>
              <p className="text-2xl font-bold">${taxSummary.deductions.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Estimated Tax</p>
              <p className="text-2xl font-bold">${taxSummary.estimatedTax.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <Button 
              onClick={() => generateTaxReport('summary')}
              className="w-full flex items-center justify-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              Generate Tax Summary
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Button 
              onClick={() => generateTaxReport('expenses')}
              className="w-full flex items-center justify-center gap-2"
            >
              <Receipt className="h-4 w-4" />
              Export Expense Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Button 
              onClick={() => generateTaxReport('deductions')}
              className="w-full flex items-center justify-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Deduction Summary
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Deductions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Deductions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Documentation</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deductions.map((deduction, index) => (
                <TableRow key={index}>
                  <TableCell>{deduction.category}</TableCell>
                  <TableCell>${deduction.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    {deduction.hasDocumentation ? (
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm">
                        <Upload className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      deduction.verified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {deduction.verified ? 'Verified' : 'Pending'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Document Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                className="hidden"
                id="tax-doc-upload"
                multiple
              />
              <label 
                htmlFor="tax-doc-upload"
                className="cursor-pointer"
              >
                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Upload tax documents (W9, 1099, etc.)
                </p>
              </label>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Recent Uploads</h3>
              <div className="space-y-2">
                {['W9_2024.pdf', '1099_Vendor1.pdf'].map((doc, index) => (
                  <div 
                    key={index}
                    className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                  >
                    <span className="text-sm">{doc}</span>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxCenter;