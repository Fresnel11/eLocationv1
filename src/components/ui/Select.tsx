import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            className={`
              flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
              transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50
              appearance-none pr-10
              ${error ? 'border-red-500 focus:ring-red-500' : ''}
              ${className || ''}
            `}
            ref={ref}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Select };