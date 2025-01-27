import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePlus, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PageContainer } from '@/components/layout/PageContainer';

const VendorDashboard = () => {
  const [vendors, setVendors] = useState([]);
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { token } = useAuth();

  // Redirect to login if no token
  React.useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) return; // Prevent fetch if no authentication

        setLoading(true);
        const [vendorsRes, paymentsRes] = await Promise.all([
          fetch('/api/vendors', {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch('/api/vendors/upcoming-payments', {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
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
  }, [token]);

  const filteredVendors = vendors.filter(vendor => 
    vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageContainer>
      <Card>
        <CardHeader className="border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">Vendor Management</CardTitle>
              <CardDescription className="text-gray-600">
                Track vendors, invoices, and payments
              </CardDescription>
            </div>
            <Button 
              onClick={() => navigate('/vendors/new')}
              className="flex items-center gap-2"
            >
              <FilePlus className="h-4 w-4" />
              Add Vendor
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          {/* Vendors List Search */}
          <div className="relative w-full mb-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors..."
              className="pl-9 w-full p-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Vendor List */}
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
              {filteredVendors.length === 0 && (
                <p className="text-center text-gray-600 py-4">No vendors found</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default VendorDashboard;