'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'size'> {
  label?: string;
  description?: string;
  onChange?: (checked: boolean) => void;
  size?: 'sm' | 'md';
}

const sizeConfig = {
  sm: { track: 'w-9 h-5', thumb: 'w-4 h-4', translate: 16 },
  md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 20 },
};

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, label, description, checked, onChange, size = 'md', id, ...props }, ref) => {
    const inputId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;
    const config = sizeConfig[size];

    return (
      <div className={cn('flex items-start gap-3', className)}>
        <div className="relative flex items-center">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
            className="sr-only"
            {...props}
          />
          <motion.button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => !props.disabled && onChange?.(!checked)}
            className={cn(
              config.track,
              'relative rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ecx-blue/20 focus:ring-offset-2',
              checked ? 'bg-ecx-blue' : 'bg-gray-300',
              props.disabled && 'opacity-50 cursor-not-allowed'
            )}
            whileTap={{ scale: props.disabled ? 1 : 0.95 }}
          >
            <motion.span
              className={cn(
                config.thumb,
                'absolute top-0.5 left-0.5 bg-white rounded-full shadow-md'
              )}
              animate={{ x: checked ? config.translate : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <label
                htmlFor={inputId}
                className="block text-body font-inter text-ecx-gray cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-body-sm text-gray-500 font-inter mt-0.5">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Toggle.displayName = 'Toggle';

