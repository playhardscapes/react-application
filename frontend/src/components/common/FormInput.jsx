 
// src/components/common/FormInput.jsx
import React from 'react';

const FormInput = ({
  label,
  type = 'text',
  value,
  onChange,
  name,
  placeholder,
  error,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full p-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

// src/components/common/NumberInput.jsx
const NumberInput = ({
  label,
  value,
  onChange,
  min = 0,
  step = 'any',
  required = false,
  error,
  ...props
}) => {
  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val === '' ? '' : parseFloat(val));
  };

  return (
    <FormInput
      type="number"
      label={label}
      value={value}
      onChange={handleChange}
      min={min}
      step={step}
      required={required}
      error={error}
      {...props}
    />
  );
};

// src/components/common/PhoneInput.jsx
const PhoneInput = ({ value, onChange, error, ...props }) => {
  const formatPhoneNumber = (input) => {
    const cleaned = input.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      const formatted = [
        match[1] && '(' + match[1],
        match[2] && ') ' + match[2],
        match[3] && '-' + match[3],
      ]
        .filter(Boolean)
        .join('');
      return formatted;
    }
    return input;
  };

  const handleChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    onChange(formatted);
  };

  return (
    <FormInput
      type="tel"
      label="Phone Number"
      value={value}
      onChange={handleChange}
      placeholder="(555) 555-5555"
      pattern="\\([0-9]{3}\\) [0-9]{3}-[0-9]{4}"
      error={error}
      {...props}
    />
  );
};

// src/components/common/EmailInput.jsx
const EmailInput = ({ value, onChange, error, ...props }) => {
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    // You can add validation here if needed
  };

  return (
    <FormInput
      type="email"
      label="Email Address"
      value={value}
      onChange={handleChange}
      placeholder="example@email.com"
      error={error || (value && !validateEmail(value) ? 'Please enter a valid email' : '')}
      {...props}
    />
  );
};

export { FormInput, NumberInput, PhoneInput, EmailInput };
