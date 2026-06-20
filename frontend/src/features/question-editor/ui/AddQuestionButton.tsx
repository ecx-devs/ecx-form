'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionType, QUESTION_TYPE_CONFIG, createQuestion } from '@/entities/question';
import { useFormStore } from '@/entities/form';
import {
  IconPlus,
  IconShortText,
  IconLongText,
  IconNumber,
  IconRadio,
  IconCheckbox,
  IconDropdown,
  IconFile,
  IconSection,
} from '@/shared/ui';
import { cn } from '@/shared/lib';

const QUESTION_TYPE_ICONS: Record<QuestionType, React.ComponentType<{ size?: number; className?: string }>> = {
  section: IconSection,
  short_text: IconShortText,
  long_text: IconLongText,
  number: IconNumber,
  multiple_choice: IconRadio,
  checkbox: IconCheckbox,
  dropdown: IconDropdown,
  file_upload: IconFile,
};

interface AddQuestionButtonProps {
  className?: string;
}

export function AddQuestionButton({ className }: AddQuestionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { currentForm, addQuestion } = useFormStore();

  const handleAddQuestion = (type: QuestionType) => {
    const order = currentForm?.questions.length || 0;
    const question = createQuestion(type, order);
    addQuestion(question);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-4 px-6 rounded-lg border-2 border-dashed transition-colors',
          isOpen
            ? 'border-ecx-blue bg-ecx-blue-50 text-ecx-blue'
            : 'border-gray-300 hover:border-ecx-blue hover:bg-gray-50 text-gray-500'
        )}
      >
        <IconPlus size={20} />
        <span className="font-medium">Add item</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-dropdown border border-gray-200 overflow-hidden z-20"
            >
              <div className="p-2">
                <p className="px-3 py-2 text-body-sm font-medium text-gray-500">
                  Form items
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {Object.entries(QUESTION_TYPE_CONFIG).map(([type, config]) => {
                    const Icon = QUESTION_TYPE_ICONS[type as QuestionType];
                    return (
                      <button
                        key={type}
                        onClick={() => handleAddQuestion(type as QuestionType)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-left"
                      >
                        <Icon size={20} className="text-ecx-blue" />
                        <div>
                          <p className="text-body-sm font-medium text-ecx-gray">
                            {config.label}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

