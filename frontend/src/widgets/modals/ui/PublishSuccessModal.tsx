'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Modal, Button, Input, QRCode, IconLink, IconCopy, IconCheck, IconEye } from '@/shared/ui';
import { APP_URL } from '@/shared/config/constants';
import toast from 'react-hot-toast';

interface PublishSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  formId: string;
  formTitle: string;
}

export function PublishSuccessModal({ isOpen, onClose, formId, formTitle }: PublishSuccessModalProps) {
  const [copied, setCopied] = useState(false);
  const formUrl = `${APP_URL}/${formId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handlePreview = () => {
    window.open(formUrl, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      showCloseButton={false}
    >
      <div className="text-center">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="relative w-20 h-20 mx-auto mb-6"
        >
          {/* Outer ring */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-br from-ecx-blue via-ecx-teal to-green-400 rounded-full"
          />
          {/* Inner circle */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
            className="absolute inset-1 bg-white rounded-full flex items-center justify-center"
          >
            <motion.svg
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="w-10 h-10 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-heading-3 font-varela text-ecx-black mb-2">
            Form Published! 🎉
          </h2>
          <p className="text-body text-gray-600 mb-6">
            "{formTitle}" is now live and ready to collect responses.
          </p>
        </motion.div>

        {/* QR Code */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center py-4 mb-4 bg-gradient-to-br from-ecx-blue-50 via-white to-ecx-yellow-50 rounded-xl"
        >
          <QRCode 
            value={formUrl} 
            size={140}
            fgColor="#1a1a1a"
            showDownload={false}
          />
        </motion.div>

        {/* Shareable Link */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6"
        >
          <p className="text-body-sm font-medium text-gray-600 mb-2 text-left">
            Share this link:
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                value={formUrl}
                readOnly
                leftIcon={<IconLink size={18} />}
                className="bg-gray-50 font-mono text-sm"
              />
            </div>
            <Button
              variant={copied ? 'primary' : 'outline'}
              size="sm"
              onClick={handleCopy}
              leftIcon={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button
            variant="outline"
            fullWidth
            onClick={handlePreview}
            leftIcon={<IconEye size={18} />}
          >
            View Form
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={onClose}
          >
            Done
          </Button>
        </motion.div>
      </div>
    </Modal>
  );
}
