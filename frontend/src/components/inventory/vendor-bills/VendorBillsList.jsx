import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, FileText } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';

const VendorBillsList = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchBills = async () => {
      if (!token) return;
      
      try {
        const response = await fetch('/api/inventory/vendor-bills', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to fetch vendor bills');
        
        const data = await response.json();
        setBills(data);
      } catch (error) {
        console.error('Error fetching vendor bills:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBills();
  }, [token]);

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.vendor_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageContainer>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-3xl">Vendor Bills</CardTitle>
              <p className="text-gray-600 mt-1">Manage vendor invoices and bills</p>
            </div>
            <Button
              onClick={() => navigate('/inventory/vendor-bills/create')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Bill
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bills..."
                className="pl-9 w-full p-2 border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Bills List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Loading vendor bills...</div>
            ) : filteredBills.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                No vendor bills found.
              </div>
            ) : (
              filteredBills.map(bill => (
                <Card 
                  key={bill.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/inventory/vendor-bills/${bill.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-gray-600" />
                          <h3 className="font-medium">Bill #{bill.bill_number}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(bill.status)}`}>
                            {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Vendor: {bill.vendor_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {bill.items?.length || 0} items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${bill.total_amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-gray-600">
                          Issue: {new Date(bill.issue_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Due: {new Date(bill.due_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default VendorBillsList;