// src/components/pricing/TotalPricingDisplay.jsx
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMaterialsCosts } from '../../hooks/useMaterialsCosts';
import { useEquipmentCosts } from '../../hooks/useEquipmentCosts';
import { useLaborCosts } from '../../hooks/useLaborCosts';
import { formatCurrency } from '../../utils/formatting';

const OptionCard = ({ title, items, total }) => (
  <div className="bg-blue-50 p-4 rounded-lg mb-4">
    <h4 className="font-medium text-blue-900 mb-2">{title}</h4>
    <div className="space-y-1">
      {items.map((item, index) => (
        <div key={index} className="flex justify-between text-sm">
          <span className="text-blue-800">{item.label}:</span>
          <span className="text-blue-900">{formatCurrency(item.cost)}</span>
        </div>
      ))}
      <div className="border-t border-blue-200 mt-2 pt-2 font-medium text-blue-900">
        <div className="flex justify-between">
          <span>Option Total:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  </div>
);

const TotalPricingDisplay = ({ projectData, pricing }) => {
  const { token } = useAuth();
  const materialsCosts = useMaterialsCosts(projectData.surfaceSystem, projectData.dimensions, pricing, token);
  const equipmentCosts = useEquipmentCosts(projectData.equipment, token);
  const laborCosts = useLaborCosts(projectData.logistics, 0, pricing, token);

  const calculateBaseTotal = () => {
    return materialsCosts.total + laborCosts.total;
  };

  const calculateTaxes = (amount, rate = 0.06) => amount * rate;
  const calculateMargin = (amount, rate = 0.3) => amount * rate;

  // Create equipment options
  const equipmentOptions = {
    tennis: equipmentCosts.posts.tennis.equipment > 0 ? {
      title: "Tennis Equipment Package",
      items: [
        { label: "Tennis Posts", cost: equipmentCosts.posts.tennis.equipment },
        { label: "Installation", cost: equipmentCosts.posts.tennis.installation + equipmentCosts.posts.tennis.holes + equipmentCosts.posts.tennis.concrete }
      ],
      total: equipmentCosts.posts.tennis.equipment + equipmentCosts.posts.tennis.installation + equipmentCosts.posts.tennis.holes + equipmentCosts.posts.tennis.concrete
    } : null,
    pickleball: (equipmentCosts.posts.pickleball.equipment > 0 || equipmentCosts.posts.mobilePickleball.equipment > 0) ? {
      title: "Pickleball Equipment Package",
      items: [
        ...(equipmentCosts.posts.pickleball.equipment > 0 ? [
          { label: "Permanent Posts", cost: equipmentCosts.posts.pickleball.equipment },
          { label: "Installation", cost: equipmentCosts.posts.pickleball.installation + equipmentCosts.posts.pickleball.holes + equipmentCosts.posts.pickleball.concrete }
        ] : []),
        ...(equipmentCosts.posts.mobilePickleball.equipment > 0 ? [
          { label: "Mobile Nets", cost: equipmentCosts.posts.mobilePickleball.equipment }
        ] : [])
      ],
      total: equipmentCosts.posts.pickleball.equipment + equipmentCosts.posts.pickleball.installation +
             equipmentCosts.posts.pickleball.holes + equipmentCosts.posts.pickleball.concrete +
             equipmentCosts.posts.mobilePickleball.equipment
    } : null,
    basketball: equipmentCosts.basketball?.length > 0 ? {
      title: "Basketball Equipment Package",
      items: equipmentCosts.basketball.map((system, index) => ({
        label: `System ${index + 1}`,
        cost: system.equipment + system.installation + system.holes + system.concrete
      })),
      total: equipmentCosts.basketball.reduce((sum, system) =>
        sum + system.equipment + system.installation + system.holes + system.concrete, 0)
    } : null,
    windscreen: (equipmentCosts.windscreen.lowGrade.cost > 0 || equipmentCosts.windscreen.highGrade.cost > 0) ? {
      title: "Windscreen Package",
      items: [
        ...(equipmentCosts.windscreen.lowGrade.cost > 0 ? [
          { label: "Low-Grade Windscreen", cost: equipmentCosts.windscreen.lowGrade.cost }
        ] : []),
        ...(equipmentCosts.windscreen.highGrade.cost > 0 ? [
          { label: "High-Grade Windscreen", cost: equipmentCosts.windscreen.highGrade.cost }
        ] : [])
      ],
      total: equipmentCosts.windscreen.lowGrade.cost + equipmentCosts.windscreen.highGrade.cost
    } : null
  };

  const baseTotal = calculateBaseTotal();
  const baseTax = calculateTaxes(baseTotal);
  const baseMargin = calculateMargin(baseTotal);
  const projectTotal = baseTotal + baseTax + baseMargin;

  return (
    <div className="space-y-6">
      {/* Base Project Cost */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Base Project Cost</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-medium">Materials</h4>
              {/* Materials breakdown here */}
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-medium">Labor & Travel</h4>
              {/* Labor breakdown here */}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-lg">
                <span>Base Project Total:</span>
                <span>{formatCurrency(projectTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Optional Equipment Packages */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Optional Equipment Packages</h3>
        <div className="space-y-4">
          {Object.values(equipmentOptions)
            .filter(option => option !== null)
            .map((option, index) => (
              <OptionCard
                key={index}
                title={option.title}
                items={option.items}
                total={option.total}
              />
            ))}
        </div>
      </div>

      {/* Project Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Project Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="block font-medium">Timeline</span>
            {laborCosts.details.totalDays} days
          </div>
          <div>
            <span className="block font-medium">Square Footage</span>
            {projectData.dimensions?.squareFootage || 0} sq ft
          </div>
          <div>
            <span className="block font-medium">Base Cost per Sq Ft</span>
            {formatCurrency(projectTotal / (projectData.dimensions?.squareFootage || 1))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalPricingDisplay;
