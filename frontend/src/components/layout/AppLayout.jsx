import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Breadcrumbs from './Breadcrumbs';
import { Toaster } from "@/components/ui/toaster";
import { 
  PenTool, Files, FileText, Building2, Truck, MessageCircle,
  Mail, Brain, Users, DollarSign, Calendar, AlertCircle,
  Package, FileSpreadsheet, HardHat, Clock, Wrench, LogOut,
  UserSquare2, ClipboardList, Banknote, Receipt, ChevronLeft,
  ChevronRight, Menu, ShoppingCart
} from 'lucide-react';

const NavItem = ({ icon: Icon, title, path, isCollapsed, badge }) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Link
      to={path}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100",
        isActive && "bg-gray-100 text-gray-900"
      )}
    >
      <Icon className="h-4 w-4" />
      {!isCollapsed && (
        <>
          <span className="flex-1">{title}</span>
          {badge && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-900">
              {badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
};

const NavGroup = ({ title, items, isCollapsed }) => {
  if (isCollapsed) {
    return (
      <div className="space-y-2 py-2">
        {items.map((item) => (
          <NavItem key={item.title} {...item} isCollapsed={true} />
        ))}
      </div>
    );
  }

  return (
    <div className="py-2">
      <h2 className="px-3 text-xs font-semibold text-gray-500">{title}</h2>
      <div className="space-y-1 py-2">
        {items.map((item) => (
          <NavItem key={item.title} {...item} isCollapsed={false} />
        ))}
      </div>
    </div>
  );
};

const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const navigationGroups = [
    {
      title: "Business Operations",
      items: [
        { icon: Package, title: "Inventory", path: "/inventory" },
        { icon: ClipboardList, title: "Purchase Orders", path: "/inventory/orders" },
        { icon: ShoppingCart, title: "Receive Materials", path: "/inventory/materials/receive" },
        { icon: Truck, title: "Vendors", path: "/vendors" },
        { icon: Banknote, title: "Bills", path: "/inventory/vendor-bills" },
        { icon: DollarSign, title: "Pricing", path: "/pricing" },
        { icon: FileText, title: "Documents", path: "/documents" },
        { icon: UserSquare2, title: "User Management", path: "/users-management" },
        { icon: Brain, title: "AI Development", path: "/ai-dashboard" }
      ]
    },
    {
      title: "Client and Project Management",
      items: [
        { icon: Users, title: "Clients", path: "/clients" },
        { icon: PenTool, title: "Estimates", path: "/estimates" },
        { icon: Files, title: "Proposals", path: "/proposals" },
        { icon: FileText, title: "Contracts", path: "/contracts" },
        { icon: Calendar, title: "Scheduling", path: "/projects/schedule" },
        { icon: HardHat, title: "Projects", path: "/projects" },
        { icon: Wrench, title: "Project Tasks", path: "/tasks" },
        { icon: Clock, title: "Time Tracking", path: "/time-tracking" },
        { icon: Receipt, title: "Invoices", path: "/invoices" }
      ]
    },
    {
      title: "Communication",
      items: [
        { icon: MessageCircle, title: "Communications", path: "/communications" },
        { icon: Mail, title: "Email Management", path: "/emails" }
      ]
    },
 
     ];

  return (
    <div className="flex min-h-screen">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 z-40 flex flex-col bg-white border-r transition-all",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "left-0" : "-left-64 lg:left-0"
        )}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-3 border-b">
          {!isCollapsed && <span className="font-semibold">Play Hardscapes</span>}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          {navigationGroups.map((group) => (
            <NavGroup
              key={group.title}
              title={group.title}
              items={group.items}
              isCollapsed={isCollapsed}
            />
          ))}
        </ScrollArea>

        {/* Collapse Button */}
        <div className="h-16 hidden lg:flex items-center justify-end px-3 border-t">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative">  {/* Added relative positioning */}
        {/* Top Bar */}
        <div className="h-16 border-b flex items-center px-6 gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Add Breadcrumbs */}
          <Breadcrumbs />
        </div>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>

        {/* Add Toaster with correct positioning */}
        <Toaster 
  position="top-center"
  toastOptions={{
    duration: 5000,
    className: "z-[100] relative",
    style: {
      background: 'white',
      color: 'black',
      marginTop: '4rem',
      borderWidth: '1px',
      maxWidth: '420px',
    },
  }}
/>

      </main>
      <Toaster position="top-right" />
    </div>
  );
};

export default AppLayout;