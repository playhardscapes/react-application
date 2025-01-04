 
// src/components/proposal/ProposalTemplate.jsx
import React from 'react';
import { useMaterialsCosts } from '../../hooks/useMaterialsCosts';
import { useEquipmentCosts } from '../../hooks/useEquipmentCosts';
import { useLaborCosts } from '../../hooks/useLaborCosts';
import { formatCurrency } from '../../utils/formatting';

const formatDate = (date) => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const ProposalTemplate = ({ projectData, pricing }) => {
  const materialsCosts = useMaterialsCosts(projectData.surfaceSystem, projectData.dimensions, pricing);
  const equipmentCosts = useEquipmentCosts(projectData.equipment);
  const laborCosts = useLaborCosts(projectData.logistics, 0, pricing);

  const generateScopeOfWork = () => {
    const parts = [];

    // Surface prep
    if (projectData.surfaceSystem.needsPressureWash) {
      parts.push("Pressure wash existing surface");
    }
    if (projectData.surfaceSystem.needsAcidWash) {
      parts.push("Acid etch new concrete surface");
    }

    // Patch work
    if (projectData.surfaceSystem.patchWork?.needed) {
      parts.push("Patch and repair surface imperfections");
    }

    // Standard coating
    parts.push("Apply two coats of acrylic resurfacer");
    parts.push("Apply two coats of color coating");

    return parts;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8">
      {/* Header */}
      <div className="mb-8 flex justify-between">
        <div>
          <h1 className="text-3xl font-bold">Play Hardscapes</h1>
          <div className="text-gray-600 mt-2">
            <p>Phone: (540) 384-4854</p>
            <p>Email: patrick@playhardscapes.com</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold">Project Proposal</p>
          <p className="text-gray-600">{formatDate(new Date())}</p>
        </div>
      </div>

      {/* Client Info */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Prepared For:</h2>
        <p>{projectData.clientInfo.name}</p>
        <p>{projectData.clientInfo.projectLocation}</p>
        {projectData.clientInfo.email && <p>Email: {projectData.clientInfo.email}</p>}
        {projectData.clientInfo.phone && <p>Phone: {projectData.clientInfo.phone}</p>}
      </div>

      {/* Project Overview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Project Overview</h2>
        <p className="mb-4">
          We are pleased to provide this proposal for your court surfacing project at {projectData.clientInfo.projectLocation}.
          This comprehensive solution is designed to meet your specific requirements and provide a professional-grade playing surface.
        </p>
      </div>

      {/* Scope of Work */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Scope of Work</h2>
        <ul className="list-disc list-inside space-y-2">
          {generateScopeOfWork().map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Base Project Cost */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Project Investment</h2>
        <div className="bg-gray-50 p-4 rounded">
          <p className="font-medium">Base Project Total: {formatCurrency(materialsCosts.total + laborCosts.total)}</p>
          <p className="text-sm text-gray-600 mt-1">Includes all materials, labor, and travel expenses</p>
        </div>
      </div>

      {/* Optional Equipment */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Optional Equipment Packages</h2>
        <div className="space-y-4">
          {Object.entries(equipmentCosts.totals).map(([key, value]) => (
            value > 0 && (
              <div key={key} className="bg-blue-50 p-4 rounded">
                <p className="font-medium">{key} Package: {formatCurrency(value)}</p>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Project Timeline */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Project Timeline</h2>
        <p>Estimated project duration: {laborCosts.details.totalDays} days</p>
      </div>

      {/* Terms and Conditions */}
      <div className="mb-8 text-sm text-gray-600">
        <h2 className="text-xl font-semibold mb-4 text-black">Terms and Conditions</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>50% deposit required to schedule project</li>
          <li>Balance due upon completion</li>
          <li>Proposal valid for 30 days</li>
          <li>Weather conditions may affect schedule</li>
        </ul>
      </div>

      {/* Signature Block */}
      <div className="mt-12 pt-8 border-t">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="font-medium mb-8">Accept Proposal:</p>
            <div className="border-b border-gray-400 mb-2"></div>
            <p className="text-sm text-gray-600">Client Signature & Date</p>
          </div>
          <div>
            <p className="font-medium mb-8">Play Hardscapes:</p>
            <div className="border-b border-gray-400 mb-2"></div>
            <p className="text-sm text-gray-600">Authorized Signature & Date</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalTemplate;
