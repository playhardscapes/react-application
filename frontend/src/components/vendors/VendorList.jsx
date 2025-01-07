// src/components/vendors/VendorList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Plus, AlertCircle, Building2 } from 'lucide-react';

const VendorList = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch('/api/vendors');
        const data = await response.json();
        setVendors(data);
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const overdueAmount = vendors.reduce((sum, vendor) => 
    sum + (vendor.overdue_amount || 0), 0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Vendors</h1>
            <p className="text-gray-600">Manage vendors and payments</p>
          </div>
          <Button 
            onClick={() => navigate('/vendors/new')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Vendor
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-blue-600" />
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
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">${overdueAmount.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Overdue Payments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Vendor List</CardTitle>
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
            <div className="space-y-4">
              {loading ? (
                <p className="text-center py-4">Loading vendors...</p>
              ) : filteredVendors.length === 0 ? (
                <p className="text-center py-4">No vendors found</p>
              ) : (
                filteredVendors.map(vendor => (
                  <div
                    key={vendor.id}
                    className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/vendors/${vendor.id}`)}
                  >
                    <div>
                      <h3 className="font-medium">{vendor.name}</h3>
                      <p className="text-sm text-gray-600">
                        {vendor.city}, {vendor.state}
                      </p>
                      {vendor.payment_terms && (
                        <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          Terms: {vendor.payment_terms}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      {vendor.open_invoices > 0 && (
                        <p className="text-sm text-gray-600">
                          {vendor.open_invoices} open {vendor.open_invoices === 1 ? 'invoice' : 'invoices'}
                        </p>
                      )}
                      {vendor.total_outstanding > 0 && (
                        <p className="font-medium">
                          ${vendor.total_outstanding.toLocaleString()}
                        </p>
                      )}
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

export default VendorList;