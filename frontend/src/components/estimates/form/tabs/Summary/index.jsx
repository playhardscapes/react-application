// src/components/estimator/EstimationForm/tabs/Summary/index.jsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/utils/formatting';
import { useSurfacePrepCosts } from '@/hooks/useSurfacePrepCosts';
import { useColorCoatCosts } from '@/hooks/useColorCoatCosts';
import { useEquipmentCosts } from '@/hooks/useEquipmentCosts';
import { useLogisticsCosts } from '@/hooks/useLogisticsCosts';
import { useOtherCosts } from '@/hooks/useOtherCosts';

const safeNumber = (value) => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

const CostSection = ({ title, items = [], total = 0, className = '', additionalItems = [] }) => (
  <div className={`space-y-2 ${className}`}>
    <h4 className="font-medium text-lg">{title}</h4>
    {items
      .filter(item => item && (safeNumber(item.amount) > 0 || item.showZero))
      .map((item, index) => (
        <div key={index} className="flex justify-between text-sm">
          <span className="text-gray-600">{item.label}</span>
          <span>{formatCurrency(safeNumber(item.amount))}</span>
        </div>
      ))}
    {additionalItems.map((item, index) => (
      <div key={index} className="flex justify-between text-sm">
        <span className="text-gray-600">{item.label}</span>
        <span>{formatCurrency(safeNumber(item.amount))}</span>
      </div>
    ))}
    <div className="border-t pt-2 mt-2">
      <div className="flex justify-between font-medium">
        <span>Total {title}</span>
        <span>{formatCurrency(safeNumber(total))}</span>
      </div>
    </div>
  </div>
);

const Summary = ({ data = {}, onChange }) => {
  const surfacePrepCosts = useSurfacePrepCosts(data);
  const colorCoatCosts = useColorCoatCosts(data);
  const equipmentCosts = useEquipmentCosts(data);
  const logisticsCosts = useLogisticsCosts(data);
  const otherCosts = useOtherCosts(data);

  const subtotal = safeNumber(surfacePrepCosts?.total) +
    safeNumber(equipmentCosts?.total) +
    safeNumber(colorCoatCosts?.materials?.total) +
    safeNumber(colorCoatCosts?.materials?.resurfacer?.cost) +
    safeNumber(colorCoatCosts?.materials?.resurfacer?.installationCost) +
    safeNumber(colorCoatCosts?.installation?.total) +
    safeNumber(colorCoatCosts?.lining?.total) +
    safeNumber(logisticsCosts?.total) +
    safeNumber(otherCosts?.total);

  const marginPercentage = safeNumber(data.margin);
  const marginAmount = subtotal * (marginPercentage / 100);
  const total = subtotal + marginAmount;
  const costPerSqFt = data.square_footage ? total / safeNumber(data.square_footage) : 0;

  return (
    <Card className="p-6">
      <div className="space-y-8">
        <div className="border-b pb-4">
          <h3 className="text-2xl font-bold">Project Summary</h3>
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div>
              <span className="text-gray-600">Client:</span>
              <span className="ml-2">{data.client_name || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-gray-600">Location:</span>
              <span className="ml-2">{data.project_location || 'Not specified'}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Area:</span>
              <span className="ml-2">{safeNumber(data.square_footage).toLocaleString()} sq ft</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <CostSection
            title="Surface Preparation"
            items={[
              { label: 'Pressure Washing', amount: surfacePrepCosts?.pressureWash },
              { label: 'Acid Wash', amount: surfacePrepCosts?.acidWash },
              { label: 'Patch Work', amount: surfacePrepCosts?.patchWork?.total },
              { label: 'Fiberglass Mesh System', amount: surfacePrepCosts?.fiberglassMesh?.total },
              { label: 'Cushion System', amount: surfacePrepCosts?.cushionSystem?.total }
            ]}
            total={surfacePrepCosts?.total}
          />

          <CostSection
            title="Coating"
            items={[
              { label: 'Resurfacer Materials', amount: colorCoatCosts?.materials?.resurfacer?.cost },
              { label: 'Resurfacer Installation', amount: colorCoatCosts?.materials?.resurfacer?.installationCost },
              { label: 'Color Coat Materials', amount: colorCoatCosts?.materials?.total },
              { label: 'Color Coat Installation', amount: colorCoatCosts?.installation?.baseCost },
              { label: 'Line Markings', amount: colorCoatCosts?.lining?.total }
            ]}
            additionalItems={[
              { 
                label: `Color Upcharge (${colorCoatCosts?.installation?.uniqueColors || 1} colors)`, 
                amount: colorCoatCosts?.installation?.upchargeCost 
              }
            ]}
            total={safeNumber(colorCoatCosts?.materials?.total) +
                   safeNumber(colorCoatCosts?.materials?.resurfacer?.cost) +
                   safeNumber(colorCoatCosts?.materials?.resurfacer?.installationCost) +
                   safeNumber(colorCoatCosts?.installation?.baseCost) +
                   safeNumber(colorCoatCosts?.installation?.upchargeCost) +
                   safeNumber(colorCoatCosts?.lining?.total)}
          />

          <CostSection
            title="Equipment"
            items={[
              { label: 'Tennis Equipment', amount: equipmentCosts?.tennis?.total },
              { label: 'Pickleball Equipment', amount: equipmentCosts?.pickleball?.total },
              { label: 'Basketball Systems', amount: equipmentCosts?.basketball?.total },
              { label: 'Windscreen', amount: equipmentCosts?.windscreen?.total }
            ]}
            total={equipmentCosts?.total}
          />

          <CostSection
            title="Labor and Travel"
            items={[
              { label: 'Additional Labor', amount: logisticsCosts?.labor?.total },
              { label: 'Lodging', amount: logisticsCosts?.lodging?.total },
              { label: 'Mileage', amount: logisticsCosts?.mileage?.total }
            ]}
            total={logisticsCosts?.total}
          />

          {safeNumber(otherCosts?.total) > 0 && (
            <CostSection
              title="Other"
              items={data.other_items?.map(item => ({
                label: item.description || 'Additional Cost',
                amount: item.cost
              })) || []}
              total={otherCosts?.total}
            />
          )}
        </div>

        <div className="border-t pt-4 mb-4">
          <Label htmlFor="margin">Margin Percentage</Label>
          <div className="flex items-center gap-2 mb-4">
            <Input
              id="margin"
              type="number"
              min="0"
              max="100"
              value={data.margin || 0}
              onChange={(e) => onChange({ ...data, margin: parseFloat(e.target.value) || 0 })}
              className="w-32"
            />
            <span>%</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-lg">
            <span className="text-gray-600">Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span className="text-gray-600">Margin Amount:</span>
            <span>{formatCurrency(marginAmount)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold">
            <span>Project Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
          {safeNumber(data.square_footage) > 0 && (
            <div className="text-sm text-gray-600 text-right">
              {formatCurrency(costPerSqFt)} per sq ft
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default Summary;