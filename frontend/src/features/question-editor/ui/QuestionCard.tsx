'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Question, QUESTION_TYPE_CONFIG, QuestionType } from '@/entities/question';
import { useFormStore } from '@/entities/form';
import {
  Card,
  Input,
  TextArea,
  Toggle,
  Select,
  Button,
  IconGripVertical,
  IconCopy,
  IconTrash,
  IconPlus,
  IconX,
} from '@/shared/ui';
import { cn } from '@/shared/lib';

interface QuestionCardProps {
  question: Question;
  isActive?: boolean;
  onSelect: () => void;
}

export function QuestionCard({ question, isActive, onSelect }: QuestionCardProps) {
  const { updateQuestion, removeQuestion, duplicateQuestion } = useFormStore();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const config = QUESTION_TYPE_CONFIG[question.type];

  const handleTypeChange = (newType: string) => {
    const newConfig = QUESTION_TYPE_CONFIG[newType as QuestionType];
    const updates: Partial<Question> = { type: newType as QuestionType };

    // Handle options based on question type
    if (newConfig.hasOptions && !question.options) {
      // Switching to a choice-based type - add default option
      updates.options = [{
        id: crypto.randomUUID(),
        value: 'Option 1',
        order: 0,
      }];
    } else if (!newConfig.hasOptions && question.options) {
      // Switching away from a choice-based type - remove options
      updates.options = undefined;
    }

    // Handle file config
    if (newConfig.hasFileConfig && !question.fileConfig) {
      updates.fileConfig = { maxSizeMB: 2, allowedTypes: ['image/*', 'application/pdf', '.doc', '.docx'] };
    } else if (!newConfig.hasFileConfig && question.fileConfig) {
      updates.fileConfig = undefined;
    }

    // Handle validation for number type
    if (newType === 'number' && !question.validation) {
      updates.validation = { rule: 'number', errorMessage: 'Please enter a valid number' };
    } else if (newType !== 'number' && question.validation?.rule === 'number') {
      updates.validation = undefined;
    }

    updateQuestion(question.id, updates);
  };

  const handleTitleChange = (title: string) => {
    updateQuestion(question.id, { title });
  };

  const handleRequiredChange = (required: boolean) => {
    updateQuestion(question.id, { required });
  };

  const handleAddOption = () => {
    if (!question.options) return;
    const newOption = {
      id: crypto.randomUUID(),
      value: `Option ${question.options.length + 1}`,
      order: question.options.length,
    };
    updateQuestion(question.id, {
      options: [...question.options, newOption],
    });
  };

  const handleUpdateOption = (optionId: string, value: string) => {
    if (!question.options) return;
    updateQuestion(question.id, {
      options: question.options.map((opt) =>
        opt.id === optionId ? { ...opt, value } : opt
      ),
    });
  };

  const handleRemoveOption = (optionId: string) => {
    if (!question.options || question.options.length <= 1) return;
    updateQuestion(question.id, {
      options: question.options
        .filter((opt) => opt.id !== optionId)
        .map((opt, index) => ({ ...opt, order: index })),
    });
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'group relative',
        isDragging && 'z-50'
      )}
    >
      <Card
        variant={isActive ? 'elevated' : 'default'}
        padding="none"
        animate={false}
        className={cn(
          'transition-all duration-200 cursor-pointer',
          isActive && 'ring-2 ring-ecx-blue'
        )}
        onClick={onSelect}
      >
        {/* Drag Handle */}
        <div
          className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          {...attributes}
          {...listeners}
        >
          <IconGripVertical size={16} className="text-gray-400" />
        </div>

        {/* Left Border Indicator */}
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-1.5 rounded-l-card transition-colors',
            isActive ? 'bg-ecx-blue' : 'bg-transparent'
          )}
        />

        <div className="p-6 pl-8">
          {/* Question Type & Title Row */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 order-2 sm:order-1">
              <Input
                value={question.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Question"
                className="text-lg font-medium border-b-2 border-transparent hover:border-gray-200 focus:border-ecx-blue rounded-none px-0"
              />
            </div>
            <div className="w-full sm:w-48 order-1 sm:order-2">
              <Select
                value={question.type}
                onChange={handleTypeChange}
                options={Object.entries(QUESTION_TYPE_CONFIG).map(([value, conf]) => ({
                  value,
                  label: conf.label,
                }))}
              />
            </div>
          </div>

          {/* Description (optional) */}
          {isActive && (
            <Input
              value={question.description || ''}
              onChange={(e) =>
                updateQuestion(question.id, { description: e.target.value })
              }
              placeholder="Description (optional)"
              className="mb-4 text-body-sm text-gray-500"
            />
          )}

          {/* Options for choice-based questions */}
          {config.hasOptions && question.options && (
            <div className="space-y-2 mb-4">
              {question.options.map((option, index) => (
                <div key={option.id} className="flex items-center gap-2">
                  {/* Option indicator */}
                  <div className="w-5 h-5 flex items-center justify-center">
                    {question.type === 'multiple_choice' && (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                    )}
                    {question.type === 'checkbox' && (
                      <div className="w-4 h-4 rounded border-2 border-gray-300" />
                    )}
                    {question.type === 'dropdown' && (
                      <span className="text-body-sm text-gray-400">{index + 1}.</span>
                    )}
                  </div>
                  <Input
                    value={option.value}
                    onChange={(e) => handleUpdateOption(option.id, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1"
                  />
                  {question.options!.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveOption(option.id);
                      }}
                      className="p-1 text-gray-400 hover:text-ecx-red transition-colors"
                    >
                      <IconX size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddOption();
                }}
                className="flex items-center gap-2 text-ecx-blue hover:text-ecx-blue-600 text-body-sm font-medium"
              >
                <IconPlus size={16} />
                Add option
              </button>
            </div>
          )}

          {/* Preview for text inputs */}
          {question.type === 'short_text' && (
            <div className="border-b border-dashed border-gray-300 py-2 text-gray-400 text-body-sm">
              Short answer text
            </div>
          )}
          {question.type === 'long_text' && (
            <div className="border-b border-dashed border-gray-300 py-2 text-gray-400 text-body-sm h-16">
              Long answer text
            </div>
          )}
          {question.type === 'number' && (
            <div className="border-b border-dashed border-gray-300 py-2 text-gray-400 text-body-sm">
              Number
            </div>
          )}
          {question.type === 'file_upload' && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <p className="text-gray-400 text-body-sm">File upload (max 2MB)</p>
            </div>
          )}

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateQuestion(question.id);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Duplicate"
              >
                <IconCopy size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeQuestion(question.id);
                }}
                className="p-2 text-gray-400 hover:text-ecx-red hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <IconTrash size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-body-sm text-gray-500">Required</span>
              <Toggle
                checked={question.required}
                onChange={handleRequiredChange}
                size="sm"
              />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

