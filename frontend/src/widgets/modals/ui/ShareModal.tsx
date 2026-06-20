'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Modal, ModalFooter, Button, Input, QRCode, IconLink, IconCopy, IconCheck } from '@/shared/ui';
import { APP_URL } from '@/shared/config/constants';
import toast from 'react-hot-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  formId: string;
  formTitle: string;
}

export function ShareModal({ isOpen, onClose, formId, formTitle }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const appOrigin =
    typeof window !== 'undefined' ? window.location.origin : APP_URL;
  const formUrl = `${appOrigin.replace(/\/$/, '')}/${formId}`;

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share your form"
      description={`Share "${formTitle}" with your audience`}
      size="md"
    >
      <div className="space-y-6">
        {/* QR Code */}
        <div className="flex justify-center py-4 bg-gradient-to-br from-ecx-blue-50 via-white to-ecx-yellow-50 rounded-xl">
          <QRCode 
            value={formUrl} 
            size={180}
            fgColor="#1a1a1a"
            showDownload={true}
          />
        </div>

        {/* Instructions */}
        <p className="text-body-sm text-center text-gray-500">
          Scan this QR code or share the link below
        </p>

        {/* Link Input */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              value={formUrl}
              readOnly
              leftIcon={<IconLink size={18} />}
              className="bg-gray-50 font-mono text-sm"
            />
          </div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant={copied ? 'primary' : 'outline'}
              onClick={handleCopy}
              leftIcon={copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
              className="min-w-[100px]"
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </motion.div>
        </div>
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Done
        </Button>
      </ModalFooter>
    </Modal>
  );
}
