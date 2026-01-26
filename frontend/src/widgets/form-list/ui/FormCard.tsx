'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FormListItem } from '@/entities/form';
import { Card, IconFormList, IconMoreVertical, Button } from '@/shared/ui';
import { cn } from '@/shared/lib';

interface FormCardProps {
  form: FormListItem;
  onDelete?: () => void;
}

export function FormCard({ form, onDelete }: FormCardProps) {
  const formattedDate = new Date(form.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
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
    </motion.div>
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

