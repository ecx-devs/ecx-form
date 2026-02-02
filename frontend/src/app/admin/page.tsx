'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useFormList } from '@/entities/form';
import { FormCard, EmptyFormList } from '@/widgets/form-list';
import { Navbar } from '@/widgets/layout';
import { Button, IconPlus, SkeletonFormGrid } from '@/shared/ui';

export default function AdminDashboardPage() {
  const { data: forms, isLoading, error } = useFormList();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-heading-1 font-varela text-ecx-black">My Forms</h1>
            <p className="text-body text-gray-600 mt-2">
              Create and manage your forms. View responses and export data.
            </p>
          </div>

          {/* Loading State - Skeleton */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Create New Card Placeholder */}
              <div className="h-full min-h-[240px] border-2 border-dashed border-gray-200 rounded-card flex flex-col items-center justify-center gap-4 bg-gray-50">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
              <SkeletonFormGrid count={3} className="contents" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-20">
              <p className="text-ecx-red mb-4">Failed to load forms</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try again
              </Button>
            </div>
          )}

          {/* Forms Grid */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Create New Card */}
              <Link href="/admin/forms/new">
                <motion.div
                  whileHover={{ y: -4 }}
                  className="h-full min-h-[240px] border-2 border-dashed border-gray-300 rounded-card flex flex-col items-center justify-center gap-4 hover:border-ecx-blue hover:bg-ecx-blue-50 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 bg-ecx-blue-100 rounded-full flex items-center justify-center">
                    <IconPlus size={24} className="text-ecx-blue" />
                  </div>
                  <span className="text-body font-medium text-gray-600">
                    Create new form
                  </span>
                </motion.div>
              </Link>

              {/* Form Cards */}
              {forms?.map((form) => (
                <FormCard key={form.id} form={form} />
              ))}

              {/* Empty State */}
              {forms?.length === 0 && <EmptyFormList />}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
