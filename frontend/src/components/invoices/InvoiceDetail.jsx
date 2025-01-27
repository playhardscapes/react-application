// src/components/vendors/InvoiceDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DocumentList } from '../documents';
import { PageContainer } from '@/components/layout/PageContainer';
import { 
  FileText, 
  DollarSign, 
  Calendar,
  Building2,
  FileDown,
  AlertTriangle,
  Check
} from 'lucide-react';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        const response = await fetch(`/api/invoices/${id}`);
        if (!response.ok) throw new Error('Failed to fetch invoice');
        const data = await response.json();
        setInvoice(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError('Failed to load invoice details');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, [id]);

  const handleExportToXero = async () => {
    try {
      setExporting(true);
      const response = await fetch(`/api/vendors/invoices/${id}/export-xero`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Export failed');

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `xero-bill-${invoice.invoice_number}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Update invoice with export status
      const statusResponse = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          xero_export_status: 'exported',
          xero_export_date: new Date().toISOString()
        })
      });

      if (!statusResponse.ok) throw new Error('Failed to update export status');
      const updatedInvoice = await statusResponse.json();
      setInvoice(updatedInvoice);

    } catch (error) {
      console.error('Export error:', error);
      setError('Failed to export to Xero');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
     <PageContainer>
          <Card>
            <CardContent className="p-8 text-center">
              Loading invoice details...
            </CardContent>
          </Card>
        </PageContainer>
    );
  }

  if (error || !invoice) {
    return (
      <PageContainer>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-500">{error || 'Invoice not found'}</p>
              <Button 
                onClick={() => navigate('/invoices')}
                className="mt-4"
              >
                Back to Invoices
              </Button>
            </CardContent>
          </Card>
       </PageContainer>
    );
  }

  const isOverdue = new Date(invoice.due_date) < new Date() && invoice.status === 'pending';

  return (
    <PageContainer>
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Invoice #{invoice.invoice_number}</h1>
            <p className="text-gray-600">{invoice.vendor_name}</p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/invoices/${id}/edit`)}
            >
              Edit
            </Button>
            <Button
              onClick={handleExportToXero}
              disabled={exporting || invoice.xero_export_status === 'exported'}
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              {exporting ? 'Exporting...' : 'Export to Xero'}
            </Button>
          </div>
        </div>

        {/* Status Card */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Invoice Status */}
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                {invoice.status === 'paid' ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <Check className="h-4 w-4 mr-1" />
                    Paid
                  </span>
                ) : isOverdue ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Overdue
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    <Calendar className="h-4 w-4 mr-1" />
                    Pending
                  </span>
                )}
              </div>

              {/* Amount */}
              <div>
                <p className="text-sm text-gray-500 mb-1">Amount</p>
                <p className="text-2xl font-bold">
                  ${invoice.amount?.toLocaleString()}
                </p>
              </div>

              {/* Due Date */}
              <div>
                <p className="text-sm text-gray-500 mb-1">Due Date</p>
                <p className="text-lg">
                  {new Date(invoice.due_date).toLocaleDateString()}
                </p>
              </div>

              {/* Xero Status */}
              <div>
                <p className="text-sm text-gray-500 mb-1">Xero Status</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                  invoice.xero_export_status === 'exported'
                    ? 'bg-green-100 text-green-800'
                    : invoice.xero_export_status === 'error'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {invoice.xero_export_status === 'exported' 
                    ? 'Exported to Xero'
                    : invoice.xero_export_status === 'error'
                    ? 'Export Failed'
                    : 'Not Exported'}
                </span>
                {invoice.xero_export_date && (
                  <p className="text-xs text-gray-500 mt-1">
                    Exported: {new Date(invoice.xero_export_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Vendor Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Vendor Name</p>
                <p className="font-medium">{invoice.vendor_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Terms</p>
                <p className="font-medium">{invoice.payment_terms || 'Not specified'}</p>
              </div>
              {invoice.notes && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Notes</p>
                  <p>{invoice.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentList
              documents={[]} // You'll need to fetch documents
              entityType="invoice"
              entityId={id}
            />
          </CardContent>
        </Card>
     </PageContainer>
  );
};

export default InvoiceDetail;