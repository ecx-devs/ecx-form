'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string;
  description?: string;
  error?: string;
  onChange?: (value: string) => void;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, error, checked, value, onChange, name, id, ...props }, ref) => {
    const inputId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn('flex items-start gap-3', className)}>
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            id={inputId}
            type="radio"
            name={name}
            value={value}
            checked={checked}
            onChange={(e) => onChange?.(e.target.value)}
            className="sr-only peer"
            {...props}
          />
          <motion.div
            className={cn(
              'w-5 h-5 border-2 rounded-full transition-colors cursor-pointer flex items-center justify-center',
              'peer-focus:ring-2 peer-focus:ring-ecx-blue/20 peer-focus:ring-offset-1',
              'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
              checked
                ? 'border-ecx-blue'
                : error
                ? 'border-ecx-red'
                : 'border-gray-300 hover:border-gray-400'
            )}
            whileTap={{ scale: 0.95 }}
            onClick={() => !props.disabled && value && onChange?.(value.toString())}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: checked ? 1 : 0 }}
              className="w-2.5 h-2.5 bg-ecx-blue rounded-full"
            />
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

Radio.displayName = 'Radio';

// Radio Group
interface RadioGroupProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Array<{ value: string; label: string; description?: string; disabled?: boolean }>;
  error?: string;
  direction?: 'vertical' | 'horizontal';
  className?: string;
}

export const RadioGroup = ({
  name,
  value,
  onChange,
  options,
  error,
  direction = 'vertical',
  className,
}: RadioGroupProps) => {
  return (
    <div
      className={cn(
        'flex gap-3',
        direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        className
      )}
    >
      {options.map((option) => (
        <Radio
          key={option.value}
          name={name}
          value={option.value}
          label={option.label}
          description={option.description}
          checked={value === option.value}
          onChange={onChange}
          disabled={option.disabled}
          error={value === option.value ? error : undefined}
        />
      ))}
    </div>
  );
};

