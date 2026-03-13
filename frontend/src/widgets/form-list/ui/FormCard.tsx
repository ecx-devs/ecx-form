'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FormListItem } from '@/entities/form';
import { Card, Button, IconFormList, IconMoreVertical, IconTrash } from '@/shared/ui';
import { cn } from '@/shared/lib';

interface FormCardProps {
  form: FormListItem;
  onRemove?: (formId: string) => void;
}

export function FormCard({ form, onRemove }: FormCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const formattedDate = new Date(form.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleRemove = () => {
    setMenuOpen(false);
    setShowConfirm(true);
  };

  const confirmRemove = () => {
    onRemove?.(form.id);
    setShowConfirm(false);
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="relative"
      >
        <Link href={`/admin/forms/${form.id}`}>
          <Card hover className="h-full">
            {/* Preview Area */}
            <div className="h-32 bg-gradient-to-br from-ecx-blue-50 to-ecx-yellow-50 rounded-t-card -m-6 mb-4 flex items-center justify-center">
              <IconFormList size={48} className="text-ecx-blue opacity-50" />
            </div>

            {/* Content */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-body font-medium text-ecx-black truncate">
                  {form.title || 'Untitled Form'}
                </h3>
                <p className="text-body-sm text-gray-500 mt-1">
                  {form.questionCount} question{form.questionCount !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Status Badge */}
              <span
                className={cn(
                  'px-2 py-0.5 text-caption font-medium rounded',
                  form.status === 'published'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                {form.status === 'published' ? 'Live' : 'Draft'}
              </span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <span className="text-caption text-gray-400">
                Edited {formattedDate}
              </span>
            </div>
          </Card>
        </Link>

        {/* Three-dot menu button */}
        <div ref={menuRef} className="absolute top-2 right-2 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            className="p-1.5 rounded-full bg-white/80 backdrop-blur-sm text-gray-500 hover:text-ecx-red hover:bg-white shadow-sm transition-colors"
            aria-label="Form actions"
          >
            <IconMoreVertical size={18} />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemove();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-body-sm text-ecx-red hover:bg-red-50 transition-colors"
              >
                <IconTrash size={16} />
                Remove
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Confirm Dialog */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowConfirm(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-heading-4 font-varela text-ecx-black mb-2">
              Remove form?
            </h3>
            <p className="text-body-sm text-gray-600 mb-6">
              This will hide &quot;{form.title || 'Untitled Form'}&quot; from your dashboard. The form and its responses will still be preserved.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-body-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="px-4 py-2 text-body-sm font-medium text-white bg-ecx-red hover:bg-ecx-red-600 rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

// Empty State
export function EmptyFormList() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16">
      <div className="w-24 h-24 bg-ecx-blue-50 rounded-full flex items-center justify-center mb-6">
        <IconFormList size={48} className="text-ecx-blue" />
      </div>
      <h3 className="text-heading-4 font-varela text-ecx-black mb-2">
        No forms yet
      </h3>
      <p className="text-body text-gray-500 mb-6 text-center max-w-sm">
        Create your first form to start collecting responses from your audience.
      </p>
      <Link href="/admin/forms/new">
        <Button variant="primary">Create your first form</Button>
      </Link>
    </div>
  );
}

