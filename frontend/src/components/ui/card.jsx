 
// src/components/ui/card.jsx
export const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 border-b ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

// src/components/ui/number-input.jsx
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

// src/components/ui/select.jsx
export const Select = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
  error,
  className = ''
}) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
    )}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`
        w-full p-2 border rounded shadow-sm
        ${error ? 'border-red-500' : 'border-gray-300'}
        ${className}
      `}
    >
      <option value="">{placeholder}</option>
      {options.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
    {error && (
      <p className="text-sm text-red-500">{error}</p>
    )}
  </div>
);

// src/components/ui/textarea.jsx
export const Textarea = ({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
  error,
  className = ''
}) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
    )}
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className={`
        w-full p-2 border rounded shadow-sm
        ${error ? 'border-red-500' : 'border-gray-300'}
        ${className}
      `}
    />
    {error && (
      <p className="text-sm text-red-500">{error}</p>
    )}
  </div>
);

// src/components/ui/checkbox.jsx
export const Checkbox = ({
  label,
  checked,
  onChange,
  className = ''
}) => (
  <label className={`flex items-center space-x-2 ${className}`}>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="rounded border-gray-300"
    />
    <span className="text-sm">{label}</span>
  </label>
);

// src/components/ui/button.jsx
export const Button = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = ''
}) => {
  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 rounded shadow-sm
        ${variants[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
};
