'use client';

import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';
import { Button } from '../Button';
import { IconDownload } from '../Icons';

interface QRCodeProps {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  showDownload?: boolean;
  className?: string;
}

export function QRCode({
  value,
  size = 160,
  bgColor = '#ffffff',
  fgColor = '#1a1a1a',
  level = 'M',
  includeMargin = true,
  showDownload = true,
  className,
}: QRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQRCode = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with padding
    const padding = 20;
    canvas.width = size + padding * 2;
    canvas.height = size + padding * 2;

    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Convert SVG to image
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, padding, padding, size, size);
      
      // Download
      const link = document.createElement('a');
      link.download = `ecx-form-qr-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <motion.div
        ref={qrRef}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="p-4 bg-white rounded-xl shadow-sm border border-gray-100"
      >
        <QRCodeSVG
          value={value}
          size={size}
          bgColor={bgColor}
          fgColor={fgColor}
          level={level}
          includeMargin={includeMargin}
        />
      </motion.div>
      
      {showDownload && (
        <Button
          variant="ghost"
          size="sm"
          onClick={downloadQRCode}
          leftIcon={<IconDownload size={16} />}
        >
          Download QR Code
        </Button>
      )}
    </div>
  );
}

