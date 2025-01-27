// src/components/invoices/InvoiceTracker.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, AlertCircle, DollarSign } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const InvoiceTracker = () => {
 const [invoices, setInvoices] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const navigate = useNavigate();
 const { token } = useAuth();
 const { toast } = useToast();

 useEffect(() => {
   const fetchInvoices = async () => {
     if (!token) return;
     
     try {
       const response = await fetch('/api/invoices', {
         headers: {
           'Authorization': `Bearer ${token}`
         }
       });
       if (!response.ok) throw new Error('Failed to fetch invoices');
       const data = await response.json();
       setInvoices(Array.isArray(data) ? data : []);
     } catch (error) {
       console.error('Error fetching invoices:', error);
       toast({
         variant: "destructive",
         title: "Error",
         description: "Failed to load invoices"
       });
       setInvoices([]);
     } finally {
       setLoading(false);
     }
   };

   fetchInvoices();
 }, [token]);

 const totalOutstanding = invoices.reduce((sum, invoice) => 
   invoice.status === 'pending' ? sum + (invoice.amount || 0) : sum, 0);

 const overdueAmount = invoices.reduce((sum, invoice) => 
   invoice.status === 'pending' && new Date(invoice.due_date) < new Date() 
     ? sum + (invoice.amount || 0) 
     : sum, 0);

 if (loading) {
   return (
     <PageContainer>
       <Card>
         <CardContent className="flex justify-center items-center min-h-[200px]">
           <p>Loading invoice tracker...</p>
         </CardContent>
       </Card>
     </PageContainer>
   );
 }

 return (
   <PageContainer>
     <Card>
       <CardHeader>
         <div className="flex justify-between items-center">
           <CardTitle>Invoice Tracker</CardTitle>
           <Button 
             onClick={() => navigate('/invoices/new')}
             className="bg-blue-600 text-white hover:bg-blue-700"
           >
             Add Invoice
           </Button>
         </div>
       </CardHeader>
       <CardContent className="space-y-6">
         {/* Quick Stats */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
         <div className="space-y-4">
           {error ? (
             <p className="text-red-500">{error}</p>
           ) : invoices.length === 0 ? (
             <p>No invoices found</p>
           ) : (
             invoices.map(invoice => (
               <div
                 key={invoice.id}
                 className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                 onClick={() => navigate(`/invoices/${invoice.id}`)}
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
                     ${(invoice.amount || 0).toLocaleString()}
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
   </PageContainer>
 );
};

export default InvoiceTracker;