'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  description?: string;
  error?: string;
  onChange?: (checked: boolean) => void;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, checked, onChange, id, ...props }, ref) => {
    const inputId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn('flex items-start gap-3', className)}>
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
            className="sr-only peer"
            {...props}
          />
          <motion.div
            className={cn(
              'w-5 h-5 border-2 rounded transition-colors cursor-pointer',
              'peer-focus:ring-2 peer-focus:ring-ecx-blue/20 peer-focus:ring-offset-1',
              'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
              checked
                ? 'bg-ecx-blue border-ecx-blue'
                : error
                ? 'border-ecx-red'
                : 'border-gray-300 hover:border-gray-400'
            )}
            whileTap={{ scale: 0.95 }}
            onClick={() => !props.disabled && onChange?.(!checked)}
          >
            <motion.svg
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: checked ? 1 : 0,
                scale: checked ? 1 : 0.5,
              }}
              className="w-full h-full text-white p-0.5"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M3.5 8L6.5 11L12.5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </motion.div>
        </div>
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <label
                htmlFor={inputId}
                className={cn(
                  'block text-body font-inter cursor-pointer',
                  error ? 'text-ecx-red' : 'text-ecx-gray'
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-body-sm text-gray-500 font-inter mt-0.5">
                {description}
              </p>
            )}
            {error && (
              <p className="text-body-sm text-ecx-red font-inter mt-0.5">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

