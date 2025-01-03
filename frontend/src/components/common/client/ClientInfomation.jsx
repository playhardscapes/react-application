 
// src/components/client/ClientInformation.jsx
import React, { useState } from 'react';
import { FormInput, PhoneInput, EmailInput } from '../common/FormInput';

const ClientInformation = ({ data, onChange }) => {
  const [errors, setErrors] = useState({});

  const validate = (fieldName, value) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Name is required';
        } else {
          delete newErrors.name;
        }
        break;
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Invalid email format';
        } else {
          delete newErrors.email;
        }
        break;
      case 'phone':
        if (!value.trim()) {
          newErrors.phone = 'Phone is required';
        } else if (!/^\(\d{3}\) \d{3}-\d{4}$/.test(value)) {
          newErrors.phone = 'Invalid phone format';
        } else {
          delete newErrors.phone;
        }
        break;
      case 'projectLocation':
        if (!value.trim()) {
          newErrors.projectLocation = 'Project location is required';
        } else {
          delete newErrors.projectLocation;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    const isValid = validate(field, value);
    onChange({
      ...data,
      [field]: value,
      isValid // Add validation status to the data
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Client Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Client Name"
          value={data.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          required
          error={errors.name}
          placeholder="Full Name"
        />

        <EmailInput
          value={data.email || ''}
          onChange={(value) => handleChange('email', value)}
          required
          error={errors.email}
        />

        <PhoneInput
          value={data.phone || ''}
          onChange={(value) => handleChange('phone', value)}
          required
          error={errors.phone}
        />

        <FormInput
          label="Project Location"
          value={data.projectLocation || ''}
          onChange={(e) => handleChange('projectLocation', e.target.value)}
          required
          error={errors.projectLocation}
          placeholder="City, State"
        />

        <div className="md:col-span-2">
          <FormInput
            label="Additional Notes"
            value={data.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Important details, special requirements..."
            type="textarea"
          />
        </div>
      </div>

      {/* Visual feedback for validation */}
      {Object.keys(errors).length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600 text-sm">Please fix the following errors:</p>
          <ul className="list-disc list-inside">
            {Object.values(errors).map((error, index) => (
              <li key={index} className="text-red-600 text-sm">{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ClientInformation;
