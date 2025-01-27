// src/components/Dashboard/index.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import WelcomeSection from './WelcomeSection';
import DashboardSection from './DashboardSection';
import { 
  PenTool, Files, FileText, Building2, Truck, MessageCircle,
  Mail, Brain, Users, DollarSign, Calendar, AlertCircle,
  Package, FileSpreadsheet, HardHat, Clock, Wrench, LogOut,
  UserSquare2, Loader2, ClipboardList, Banknote, Receipt, ShoppingCart, CreditCard, 
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, loading, isAuthenticated } = useAuth();
  const [communicationCount, setCommunicationCount] = useState(0);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [loading, isAuthenticated, navigate]);

  
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <WelcomeSection user={user} onLogout={logout} />

        <DashboardSection
          title="Business Operations"
          items={[
             {
              icon: Package,
              title: "Inventory",
              description: "Materials and tools tracking",
              onClick: () => navigate('/inventory')
            }, 
            {
              icon: ClipboardList,
              title: "Purchase Orders",
              description: "Create and manage purchase orders",
              onClick: () => navigate('/inventory/orders')
            },  
            {
              icon: ShoppingCart,
              title: "Receive Materials",
              description: "Process and log incoming inventory",
              onClick: () => navigate('/inventory/materials/receive')
            },   
            {
              icon: Truck,
              title: "Vendors",
              description: "Manage supplier relationships and payments",
              onClick: () => navigate('/vendors')
            },
            {
              icon: Banknote,
              title: "Bills",
              description: "Track and manage vendor bills",
              onClick: () => navigate('/inventory/vendor-bills')
            },
            {
              icon: DollarSign,
              title: "Pricing",
              description: "Configure product and service pricing",
              onClick: () => navigate('/pricing')
            },
            {
              icon: FileText,
              title: "Document Management",
              description: "Organize and share documents",
              onClick: () => navigate('/documents')
            },              
            {
              icon: UserSquare2,
              title: "User Management",
              description: "Manage system users and access",
              onClick: () => navigate('/users-management')
            },
            {
              icon: Brain,
              title: "AI Development Partner",
              description: "System insights and improvements",
              onClick: () => navigate('/ai-dashboard')
            }
          ]}
        />

        <DashboardSection
          title="Client and Project Management"
          items={[
            {
              icon: Users,
              title: "Clients",
              description: "Client relationship management",
              onClick: () => navigate('/clients')
            },
            {
              icon: PenTool,
              title: "Estimates",
              description: "Create and manage project estimates",
              onClick: () => navigate('/estimates')
            },
            {
              icon: Files,
              title: "Proposals",
              description: "Generate and track proposals",
              onClick: () => navigate('/proposals')
            },
            {
              icon: FileText,
              title: "Contracts",
              description: "Manage project contracts",
              onClick: () => navigate('/contracts')
            },
            {
              icon: Calendar,
              title: "Scheduling",
              description: "Project timelines and weather tracking",
              onClick: () => navigate('/projects/schedule')
            },
            {
              icon: HardHat,
              title: "Projects",
              description: "Manage ongoing construction",
              onClick: () => navigate('/projects')
            },
            {
              icon: Wrench,
              title: "Project Tasks",
              description: "Track and assign work items",
              onClick: () => navigate('/tasks')
            },
            {
              icon: Clock,
              title: "Time Tracking",
              description: "Monitor project hours",
              onClick: () => navigate('/time-tracking')
            },
            {
              icon: Receipt,
              title: "Invoices",
              description: "Generate and track customer invoices",
              onClick: () => navigate('/invoices')
            }
          ]}
        />

        <DashboardSection
          title="Communication"
          items={[
            {
              icon: MessageCircle,
              title: "Communications",
              description: "Client messages and inquiries",
              onClick: () => navigate('/communications'),
              badge: communicationCount
            },
            {
              icon: Mail,
              title: "Email Management",
              description: "Inbox and email tracking",
              onClick: () => navigate('/emails')
            }
          ]}
        />

               <DashboardSection
          title="Financial Management"
          items={[
            {
              icon: Receipt,
              title: "Quick Expense",
              description: "Snap & process receipts",
              onClick: () => navigate('/finance/expenses/quick-entry')
            },
            {
              icon: CreditCard,
              title: "Card Activity",
              description: "Track card transactions",
              onClick: () => navigate('/finance/cards')
            },
            {
              icon: Building2,
              title: "Financial Hub",
              description: "Complete financial management",
              onClick: () => navigate('/finance/hub'),
              className: "bg-blue-50 hover:bg-blue-100" // Highlight this option
            }
          ]}
         />
      </div>
    </div>
  );
};

export default Dashboard;