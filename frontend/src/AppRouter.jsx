// src/AppRouter.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Dashboard
import Dashboard from './components/Dashboard';

// Client Management
import {
  ClientDashboard,
  ClientForm,
  ClientDetail,
  FollowUpForm,
  ClientNoteForm
} from './components/clients';

// Estimates
import EstimationWizard from './components/estimator/EstimationWizard';
import EstimatesList from './components/estimates/EstimatesList';

// Proposals
import {
  ProposalsList,
  ProposalForm,
  ProposalDetail,
  NewProposal
} from './components/proposals';

// Contracts
 import {
  ContractWizard,
  ContractsList,
  ContractDetail,
  ContractEdit
} from './components/contracts';

// Projects
import ProjectsList from './components/projects/ProjectsList';
import ProjectDetail from './components/projects/ProjectDetail';

// Pricing
import PricingList from './components/pricing/PricingList';

// Vendors
import VendorDashboard from './components/vendors/VendorDashboard';
import VendorList from './components/vendors/VendorList';
import VendorForm from './components/vendors/VendorForm';
import VendorDetail from './components/vendors/VendorDetail';

// Invoices
import {
  InvoiceForm,
  InvoiceDetail,
  InvoiceTracker
} from './components/invoices';

// Common Components
import NavigationFooter from './components/common/NavigationFooter';

// Communications
import CommunicationsPage from './components/communications';
import CommunicationList from './components/communications';
import EmailInterface from './components/emails';


const AppContent = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="pb-20">
      <Routes>
        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Client Management */}
        <Route path="/clients" element={<ClientDashboard />} />
        <Route path="/clients/new" element={<ClientForm />} />
        <Route path="/clients/:id" element={<ClientDetail />} />
        <Route path="/clients/:id/edit" element={<ClientForm />} />
        <Route path="/clients/:id/follow-up" element={<FollowUpForm />} />
        <Route path="/clients/:id/notes/new" element={<ClientNoteForm />} />

        {/* Estimates Routes */}
        <Route path="/estimates" element={<EstimatesList />} />
        <Route path="/estimate/new" element={<EstimationWizard />} />
        <Route path="/estimate/:id" element={<EstimationWizard />} />

        
       {/* Proposals Routes */}
       <Route path="/proposals" element={<ProposalsList />} />
        <Route path="/proposals/new" element={<NewProposal />} />
        <Route path="/proposals/:id" element={<ProposalDetail />} />
        <Route path="/proposals/:id/edit" element={<ProposalForm />} />

        {/* Contracts Routes */}
        <Route path="/contracts" element={<ContractsList />} />
        <Route path="/contract/new" element={<ContractWizard />} /> {/* Changed from /contracts/new */}
        <Route path="/contracts/:id" element={<ContractDetail />} />
        <Route path="/contracts/:id/edit" element={<ContractEdit />} />

        {/* Projects Routes */}
        <Route path="/projects" element={<ProjectsList />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        
        {/* Pricing Routes */}
        <Route path="/pricing" element={<PricingList />} />

        {/* Vendors Routes */}
        <Route path="/vendors" element={<VendorList />} />
        <Route path="/vendors/new" element={<VendorForm />} />
        <Route path="/vendors/:id" element={<VendorDetail />} />
        <Route path="/vendors/:id/edit" element={<VendorForm />} />

        {/* Invoices Routes */}
        <Route path="/invoices" element={<InvoiceTracker />} />
        <Route path="/invoices/new" element={<InvoiceForm />} />
        <Route path="/invoices/:id" element={<InvoiceDetail />} />
        <Route path="/invoices/:id/edit" element={<InvoiceForm />} />

        {/* Communications */}
        <Route path="/communications" element={<CommunicationsPage />} />
        <Route path="/communications" element={<CommunicationList />} />
        <Route path="/emails" element={<EmailInterface />} />
        <Route path="/emails/:id" element={<EmailInterface />} />
        

        {/* Fallback Route */}
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
