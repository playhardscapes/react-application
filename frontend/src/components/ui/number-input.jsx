 
// src/components/ui/number-input.jsx
import React from 'react';

export const NumberInput = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 'any',
  prefix,
  disabled = false,
  helperText,
  error,
  className = ''
}) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
    )}
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.valueAsNumber || 0)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={`
          w-full p-2 border rounded shadow-sm
          ${prefix ? 'pl-7' : ''}
          ${disabled ? 'bg-gray-100' : ''}
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
      />
    </div>
    {helperText && !error && (
      <p className="text-sm text-gray-500">{helperText}</p>
    )}
    {error && (
      <p className="text-sm text-red-500">{error}</p>
    )}
  </div>
);

export default NumberInput;
