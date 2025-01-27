// src/components/finance/cash/CashManagement.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { 
  ArrowUpRight, 
  ArrowDownRight,
  AlertTriangle,
  TrendingUp 
} from 'lucide-react';

const CashManagement = () => {
  const [cashData, setCashData] = useState({
    currentBalance: 0,
    projected30Days: 0,
    incomingPayments: 0,
    upcomingBills: 0,
    cashFlow: []
  });

  useEffect(() => {
    const fetchCashData = async () => {
      try {
        const response = await fetch('/api/finance/cash/summary');
        const data = await response.json();
        setCashData(data);
      } catch (error) {
        console.error('Error fetching cash data:', error);
      }
    };

    fetchCashData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Cash Position */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className="text-3xl font-bold mt-1">
                  ${cashData.currentBalance.toLocaleString()}
                </p>
              </div>
              <Button variant="ghost" className="p-1.5">
                <TrendingUp className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">30-Day Projection</p>
                <p className="text-3xl font-bold mt-1">
                  ${cashData.projected30Days.toLocaleString()}
                </p>
              </div>
              <span className={cashData.projected30Days > cashData.currentBalance 
                ? "text-green-500" 
                : "text-red-500"}>
                {cashData.projected30Days > cashData.currentBalance 
                  ? <ArrowUpRight className="h-5 w-5" />
                  : <ArrowDownRight className="h-5 w-5" />}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Incoming Payments</p>
              <p className="text-3xl font-bold mt-1 text-green-600">
                +${cashData.incomingPayments.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">Next 30 days</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-600">Upcoming Bills</p>
              <p className="text-3xl font-bold mt-1 text-red-600">
                -${cashData.upcomingBills.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">Next 30 days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashData.cashFlow}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="projected" 
                  stroke="#9333ea" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Alerts & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Low Balance Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Cash Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cashData.currentBalance < 10000 && (
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">Low Balance Alert</p>
                    <p className="text-sm text-red-700">Balance below $10,000 threshold</p>
                  </div>
                </div>
              )}
              {cashData.projected30Days < cashData.currentBalance && (
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-900">Projected Decrease</p>
                    <p className="text-sm text-yellow-700">
                      30-day projection shows declining balance
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { date: '2024-01-22', desc: 'Equipment Purchase', amount: -2500 },
                { date: '2024-01-21', desc: 'Client Payment', amount: 5000 },
                { date: '2024-01-20', desc: 'Vendor Payment', amount: -1200 }
              ].map((transaction, index) => (
                <div 
                  key={index}
                  className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                >
                  <div>
                    <p className="font-medium">{transaction.desc}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className={`font-medium ${
                    transaction.amount > 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}
                    ${Math.abs(transaction.amount).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CashManagement;