// src/components/finance/index.js
export { default as ExpenseEntry } from './expenses/ExpenseEntry';
export { default as ExpenseProcessing } from './expenses/ExpenseProcessing';
export { default as QuickExpense } from './expenses/QuickExpense';
export { default as Reconciliation } from './expenses/Reconciliation';
export { default as CardActivity } from './cards/CardActivity';
export { default as CashManagement } from './cash/CashManagement';
export { default as CashFlow } from './cash/CashFlow';
export { default as Reports } from './reports/Reports';
export { default as TaxCenter } from './reports/TaxCenter';
export { default as ProjectFinance } from './projects/ProjectFinance';
export { default as CostAllocation } from './projects/CostAllocation';
export { default as FinanceHub } from './hub/FinanceHub';
export { default as FinanceHubCard } from './hub/FinanceHubCard';
export { default as FinanceDashboard } from './dashboard/FinanceDashboard';
export { default as Cards } from './cards/CardActivity';
export { default as Expenses } from './expenses/QuickExpense';

// Common utility functions for finance components
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const calculateNetAmount = (inflows, outflows) => {
  const totalInflows = inflows.reduce((sum, flow) => sum + flow.amount, 0);
  const totalOutflows = outflows.reduce((sum, flow) => sum + flow.amount, 0);
  return totalInflows - totalOutflows;
};

export const getTaxYear = () => {
  const currentDate = new Date();
  return currentDate.getMonth() < 11 ? currentDate.getFullYear() : currentDate.getFullYear() + 1;
};