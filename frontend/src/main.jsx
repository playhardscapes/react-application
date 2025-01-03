import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Tailwind styles
import EstimationWizard from './components/estimator/EstimationWizard';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <EstimationWizard />
  </React.StrictMode>
);
