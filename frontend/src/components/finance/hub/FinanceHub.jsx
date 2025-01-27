import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Receipt,
  CreditCard,
  Building2,
  Calculator,
  FileText,
  DollarSign,
  ArrowUpDown,
  Clock
} from 'lucide-react';

const FinanceHub = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [summary, setSummary] = useState({
    pendingExpenses: 0,
    unreconciled: 0,
    cashBalance: 0
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!token) {
        setError('No authentication token');
        return;
      }

      try {
        const response = await fetch('/api/finance/dashboard/summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const data = await response.json();
        setSummary(data);
      } catch (error) {
        console.error('Error fetching summary:', error);
        setError(error.message);
      }
    };

    fetchSummary();
  }, [token]);

  const sections = [
    {
      title: "Quick Actions",
      items: [
        {
          icon: Receipt,
          title: "Record Expense",
          description: `${summary.pendingExpenses} pending`,
          path: "/finance/expenses/quick-entry"
        },
        {
          icon: CreditCard,
          title: "Card Activity",
          description: `${summary.unreconciled} to reconcile`,
          path: "/finance/cards"
        },
        {
          icon: Clock,
          title: "Recent Transactions",
          path: "/finance/transactions"
        }
      ]
    },
    {
      title: "Project Finance",
      items: [
        {
          icon: Building2,
          title: "Project Costs",
          path: "/finance/projects"
        },
        {
          icon: ArrowUpDown,
          title: "Cost Allocation",
          path: "/finance/allocations"
        }
      ]
    },
    {
      title: "Reports & Analysis",
      items: [
        {
          icon: Calculator,
          title: "Tax Center",
          path: "/finance/tax"
        },
        {
          icon: FileText,
          title: "Financial Reports",
          path: "/finance/reports"
        }
      ]
    }
  ];

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Error: {error}
        <Button onClick={() => window.location.reload()} className="ml-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card className="bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Cash Position</h3>
              <p className="text-3xl font-bold mt-2">
                ${(summary?.cashBalance || 0).toLocaleString()}
              </p>
            </div>
            <Button onClick={() => navigate('/finance/cash-flow')}>
              View Cash Flow
            </Button>
          </div>
        </CardContent>
      </Card>

      {sections.map((section, index) => (
        <div key={index}>
          <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {section.items.map((item, itemIndex) => (
              <Card
                key={itemIndex}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(item.path)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <item.icon className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-medium">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-600">{item.description}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FinanceHub;