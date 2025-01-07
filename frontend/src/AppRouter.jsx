// src/AppRouter.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import EstimationWizard from './components/estimator/EstimationWizard';
import ProposalsList from './components/proposals/ProposalsList';
import ContractWizard from './components/contracts/ContractWizard';
import ContractsList from './components/contracts/ContractsList';
import ProjectsList from './components/projects/ProjectsList';
import VendorDashboard from './components/vendors/VendorDashboard';
import VendorList from './components/vendors/VendorList';
import VendorForm from './components/vendors/VendorForm';
import VendorDetail from './components/vendors/VendorDetail';
import NavigationFooter from './components/common/NavigationFooter';

// Replace these individual imports
// import InvoiceForm from "./components/vendors/InvoiceForm";
// import InvoiceDetail from "./components/vendors/InvoiceDetail";
// import InvoiceTracker from "./components/vendors/InvoiceTracker";

// With this single import from invoices directory
import { InvoiceForm, InvoiceDetail, InvoiceTracker } from './components/invoices';

const AppContent = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="pb-20">
      <Routes>
        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Estimates & Proposals */}
        <Route path="/estimate/new" element={<EstimationWizard />} />
        <Route path="/proposals" element={<ProposalsList />} />

        {/* Contracts */}
        <Route path="/contract/new" element={<ContractWizard />} />
        <Route path="/contracts" element={<ContractsList />} />

        {/* Projects */}
        <Route path="/projects" element={<ProjectsList />} />

        {/* Vendors - specific routes first */}
        <Route path="/vendors/new" element={<VendorForm />} />
        {/* Change this route to redirect to /invoices/new */}
        <Route path="/vendors/invoice/new" element={<Navigate to="/invoices/new" replace />} />
        <Route path="/vendors/:id/edit" element={<VendorForm />} />
        <Route path="/vendors/:id" element={<VendorDetail />} />
        <Route path="/vendors" element={<VendorDashboard />} />

        {/* Invoices */}
        <Route path="/invoices/new" element={<InvoiceForm />} />
        <Route path="/invoices/:id/edit" element={<InvoiceForm />} />
        <Route path="/invoices/:id" element={<InvoiceDetail />} />
        <Route path="/invoices" element={<InvoiceTracker />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!isHomePage && <NavigationFooter />}
    </div>
  );
};

const AppRouter = () => (
  <Router>
    <AppContent />
  </Router>
);

export default AppRouter;