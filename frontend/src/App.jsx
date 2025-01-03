import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import EstimationWizard from './components/estimator/EstimationWizard';
import PricingConfiguration from './components/PricingConfiguration';

function App() {
  // Global project data state
  const [projectData, setProjectData] = useState({
    clientInfo: { name: '', address: '', phone: '', projectLocation: '', mileage: 0, keyNotes: '' },
    substrate: { type: '', condition: '' },
    dimensions: { totalSquareFeet: 0 },
    surfaceSystem: {
      needsPressureWash: false,
      needsAcidWash: false,
      patchWork: { gallons: 0 },
      topCoat: { numberOfColors: 1 },
    },
    courtConfig: { sports: {} },
    logistics: { estimatedDays: 0, travelDays: 0, laborHours: 0 },
    pricing: {},
    pricingConfiguration: {
      materials: {
        binderPrice: 124.65,
        sandPrice: 11.31,
        cementPrice: 18.0,
        colorCoatingPrice: 50.0,
      },
      services: {
        pressureWashing: 0.1,
        linePaintingTennis: 900,
        linePaintingPickleball: 600,
      },
      labor: {
        hourlyRate: 25.0,
      },
    },
  });

  return (
    <Router>
      {/* Navigation Bar */}
      <nav className="flex justify-between bg-blue-600 text-white p-4 shadow">
        <Link to="/" className="text-white font-bold hover:text-gray-200">
          Estimation Wizard
        </Link>
        <Link to="/pricing" className="text-white font-bold hover:text-gray-200">
          Pricing Configuration
        </Link>
      </nav>

      {/* Main Routes */}
      <Routes>
        <Route
          path="/"
          element={
            <EstimationWizard
              pricingData={projectData.pricingConfiguration}
              onProjectDataChange={setProjectData}
            />
          }
        />
        <Route
          path="/pricing"
          element={
            <PricingConfiguration
              pricingData={projectData.pricingConfiguration}
              onChange={(updatedPricing) =>
                setProjectData((prev) => ({
                  ...prev,
                  pricingConfiguration: updatedPricing,
                }))
              }
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
