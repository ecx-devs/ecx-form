'use client';

import { forwardRef, TextareaHTMLAttributes, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/cn';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  showCount?: boolean;
  maxLength?: number;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className,
      label,
      error,
      hint,
      showCount = false,
      maxLength,
      id,
      value,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-body-sm font-inter font-medium text-ecx-gray mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            id={inputId}
            value={value}
            maxLength={maxLength}
            className={cn(
              'w-full min-h-[120px] px-4 py-3 text-body font-inter rounded-lg border bg-white transition-all duration-200 resize-y',
              'placeholder:text-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-ecx-blue/20',
              'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
              isFocused && !error
                ? 'border-ecx-blue'
                : error
                ? 'border-ecx-red focus:ring-ecx-red/20'
                : 'border-gray-300 hover:border-gray-400',
              className
            )}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
        </div>
        <div className="flex justify-between items-center mt-1.5">
          <AnimatePresence mode="wait">
            {error ? (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-body-sm text-ecx-red font-inter"
              >
                {error}
              </motion.p>
            ) : hint ? (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-body-sm text-gray-500 font-inter"
              >
                {hint}
              </motion.p>
            ) : (
              <span />
            )}
          </AnimatePresence>
          {showCount && maxLength && (
            <span
              className={cn(
                'text-caption font-inter',
                currentLength >= maxLength ? 'text-ecx-red' : 'text-gray-400'
              )}
            >
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

