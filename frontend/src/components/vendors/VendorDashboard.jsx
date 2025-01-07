import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePlus, Search } from 'lucide-react';

const VendorDashboard = () => {
  const [vendors, setVendors] = useState([]);
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [vendorsRes, paymentsRes] = await Promise.all([
          fetch('/api/vendors'),
          fetch('/api/vendors/upcoming-payments')
        ]);

        if (!vendorsRes.ok) throw new Error('Failed to fetch vendors');
        if (!paymentsRes.ok) throw new Error('Failed to fetch payments');

        const [vendorsData, paymentsData] = await Promise.all([
          vendorsRes.json(),
          paymentsRes.json()
        ]);

        setVendors(vendorsData);
        setUpcomingPayments(paymentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredVendors = vendors.filter(vendor => 
    vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOutstanding = upcomingPayments.reduce((sum, payment) => 
    sum + (payment.amount || 0), 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Vendor Management</h1>
            <p className="text-gray-600">Track vendors, invoices, and payments</p>
          </div>
          <Button 
            onClick={() => navigate('/vendors/new')}
            className="flex items-center gap-2"
          >
            <FilePlus className="h-4 w-4" />
            Add Vendor
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-2xl font-bold">{vendors.length}</p>
                  <p className="text-sm text-gray-600">Total Vendors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-2xl font-bold">${totalOutstanding.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Due This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vendors List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Vendors</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  className="pl-9 w-full p-2 border rounded-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4">Loading...</p>
            ) : (
              <div className="space-y-4">
                {filteredVendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/vendors/${vendor.id}`)}
                  >
                    <div>
                      <h3 className="font-medium">{vendor.name}</h3>
                      <p className="text-sm text-gray-600">
                        {vendor.city} {vendor.state && `, ${vendor.state}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${vendor.total_outstanding?.toLocaleString() || '0'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {vendor.open_invoices || 0} open invoices
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorDashboard;