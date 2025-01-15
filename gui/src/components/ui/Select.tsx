'use client';
import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

interface SelectProps extends Omit<HTMLMotionProps<"select">, "ref"> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}
        <motion.select
          ref={ref}
          whileFocus={{ scale: 1.01 }}
          className={`
            w-full px-3 py-2 rounded-lg border appearance-none
            ${error ? 'border-error-500' : 'border-neutral-200'}
            focus:outline-none focus:ring-2 focus:ring-primary-500/20
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </motion.select>
        {(error || helperText) && (
          <p className={`text-sm ${error ? 'text-error-500' : 'text-neutral-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select; 