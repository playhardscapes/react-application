// src/AppRouter.jsx
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';

// Dashboard
import Dashboard from './components/Dashboard';

// Client Management
import ClientDashboard from './components/clients/ClientDashboard.jsx';
import ClientForm from './components/clients/ClientForm';
import ClientDetail from './components/clients/ClientDetail';
import FollowUpForm from './components/clients/FollowUpForm';
import ClientNoteForm from './components/clients/ClientNoteForm';
import FollowUpsList from './components/clients/FollowUpsList';

// Estimates
import { default as EstimatesList } from '@/components/estimates/list';
import { default as EstimateForm } from '@/components/estimates/form';
import { default as EstimateView } from '@/components/estimates/view';

// Proposals
import { ProposalsList } from './components/proposals/';
import { ProposalForm } from './components/proposals/';
import { ProposalDetail } from './components/proposals/';
import { NewProposal } from './components/proposals/';

// Contracts
import { ContractWizard } from './components/contracts/';
import { ContractsList } from './components/contracts/';
import { ContractDetail } from './components/contracts/';
import { ContractEdit } from './components/contracts/';

// Import section update
import {
  InventoryDashboard,
  MaterialsList,
  MaterialDetail,
  ReceiveMaterials,
  ToolsList,
  ToolDetail,
  ToolMaintenance,
  MaintenanceSchedule,
  InventoryAudit,
  PurchaseOrders,
  EditMaterial,
  EditTool,
  CreateOrder,
  OrderDetail,
  EditOrder,
  VendorBillsList,
  CreateVendorBill,
  EditVendorBill,
  VendorBillDetail
} from './components/inventory/';

// Locations 
import { 
  LocationsList, 
  LocationDetail, 
  AddLocationDialog,
  ArchivedLocationsList,
  LocationTransferDialog
} from './components/inventory/';

//Documents
import { 
  DocumentList, 
  DocumentUpload, 
  VendorDocumentsAccordion 
} from './components/documents';
import { DocumentDashboard } from './components/documents';

// Projects
import { 
  ProjectForm,
  ProjectsList, 
  ProjectDetail, 
  ProjectSchedule, 
  ProjectTimeline 
} from "./components/projects";

// Pricing
import PricingList from './components/pricing/PricingList';

// Vendors
import { VendorDashboard } from './components/vendors/';
import { VendorList } from './components/vendors/';
import { VendorForm } from './components/vendors/';
import { VendorDetail } from './components/vendors/';

// Invoices
import { InvoiceForm } from './components/invoices/';
import { InvoiceDetail } from './components/invoices/';
import { InvoiceTracker } from './components/invoices/';

// Communications
import { CommunicationsPage } from './components/communications/';
import { CommunicationList } from './components/communications/';
import { EmailInterface } from './components/emails/';

// Common Components
import NavigationFooter from './components/common/NavigationFooter';

// AI
import AIDashboard from './components/AIDashboard';

// Login
import LoginPage from './components/auth/LoginPage';
import ChangePasswordPage from './components/auth/ChangePasswordPage';
import RequestPasswordReset from './components/auth/RequestPasswordReset';
import ResetPassword from './components/auth/ResetPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';

//Users
import UsersManagementComponent from './components/users/UsersManagementComponent';
import EditUserComponent from './components/users/EditUserComponent';



// Finance
import {
  ExpenseEntry,
  ExpenseProcessing,
  QuickExpense,
  Reconciliation,
  CardActivity,
  CashManagement,
  CashFlow,
  Reports,
  TaxCenter,
  ProjectFinance,
  CostAllocation,
  FinanceHub, FinanceDashboard, Cards, Expenses,
} from './components/finance';


