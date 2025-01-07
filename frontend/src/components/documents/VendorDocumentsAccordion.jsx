// src/components/documents/VendorDocumentsAccordion.jsx
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FolderOpen, File } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const VendorDocumentsAccordion = ({ 
  onDocumentsSelect,
  selectedDocs = [],
  readOnly = false 
}) => {
  const [expandedVendors, setExpandedVendors] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});

  const vendorStructure = {
    'California Sports Surfaces': {
      'Brochures': [
        'CoolTop-Brochure_12.24-English.pdf',
        'Plexicushion-Prestige-cut-sheet_10.23.pdf',
        'Plexipave-color-card.pdf',
        'Plexipave-Hardcourt-cut-sheet_10.23.pdf'
      ],
      'CSI SPEC': [
        'Plexicushion-CSI-Spec.doc',
        'Plexipave-CSI-Spec.doc'
      ],
      'Installation Guides': [
        'Plexicushion-Installation-Guide-Field-Mix-for-asphalt.pdf',
        'Plexicushion-Installation-Guide-Field-Mix-for-concrete.pdf',
        'Plexipave-Installation-Guide-Field-Mix-for-concrete.pdf',
        'Plexipave-Installation-Guide-Field-Mix-with-sand-for-asphalt.pdf'
      ],
      'Maintenance Guides': [
        'PLEXIPAVE-PLEXICUSHION-COURT-MAINTENANCE-AND-REPAIR.pdf'
      ],
      'SDS - Safety Data Sheets': [
        '0300_CSS-Court-Patch-Binder-US-SDS.pdf',
        '4200_Acrylic-Resurfacer-US-SDS.pdf',
        '4520-Concrete-Preparer-C-37-SDS-May-2020.pdf'
      ]
    },
    'Mapei': {
      'Technical Documents': [],
      'Safety Data Sheets': []
    },
    'Putterman': {
      'Equipment': [],
      'Installation Guides': []
    }
  };

  const toggleVendor = (vendor) => {
    setExpandedVendors(prev => ({
      ...prev,
      [vendor]: !prev[vendor]
    }));
  };

  const toggleCategory = (vendor, category) => {
    const key = `${vendor}-${category}`;
    setExpandedCategories(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleDocumentSelect = (path) => {
    if (readOnly) return;
    
    if (selectedDocs.includes(path)) {
      onDocumentsSelect(selectedDocs.filter(doc => doc !== path));
    } else {
      onDocumentsSelect([...selectedDocs, path]);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <h2 className="text-xl font-semibold">Supporting Documents</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(vendorStructure).map(([vendor, categories]) => (
          <div key={vendor} className="border rounded-lg">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
              onClick={() => toggleVendor(vendor)}
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-blue-500" />
                <span className="font-medium">{vendor}</span>
              </div>
              {expandedVendors[vendor] ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </Button>

            {expandedVendors[vendor] && (
              <div className="pl-4 pr-2 pb-2">
                {Object.entries(categories).map(([category, documents]) => (
                  <div key={`${vendor}-${category}`} className="border-l">
                    <Button
                      variant="ghost"
                      className="w-full flex items-center justify-between p-2 hover:bg-gray-50"
                      onClick={() => toggleCategory(vendor, category)}
                    >
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-yellow-500" />
                        <span>{category}</span>
                      </div>
                      {expandedCategories[`${vendor}-${category}`] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>

                    {expandedCategories[`${vendor}-${category}`] && (
                      <div className="pl-8 pr-2 pb-2">
                        {documents.map(doc => {
                          const path = `${vendor}/${category}/${doc}`;
                          return (
                            <div
                              key={path}
                              className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                                selectedDocs.includes(path)
                                  ? 'bg-blue-50'
                                  : 'hover:bg-gray-50'
                              }`}
                              onClick={() => handleDocumentSelect(path)}
                            >
                              <input
                                type="checkbox"
                                checked={selectedDocs.includes(path)}
                                onChange={() => handleDocumentSelect(path)}
                                disabled={readOnly}
                                className="h-4 w-4"
                              />
                              <File className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">{doc}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default VendorDocumentsAccordion;