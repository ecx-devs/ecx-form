'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Logo, Button } from '@/shared/ui';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-ecx-blue-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <Logo size="lg" className="justify-center mb-8" href="/" />

        {/* 404 Number */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="flex justify-center items-baseline text-8xl font-bold mb-6"
        >
          <span className="text-ecx-blue">4</span>
          <span className="text-ecx-yellow">0</span>
          <span className="text-ecx-red">4</span>
        </motion.div>

        <h1 className="text-heading-2 font-varela text-ecx-black mb-4">
          Page not found
        </h1>
        <p className="text-body text-gray-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button variant="primary">Go home</Button>
          </Link>
          <Link href="/admin">
            <Button variant="outline">Dashboard</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