const AppRouter = () => {
  return (
    <Routes>
      {/* Auth routes - Outside AppLayout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<RequestPasswordReset />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Protected routes - Wrapped in AppLayout */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Client Management */}
        <Route path="/clients" element={<ClientDashboard />} />
        <Route path="/clients/new" element={<ClientForm />} />
        <Route path="/clients/:id" element={<ClientDetail />} />
        <Route path="/clients/:id/edit" element={<ClientForm />} />
        <Route path="/clients/:id/follow-up" element={<FollowUpForm />} />
        <Route path="/clients/:id/notes/new" element={<ClientNoteForm />} />
        <Route path="/follow-ups" element={<FollowUpsList />} />

        {/* Estimates Routes */}
        <Route path="/estimates" element={<EstimatesList />} />
        <Route path="/estimates/new" element={<EstimateForm />} />
        <Route path="/estimates/:id" element={<EstimateView />} />
        <Route path="/estimates/:id/edit" element={<EstimateForm />} />
        
        {/* Proposals Routes */}
        <Route path="/proposals" element={<ProposalsList />} />
        <Route path="/proposals/new" element={<NewProposal />} />
        <Route path="/proposals/:id" element={<ProposalDetail />} />
        <Route path="/proposals/:id/edit" element={<ProposalForm />} />

        {/* Contracts Routes */}
        <Route path="/contracts" element={<ContractsList />} />
        <Route path="/contract/new" element={<ContractWizard />} />
        <Route path="/contracts/:id" element={<ContractDetail />} />
        <Route path="/contracts/:id/edit" element={<ContractEdit />} />

        {/* Inventory Management Routes */}
        <Route path="/inventory" element={<InventoryDashboard />} />
        <Route path="/inventory/transfer" element={<LocationTransferDialog />} />
        
        {/* Materials Routes */}
        <Route path="/inventory/materials" element={<MaterialsList />} />
        <Route path="/inventory/materials/:id" element={<MaterialDetail />} />
        <Route path="/inventory/materials/:id/edit" element={<EditMaterial />} />
        <Route path="/inventory/materials/receive" element={<ReceiveMaterials />} />
        
        {/* Locations Routes */}
        <Route path="/inventory/locations" element={<LocationsList />} />
        <Route path="/inventory/locations/add" element={<AddLocationDialog />} />
        
        {/* Tools Routes */}
        <Route path="/inventory/tools" element={<ToolsList />} />
        <Route path="/inventory/tools/:id" element={<ToolDetail />} />
        <Route path="/inventory/tools/maintenance" element={<ToolMaintenance />} />
        <Route path="/inventory/tools/schedule" element={<MaintenanceSchedule />} />
        <Route path="/inventory/tools/:id/edit" element={<EditTool />} />

        {/* Purchase Orders Routes */}
        <Route path="/inventory/orders" element={<PurchaseOrders />} />
        <Route path="/inventory/orders/create" element={<CreateOrder />} />
        <Route path="/inventory/orders/:id" element={<OrderDetail />} />
        <Route path="/inventory/orders/:id/edit" element={<EditOrder />} />


        {/* Documents Routes */}
        <Route path="/documents" element={<DocumentDashboard />} />
        <Route path="/documents/upload" element={<DocumentUpload />} />
        <Route path="/documents/:id" element={<DocumentList />} />

        {/* Invoices Routes */}
        <Route path="/invoices" element={<InvoiceTracker />} />
        <Route path="/invoices/new" element={<InvoiceForm />} />
        <Route path="/invoices/:id" element={<InvoiceDetail />} />
        <Route path="/invoices/:id/edit" element={<InvoiceForm />} />

        {/* Projects Routes */}
        <Route path="/projects" element={<ProjectsList />} />
        <Route path="/projects/new" element={<ProjectForm />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/projects/:id/edit" element={<ProjectForm />} />
        <Route path="/projects/schedule" element={<ProjectSchedule />} />
        <Route path="/projects/timeline" element={<ProjectTimeline />} />

        {/* Vendor Bills Routes - Updated paths */}
        <Route path="/inventory/vendor-bills" element={<VendorBillsList />} />
        <Route path="/inventory/vendor-bills/create" element={<CreateVendorBill />} />
        <Route path="/inventory/vendor-bills/:id" element={<VendorBillDetail />} />
        <Route path="/inventory/vendor-bills/:id/edit" element={<EditVendorBill />} />
        
        {/* Audit Routes */}
        <Route path="/inventory/audit" element={<InventoryAudit />} />

        {/* Users Management */}
        <Route path="/users-management" element={<UsersManagementComponent />} />
        <Route path="/users-management/edit/:userId" element={<EditUserComponent />} />

        {/* Pricing Routes */}
        <Route path="/pricing" element={<PricingList />} />
        <Route path="/pricing/:id" element={<PricingList />} />
        <Route path="/pricing/new" element={<PricingList />} />

        {/* Vendor Routes */}
        <Route path="/vendors" element={<VendorDashboard />} />
        <Route path="/vendors/list" element={<VendorList />} />
        <Route path="/vendors/new" element={<VendorForm />} />
        <Route path="/vendors/:id" element={<VendorDetail />} />
        <Route path="/vendors/:id/edit" element={<VendorForm />} />

        {/* Communications Routes */}
        <Route path="/communications" element={<CommunicationsPage />} />
        <Route path="/communications/list" element={<CommunicationList />} />
        <Route path="/emails" element={<EmailInterface />} />

        {/* AI Dashboard */}
        <Route path="/ai-dashboard" element={<AIDashboard />} />

        {/* Change Password (Protected) */}
        <Route path="/change-password" element={<ChangePasswordPage />} />
           
        {/* Finance Routes */}
  <Route path="/finance/hub" element={<FinanceHub />} />
  <Route path="/finance/expenses/quick-entry" element={<QuickExpense />} />
  <Route path="/finance/expenses/entry" element={<ExpenseEntry />} />
  <Route path="/finance/expenses/process" element={<ExpenseProcessing />} />
  <Route path="/finance/cards" element={<CardActivity />} />
  <Route path="/finance/reconciliation" element={<Reconciliation />} />
  <Route path="/finance/cash" element={<CashManagement />} />
  <Route path="/finance/cash-flow" element={<CashFlow />} />
  <Route path="/finance/reports" element={<Reports />} />
  <Route path="/finance/tax" element={<TaxCenter />} />
  <Route path="/finance/projects" element={<ProjectFinance />} />
  <Route path="/finance/allocations" element={<CostAllocation />} />
  <Route path="/finance/dashboard" element={<FinanceDashboard />} />
  <Route path="/finance/cards" element={<Cards />} />
  <Route path="/finance/expenses" element={<Expenses />} />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
</Route>
    </Routes>
  );
};

export default AppRouter;
