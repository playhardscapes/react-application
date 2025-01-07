import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FileDown, Filter, AlertTriangle } from 'lucide-react';

const InvoiceList = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    xeroStatus: 'all',
    timeframe: 'all'
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices');
      if (!response.ok) throw new Error('Failed to fetch invoices');
      const data = await response.json();
      setInvoices(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedInvoices(filteredInvoices.map(inv => inv.id));
    } else {
      setSelectedInvoices([]);
    }
  };

  const handleSelectInvoice = (id) => {
    setSelectedInvoices(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleExportToXero = async () => {
    if (selectedInvoices.length === 0) return;

    try {
      setExporting(true);
      const response = await fetch('/api/vendors/invoices/export-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceIds: selectedInvoices })
      });

      if (!response.ok) throw new Error('Export failed');

      // Trigger download of the CSV file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `xero-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Update invoice statuses
      const statusUpdateResponse = await fetch('/api/vendors/invoices/mark-exported', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          invoiceIds: selectedInvoices,
          exportDate: new Date().toISOString()
        })
      });

      if (!statusUpdateResponse.ok) throw new Error('Failed to update export status');

      // Refresh invoice list
      await fetchInvoices();
      setSelectedInvoices([]);
      
    } catch (error) {
      console.error('Export error:', error);
      setError('Failed to export invoices to Xero');
    } finally {
      setExporting(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (filters.status !== 'all' && invoice.status !== filters.status) return false;
    if (filters.xeroStatus !== 'all' && invoice.xero_export_status !== filters.xeroStatus) return false;
    
    if (filters.timeframe !== 'all') {
      const dueDate = new Date(invoice.due_date);
      const today = new Date();
      
      switch (filters.timeframe) {
        case 'overdue':
          return dueDate < today && invoice.status === 'pending';
        case 'thisWeek':
          const weekFromNow = new Date();
          weekFromNow.setDate(weekFromNow.getDate() + 7);
          return dueDate <= weekFromNow && dueDate >= today;
        case 'thisMonth':
          const monthFromNow = new Date();
          monthFromNow.setMonth(monthFromNow.getMonth() + 1);
          return dueDate <= monthFromNow && dueDate >= today;
        default:
          return true;
      }
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Invoices</h1>
            <p className="text-gray-600">Track and manage vendor invoices</p>
          </div>
          <div className="flex gap-4">
            {selectedInvoices.length > 0 && (
              <Button
                onClick={handleExportToXero}
                disabled={exporting}
                className="flex items-center gap-2"
              >
                <FileDown className="h-4 w-4" />
                {exporting ? 'Exporting...' : `Export ${selectedInvoices.length} to Xero`}
              </Button>
            )}
            <Button onClick={() => navigate('/invoices/new')}>
              New Invoice
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="p-2 border rounded"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>

              <select
                value={filters.xeroStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, xeroStatus: e.target.value }))}
                className="p-2 border rounded"
              >
                <option value="all">All Xero Statuses</option>
                <option value="pending">Not Exported</option>
                <option value="exported">Exported to Xero</option>
                <option value="error">Export Failed</option>
              </select>

              <select
                value={filters.timeframe}
                onChange={(e) => setFilters(prev => ({ ...prev, timeframe: e.target.value }))}
                className="p-2 border rounded"
              >
                <option value="all">All Time</option>
                <option value="thisWeek">Due This Week</option>
                <option value="thisMonth">Due This Month</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Invoice List */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center">Loading invoices...</div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">{error}</div>
            ) : filteredInvoices.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No invoices found</div>
            ) : (
              <>
                {/* Header Row */}
                <div className="border-b p-4 flex items-center bg-gray-50">
                  <Checkbox
                    checked={selectedInvoices.length === filteredInvoices.length}
                    onChange={handleSelectAll}
                    className="mr-4"
                  />
                  <div className="grid grid-cols-6 gap-4 flex-1">
                    <div className="font-medium">Vendor</div>
                    <div className="font-medium">Invoice #</div>
                    <div className="font-medium">Amount</div>
                    <div className="font-medium">Due Date</div>
                    <div className="font-medium">Status</div>
                    <div className="font-medium">Xero Status</div>
                  </div>
                </div>

                {/* Invoice Rows */}
                <div className="divide-y">
                  {filteredInvoices.map(invoice => (
                    <div
                      key={invoice.id}
                      className="p-4 hover:bg-gray-50 flex items-center"
                    >
                      <Checkbox
                        checked={selectedInvoices.includes(invoice.id)}
                        onChange={() => handleSelectInvoice(invoice.id)}
                        className="mr-4"
                      />
                      <div 
                        className="grid grid-cols-6 gap-4 flex-1 cursor-pointer"
                        onClick={() => navigate(`/invoices/${invoice.id}`)}
                      >
                        <div>{invoice.vendor_name}</div>
                        <div>{invoice.invoice_number}</div>
                        <div>${invoice.amount?.toLocaleString()}</div>
                        <div>{new Date(invoice.due_date).toLocaleDateString()}</div>
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            invoice.xero_export_status === 'exported'
                              ? 'bg-green-100 text-green-800'
                              : invoice.xero_export_status === 'error'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {invoice.xero_export_status === 'exported'
                              ? 'Exported'
                              : invoice.xero_export_status === 'error'
                              ? 'Failed'
                              : 'Not Exported'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvoiceList;