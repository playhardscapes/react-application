// src/components/vendors/InvoiceTracker.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, AlertCircle, DollarSign } from 'lucide-react';

const InvoiceTracker = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch('/api/vendors/invoices');
        const data = await response.json();
        setInvoices(data);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const totalOutstanding = invoices.reduce((sum, invoice) => 
    invoice.status === 'pending' ? sum + invoice.amount : sum, 0
  );

  const overdueAmount = invoices.reduce((sum, invoice) => 
    invoice.status === 'pending' && new Date(invoice.due_date) < new Date() 
      ? sum + invoice.amount 
      : sum, 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Invoice Tracker</h1>
            <p className="text-gray-600">Track and manage vendor invoices</p>
          </div>
          <Button 
            onClick={() => navigate('/vendors/invoice/new')}
          >
            Add Invoice
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">
                    ${totalOutstanding.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Total Outstanding</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">
                    ${overdueAmount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Overdue Amount</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p>Loading invoices...</p>
              ) : (
                invoices.map(invoice => (
                  <div
                    key={invoice.id}
                    className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/vendors/${invoice.vendor_id}/invoices/${invoice.id}`)}
                  >
                    <div>
                      <h3 className="font-medium">{invoice.vendor_name}</h3>
                      <p className="text-sm text-gray-600">
                        Invoice #{invoice.invoice_number}
                      </p>
                      <div className="mt-1">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-800'
                            : new Date(invoice.due_date) < new Date()
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.status === 'paid' 
                            ? 'Paid' 
                            : new Date(invoice.due_date) < new Date()
                            ? 'Overdue'
                            : 'Pending'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${invoice.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Due: {new Date(invoice.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvoiceTracker;