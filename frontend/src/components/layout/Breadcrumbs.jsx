import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeLabels = {
  'inventory': 'Inventory',
  'tools': 'Tools',
  'materials': 'Materials',
  'maintenance': 'Maintenance',
  'orders': 'Purchase Orders',
  'locations': 'Locations',
  'vendor-bills': 'Vendor Bills',
  'projects': 'Projects',
  'schedule': 'Schedule',
  'clients': 'Clients',
  'proposals': 'Proposals',
  'contracts': 'Contracts',
  'documents': 'Documents',
  'vendors': 'Vendors',
  'invoices': 'Invoices',
  'finance': 'Finance',
  'expenses': 'Expenses',
  'quick-entry': 'Quick Entry',
  'process': 'Process',
  'cards': 'Cards',
  'reconciliation': 'Reconciliation',
  'cash': 'Cash Management',
  'cash-flow': 'Cash Flow',
  'reports': 'Reports',
  'tax': 'Tax Center',
  'allocations': 'Cost Allocation',
  'dashboard': 'Dashboard',
  'hub': 'Finance Hub',
  'pricing': 'Pricing',
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  // Don't show breadcrumbs on the main dashboard
  if (pathnames.length === 0) return null;

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600">
      <Link 
        to="/" 
        className="flex items-center hover:text-gray-900"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {pathnames.map((name, index) => {
        // Don't make the last item a link
        const isLast = index === pathnames.length - 1;
        
        // Build up the route
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        
        // Check if it's an ID (simple check for non-named routes)
        const isId = !isNaN(name) || name.length > 20;
        
        // Get display name
        const displayName = isId ? `#${name}` : (routeLabels[name] || name);

        return (
          <React.Fragment key={name}>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            {isLast ? (
              <span className="font-medium text-gray-900">
                {displayName}
              </span>
            ) : (
              <Link
                to={routeTo}
                className="hover:text-gray-900"
              >
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Breadcrumbs;