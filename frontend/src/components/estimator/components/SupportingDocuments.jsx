 
// components/SupportingDocuments.jsx
import React from 'react';

export const SupportingDocuments = ({ selectedDocs, onDocSelect }) => {
  const availableDocs = {
    datasheets: {
      plexipaveInstallation: {
        name: 'Plexipave Installation Guide (Field Mix for Concrete)',
        url: '/documents/datasheets/Plexipave-Installation-Guide-Field-Mix-for-concrete.pdf'
      }
    },
    technicalDocuments: {
      cssAcrylic: {
        name: 'CSS Acrylic Resurfacer Technical Data Sheet',
        url: '/documents/technical-documents/CSS-Acrylic-Resurfacer-4200-TDS.pdf'
      }
    },
    brochures: {
      plexipaveHardcourt: {
        name: 'Plexipave Hardcourt System Brochure',
        url: '/documents/brochures/Plexipave-Hardcourt-cut-sheet_10.23.pdf'
      }
    }
  };

  return (
    <div className="mt-6 bg-gray-50 p-4 rounded">
      <h3 className="font-medium mb-4">Supporting Documents</h3>

      {/* Technical Data Sheets */}
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">Technical Data Sheets</h4>
        <div className="space-y-2">
          {Object.entries(availableDocs.datasheets).map(([key, doc]) => (
            <label key={key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedDocs.includes(doc.url)}
                onChange={(e) => onDocSelect(doc.url, e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">{doc.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Technical Documents */}
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">Technical Documents</h4>
        <div className="space-y-2">
          {Object.entries(availableDocs.technicalDocuments).map(([key, doc]) => (
            <label key={key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedDocs.includes(doc.url)}
                onChange={(e) => onDocSelect(doc.url, e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">{doc.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brochures */}
      <div>
        <h4 className="text-sm font-medium mb-2">Brochures</h4>
        <div className="space-y-2">
          {Object.entries(availableDocs.brochures).map(([key, doc]) => (
            <label key={key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedDocs.includes(doc.url)}
                onChange={(e) => onDocSelect(doc.url, e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">{doc.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupportingDocuments;
