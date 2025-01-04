 
// src/components/estimator/sections/SupportingDocuments/index.jsx
import React from 'react';
import DocumentCategory from './DocumentCategory';
import { DOCUMENT_CATEGORIES } from './constants';

const SupportingDocuments = ({ selectedDocs, onDocSelect }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold">Supporting Documents</h3>
    {Object.entries(DOCUMENT_CATEGORIES).map(([category, docs]) => (
      <DocumentCategory
        key={category}
        title={category}
        documents={docs}
        selectedDocs={selectedDocs}
        onDocSelect={onDocSelect}
      />
    ))}
  </div>
);

// DocumentCategory.jsx
const DocumentCategory = ({ title, documents, selectedDocs, onDocSelect }) => (
  <div className="space-y-2">
    <h4 className="font-medium capitalize">{title}</h4>
    <div className="space-y-2">
      {Object.entries(documents).map(([key, doc]) => (
        <DocumentCheckbox
          key={key}
          document={doc}
          isSelected={selectedDocs.includes(doc.url)}
          onSelect={onDocSelect}
        />
      ))}
    </div>
  </div>
);

// DocumentCheckbox.jsx
const DocumentCheckbox = ({ document, isSelected, onSelect }) => (
  <label className="flex items-center space-x-2">
    <input
      type="checkbox"
      checked={isSelected}
      onChange={(e) => onSelect(document.url, e.target.checked)}
      className="rounded border-gray-300"
    />
    <span className="text-sm">{document.name}</span>
  </label>
);

// constants.js
export const DOCUMENT_CATEGORIES = {
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

export default SupportingDocuments;
