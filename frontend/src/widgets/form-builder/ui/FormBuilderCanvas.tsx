'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { AnimatePresence } from 'framer-motion';
import { useFormStore, useUpdateForm } from '@/entities/form';
import { QuestionCard, AddQuestionButton } from '@/features/question-editor';
import { Card, Input, TextArea } from '@/shared/ui';

export function FormBuilderCanvas() {
  const { currentForm, updateCurrentForm, reorderQuestions } = useFormStore();
  const updateFormMutation = useUpdateForm();
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Auto-save on form changes (debounced)
  useEffect(() => {
    if (!currentForm) return;

    const timeoutId = setTimeout(() => {
      updateFormMutation.mutate({
        id: currentForm.id,
        input: {
          title: currentForm.title,
          description: currentForm.description,
          questions: currentForm.questions,
          settings: currentForm.settings,
        },
      });
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [currentForm?.title, currentForm?.description, currentForm?.questions, currentForm?.settings]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && currentForm) {
      const oldIndex = currentForm.questions.findIndex(
        (q) => q.id === active.id
      );
      const newIndex = currentForm.questions.findIndex((q) => q.id === over.id);
      reorderQuestions(oldIndex, newIndex);
    }
  };

  if (!currentForm) return null;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Form Header Card */}
      <Card className="mb-4 border-t-8 border-t-ecx-blue">
        <Input
          value={currentForm.title}
          onChange={(e) => updateCurrentForm({ title: e.target.value })}
          placeholder="Form title"
          className="text-heading-2 font-varela border-none px-0 mb-2"
        />
        <TextArea
          value={currentForm.description || ''}
          onChange={(e) => updateCurrentForm({ description: e.target.value })}
          placeholder="Form description"
          className="border-none px-0 resize-none min-h-[60px]"
        />
      </Card>

      {/* Questions */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={currentForm.questions.map((q) => q.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {currentForm.questions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  isActive={activeQuestionId === question.id}
                  onSelect={() => setActiveQuestionId(question.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>
      </DndContext>

      {/* Add Question Button */}
      <div className="mt-4">
        <AddQuestionButton />
      </div>
    </div>
  );
}

