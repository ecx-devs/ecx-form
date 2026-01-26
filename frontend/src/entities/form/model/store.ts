import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Form, FormListItem, FormSettings, UpdateFormInput } from './types';
import { Question } from '../../question';

interface FormState {
  // Current form being edited
  currentForm: Form | null;
  
  // List of all forms
  forms: FormListItem[];
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  
  // Error state
  error: string | null;
  
  // Actions
  setCurrentForm: (form: Form | null) => void;
  setForms: (forms: FormListItem[]) => void;
  updateCurrentForm: (updates: UpdateFormInput) => void;
  
  // Question management
  addQuestion: (question: Question) => void;
  updateQuestion: (questionId: string, updates: Partial<Question>) => void;
  removeQuestion: (questionId: string) => void;
  reorderQuestions: (startIndex: number, endIndex: number) => void;
  duplicateQuestion: (questionId: string) => void;
  
  // Settings management
  updateSettings: (settings: Partial<FormSettings>) => void;
  
  // State management
  setLoading: (isLoading: boolean) => void;
  setSaving: (isSaving: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  currentForm: null,
  forms: [],
  isLoading: false,
  isSaving: false,
  error: null,
};

export const useFormStore = create<FormState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setCurrentForm: (form) => set({ currentForm: form }),

      setForms: (forms) => set({ forms }),

      updateCurrentForm: (updates) => {
        const { currentForm } = get();
        if (!currentForm) return;

        set({
          currentForm: {
            ...currentForm,
            ...(updates.title !== undefined && { title: updates.title }),
            ...(updates.description !== undefined && { description: updates.description }),
            ...(updates.questions !== undefined && { questions: updates.questions }),
            ...(updates.settings !== undefined && { 
              settings: { ...currentForm.settings, ...updates.settings } 
            }),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      addQuestion: (question) => {
        const { currentForm } = get();
        if (!currentForm) return;

        set({
          currentForm: {
            ...currentForm,
            questions: [...currentForm.questions, question],
            updatedAt: new Date().toISOString(),
          },
        });
      },

      updateQuestion: (questionId, updates) => {
        const { currentForm } = get();
        if (!currentForm) return;

        set({
          currentForm: {
            ...currentForm,
            questions: currentForm.questions.map((q) =>
              q.id === questionId ? { ...q, ...updates } : q
            ),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      removeQuestion: (questionId) => {
        const { currentForm } = get();
        if (!currentForm) return;

        set({
          currentForm: {
            ...currentForm,
            questions: currentForm.questions
              .filter((q) => q.id !== questionId)
              .map((q, index) => ({ ...q, order: index })),
            updatedAt: new Date().toISOString(),
          },
        });
      },

      reorderQuestions: (startIndex, endIndex) => {
        const { currentForm } = get();
        if (!currentForm) return;

        const questions = [...currentForm.questions];
        const [removed] = questions.splice(startIndex, 1);
        questions.splice(endIndex, 0, removed);

        // Update order property
        const reordered = questions.map((q, index) => ({ ...q, order: index }));

        set({
          currentForm: {
            ...currentForm,
            questions: reordered,
            updatedAt: new Date().toISOString(),
          },
        });
      },

      duplicateQuestion: (questionId) => {
        const { currentForm } = get();
        if (!currentForm) return;

        const questionToDuplicate = currentForm.questions.find(
          (q) => q.id === questionId
        );
        if (!questionToDuplicate) return;

        const index = currentForm.questions.findIndex((q) => q.id === questionId);
        const duplicated: Question = {
          ...questionToDuplicate,
          id: crypto.randomUUID(),
          order: index + 1,
        };

        const questions = [...currentForm.questions];
        questions.splice(index + 1, 0, duplicated);

        // Update order for all questions after the duplicated one
        const reordered = questions.map((q, i) => ({ ...q, order: i }));

        set({
          currentForm: {
            ...currentForm,
            questions: reordered,
            updatedAt: new Date().toISOString(),
          },
        });
      },

      updateSettings: (settings) => {
        const { currentForm } = get();
        if (!currentForm) return;

        set({
          currentForm: {
            ...currentForm,
            settings: { ...currentForm.settings, ...settings },
            updatedAt: new Date().toISOString(),
          },
        });
      },

      setLoading: (isLoading) => set({ isLoading }),

      setSaving: (isSaving) => set({ isSaving }),

      setError: (error) => set({ error }),

      reset: () => set(initialState),
    }),
    { name: 'form-store' }
  )
);

