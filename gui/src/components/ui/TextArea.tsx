'use client';
import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

interface TextAreaProps extends Omit<HTMLMotionProps<"textarea">, "ref"> {
  label?: string;
  error?: string;
  helperText?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}
        <motion.textarea
          ref={ref}
          whileFocus={{ scale: 1.01 }}
          className={`
            w-full px-3 py-2 rounded-lg border min-h-[120px]
            ${error ? 'border-error-500' : 'border-neutral-200'}
            focus:outline-none focus:ring-2 focus:ring-primary-500/20
            ${className}
          `}
          {...props}
        />
        {(error || helperText) && (
          <p className={`text-sm ${error ? 'text-error-500' : 'text-neutral-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
export default TextArea; 