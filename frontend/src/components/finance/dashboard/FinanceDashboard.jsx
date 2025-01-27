// src/components/finance/dashboard/FinanceDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '../index';

const FinanceDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    cashFlow: 0,
    pendingExpenses: 0,
    unreconciledTransactions: 0,
    recentTransactions: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/finance/dashboard/summary');
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Finance Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(dashboardData.cashFlow)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(dashboardData.pendingExpenses)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unreconciled Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {dashboardData.unreconciledTransactions}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboardData.recentTransactions.map(transaction => (
            <div key={transaction.id} className="flex justify-between py-2 border-b">
              <span>{transaction.description}</span>
              <span>{formatCurrency(transaction.amount)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceDashboard;