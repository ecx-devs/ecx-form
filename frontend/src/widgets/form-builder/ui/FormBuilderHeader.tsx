'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useFormStore, useUpdateForm, usePublishForm } from '@/entities/form';
import { useAuthStore, useLogout } from '@/entities/auth';
import { ShareModal, PublishSuccessModal } from '@/widgets/modals';
import {
  Logo,
  Button,
  Input,
  IconEye,
  IconShare,
  IconChevronLeft,
  IconMenu,
  IconX,
  Spinner,
} from '@/shared/ui';
import { cn } from '@/shared/lib';
import { APP_URL } from '@/shared/config/constants';

export function FormBuilderHeader() {
  const router = useRouter();
  const { currentForm, isSaving, updateCurrentForm } = useFormStore();
  const { admin } = useAuthStore();
  const logoutMutation = useLogout();
  const updateFormMutation = useUpdateForm();
  const publishMutation = usePublishForm();

  const [title, setTitle] = useState(currentForm?.title || '');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPublishSuccessModal, setShowPublishSuccessModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync title with form
  useEffect(() => {
    if (currentForm?.title) {
      setTitle(currentForm.title);
    }
  }, [currentForm?.title]);

  // Debounced auto-save for title
  useEffect(() => {
    if (!currentForm || title === currentForm.title) return;

    const timeoutId = setTimeout(() => {
      updateCurrentForm({ title });
      updateFormMutation.mutate({
        id: currentForm.id,
        input: {
          title,
          description: currentForm.description,
          questions: currentForm.questions,
          settings: currentForm.settings,
        },
      });
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [title]);

  const handlePublish = () => {
    if (!currentForm) return;
    
    publishMutation.mutate(currentForm.id, {
      onSuccess: () => {
        setShowPublishSuccessModal(true);
      },
    });
  };

  const handlePreview = () => {
    if (!currentForm) return;
    // Open admin preview - works for both draft and published forms
    const previewUrl = `/admin/forms/${currentForm.id}/preview`;
    window.open(previewUrl, '_blank');
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  if (!currentForm) return null;

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left: Back & Logo */}
            <div className="flex items-center gap-2 min-w-0">
              <Link
                href="/admin"
                className="p-2 text-gray-500 hover:text-ecx-blue hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IconChevronLeft size={20} />
              </Link>
              <div className="hidden sm:block">
                <Logo size="sm" href="/admin" showText={false} />
              </div>
              <div className="h-6 w-px bg-gray-200 hidden sm:block" />
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled Form"
                className="text-base sm:text-lg font-medium border-none hover:bg-gray-50 focus:bg-gray-50 min-w-0 w-full max-w-[200px] sm:max-w-[300px]"
              />
              {/* Save indicator - Desktop */}
              <div className="hidden sm:flex items-center gap-2 text-body-sm">
                {isSaving ? (
                  <>
                    <Spinner size="sm" />
                    <span className="text-gray-400">Saving...</span>
                  </>
                ) : (
                  <span className="text-green-500">✓ Saved</span>
                )}
              </div>
            </div>

            {/* Right: Actions - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              {/* Preview */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePreview}
                leftIcon={<IconEye size={18} />}
              >
                Preview
              </Button>

              {/* Status & Publish/Share */}
              {currentForm.status === 'draft' ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handlePublish}
                  isLoading={publishMutation.isPending}
                  disabled={currentForm.questions.length === 0}
                >
                  Publish
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-body-sm font-medium rounded">
                    Live
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    leftIcon={<IconShare size={18} />}
                  >
                    Share
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-ecx-blue hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <IconX size={24} /> : <IconMenu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-100 py-4 space-y-3"
            >
              {/* Save Status */}
              <div className="flex items-center justify-center gap-2 text-body-sm pb-3 border-b border-gray-100">
                {isSaving ? (
                  <>
                    <Spinner size="sm" />
                    <span className="text-gray-400">Saving...</span>
                  </>
                ) : (
                  <span className="text-green-500">✓ All changes saved</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => {
                    handlePreview();
                    setIsMobileMenuOpen(false);
                  }}
                  leftIcon={<IconEye size={18} />}
                >
                  Preview Form
                </Button>

                {currentForm.status === 'draft' ? (
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => {
                      handlePublish();
                      setIsMobileMenuOpen(false);
                    }}
                    isLoading={publishMutation.isPending}
                    disabled={currentForm.questions.length === 0}
                  >
                    Publish Form
                  </Button>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-2 py-2">
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-body-sm font-medium rounded">
                        Form is Live
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => {
                        handleShare();
                        setIsMobileMenuOpen(false);
                      }}
                      leftIcon={<IconShare size={18} />}
                    >
                      Share Form
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        formId={currentForm.id}
        formTitle={currentForm.title}
      />

      {/* Publish Success Modal */}
      <PublishSuccessModal
        isOpen={showPublishSuccessModal}
        onClose={() => setShowPublishSuccessModal(false)}
        formId={currentForm.id}
        formTitle={currentForm.title}
      />
    </>
  );
}
