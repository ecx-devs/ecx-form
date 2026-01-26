'use client';

import Link from 'next/link';
import { cn } from '../../lib/cn';

interface LogoProps {
  variant?: 'light' | 'dark' | 'colored';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  href?: string;
}

const sizeConfig = {
  sm: { height: 24, textClass: 'text-sm' },
  md: { height: 32, textClass: 'text-base' },
  lg: { height: 40, textClass: 'text-lg' },
};

export function Logo({
  variant = 'colored',
  size = 'md',
  showText = true,
  className,
  href = '/',
}: LogoProps) {
  const config = sizeConfig[size];

  const LogoContent = () => (
    <div className={cn('flex items-center gap-2', className)}>
      {/* ECX Letters */}
      <svg
        height={config.height}
        viewBox="0 0 100 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* E */}
        <text
          x="0"
          y="26"
          fontFamily="Arial, sans-serif"
          fontSize="28"
          fontWeight="bold"
          fill={variant === 'dark' ? '#ffffff' : '#2699e3'}
        >
          E
        </text>
        {/* C */}
        <text
          x="22"
          y="26"
          fontFamily="Arial, sans-serif"
          fontSize="28"
          fontWeight="bold"
          fill={variant === 'dark' ? '#ffffff' : '#fab12d'}
        >
          C
        </text>
        {/* X */}
        <text
          x="48"
          y="26"
          fontFamily="Arial, sans-serif"
          fontSize="28"
          fontWeight="bold"
          fill={variant === 'dark' ? '#ffffff' : '#f2443f'}
        >
          X
        </text>
      </svg>

      {showText && (
        <span
          className={cn(
            'font-inter font-medium',
            config.textClass,
            variant === 'dark' ? 'text-white' : 'text-ecx-gray'
          )}
        >
          Forms
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
}

