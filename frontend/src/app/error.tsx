'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Logo, Button, IconWarning } from '@/shared/ui';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-ecx-red-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <Logo size="lg" className="justify-center mb-8" href="/" />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="w-20 h-20 bg-ecx-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <IconWarning size={40} className="text-ecx-red" />
        </motion.div>

        <h1 className="text-heading-2 font-varela text-ecx-black mb-4">
          Something went wrong
        </h1>
        <p className="text-body text-gray-600 mb-8">
          We encountered an unexpected error. Please try again or contact support
          if the problem persists.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="primary" onClick={reset}>
            Try again
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = '/')}>
            Go home
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

