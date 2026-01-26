'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question } from '@/entities/question';
import { Submission } from '@/entities/submission';
import { Button, Card, IconDownload, IconChevronLeft, IconChevronRight, SkeletonResponseSummary } from '@/shared/ui';
import { cn } from '@/shared/lib';

interface ResponsesViewProps {
  submissions: Submission[];
  questions: Question[];
  isLoading: boolean;
  onExport: (format: 'csv' | 'json') => void;
  isExporting: boolean;
}

type ViewTab = 'summary' | 'question' | 'individual';

export function ResponsesView({
  submissions,
  questions,
  isLoading,
  onExport,
  isExporting,
}: ResponsesViewProps) {
  const [activeTab, setActiveTab] = useState<ViewTab>('summary');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentSubmissionIndex, setCurrentSubmissionIndex] = useState(0);

  const totalResponses = submissions.length;

  // Group answers by question for summary view
  const answersByQuestion = useMemo(() => {
    const grouped: Record<string, { question: Question; answers: Array<{ value: any; submissionId: string }> }> = {};
    
    questions.forEach((q) => {
      grouped[q.id] = { question: q, answers: [] };
    });

    submissions.forEach((sub) => {
      sub.answers.forEach((answer) => {
        if (grouped[answer.questionId]) {
          grouped[answer.questionId].answers.push({
            value: answer.value,
            submissionId: sub.id,
          });
        }
      });
    });

    return Object.values(grouped);
  }, [questions, submissions]);

  if (isLoading) {
    return <SkeletonResponseSummary />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-heading-2 font-varela text-ecx-black">
            {totalResponses} response{totalResponses !== 1 ? 's' : ''}
          </h2>
        </div>
        
        {totalResponses > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport('csv')}
            isLoading={isExporting}
            leftIcon={<IconDownload size={18} />}
          >
            Export to CSV
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {[
            { id: 'summary', label: 'Summary' },
            { id: 'question', label: 'Question' },
            { id: 'individual', label: 'Individual' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ViewTab)}
              className={cn(
                'relative pb-3 text-body font-medium transition-colors',
                activeTab === tab.id
                  ? 'text-ecx-blue'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-ecx-blue"
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {totalResponses === 0 ? (
          <EmptyState />
        ) : (
          <>
            {activeTab === 'summary' && (
              <SummaryView
                key="summary"
                answersByQuestion={answersByQuestion}
              />
            )}
            {activeTab === 'question' && (
              <QuestionView
                key="question"
                questions={questions}
                submissions={submissions}
                currentIndex={currentQuestionIndex}
                onIndexChange={setCurrentQuestionIndex}
              />
            )}
            {activeTab === 'individual' && (
              <IndividualView
                key="individual"
                questions={questions}
                submissions={submissions}
                currentIndex={currentSubmissionIndex}
                onIndexChange={setCurrentSubmissionIndex}
              />
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Empty State
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-heading-4 font-varela text-gray-600 mb-2">
        No responses yet
      </h3>
      <p className="text-body text-gray-500">
        Share your form to start collecting responses
      </p>
    </motion.div>
  );
}

// Summary View - Shows all questions with their responses
interface SummaryViewProps {
  answersByQuestion: Array<{ question: Question; answers: Array<{ value: any; submissionId: string }> }>;
}

function SummaryView({ answersByQuestion }: SummaryViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {answersByQuestion.map(({ question, answers }) => (
        <QuestionSummaryCard
          key={question.id}
          question={question}
          answers={answers}
        />
      ))}
    </motion.div>
  );
}

// Question Summary Card
interface QuestionSummaryCardProps {
  question: Question;
  answers: Array<{ value: any; submissionId: string }>;
}

function QuestionSummaryCard({ question, answers }: QuestionSummaryCardProps) {
  const [showAll, setShowAll] = useState(false);
  const displayLimit = 10;
  const displayedAnswers = showAll ? answers : answers.slice(0, displayLimit);
  const hasMore = answers.length > displayLimit;

  const renderAnswer = (value: any) => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object' && value !== null) {
      if (value.fileName) {
        return value.fileName;
      }
      return JSON.stringify(value);
    }
    return String(value || '—');
  };

  // For multiple choice/checkbox, show counts
  const isChoiceType = ['multiple_choice', 'checkbox', 'dropdown'].includes(question.type);
  
  const choiceCounts = useMemo(() => {
    if (!isChoiceType) return null;
    
    const counts: Record<string, number> = {};
    answers.forEach(({ value }) => {
      const values = Array.isArray(value) ? value : [value];
      values.forEach((v) => {
        const key = String(v);
        counts[key] = (counts[key] || 0) + 1;
      });
    });
    return counts;
  }, [answers, isChoiceType]);

  return (
    <Card className="overflow-hidden">
      {/* Question Header */}
      <div className="mb-4">
        <h3 className="text-body font-medium text-ecx-black">
          {question.title}
        </h3>
        <p className="text-body-sm text-gray-500 mt-1">
          {answers.length} response{answers.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Answers */}
      {isChoiceType && choiceCounts ? (
        <div className="space-y-3">
          {Object.entries(choiceCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([choice, count]) => {
              const percentage = Math.round((count / answers.length) * 100);
              return (
                <div key={choice} className="space-y-1">
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="text-gray-700">{choice}</span>
                    <span className="text-gray-500">{count} ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="h-full bg-ecx-blue rounded-full"
                    />
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="space-y-2 divide-y divide-gray-100">
          {displayedAnswers.map(({ value, submissionId }, index) => (
            <div
              key={`${submissionId}-${index}`}
              className={cn('py-2 text-body text-gray-700', index === 0 && 'pt-0')}
            >
              {renderAnswer(value)}
            </div>
          ))}
          
          {hasMore && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="pt-3 text-body-sm text-ecx-blue hover:text-ecx-blue-dark font-medium"
            >
              {showAll ? 'Show less' : `${answers.length - displayLimit} more responses`}
            </button>
          )}
        </div>
      )}
    </Card>
  );
}

// Question View - Navigate through questions one by one
interface QuestionViewProps {
  questions: Question[];
  submissions: Submission[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

function QuestionView({ questions, submissions, currentIndex, onIndexChange }: QuestionViewProps) {
  const currentQuestion = questions[currentIndex];
  
  if (!currentQuestion) {
    return <div className="text-center py-8 text-gray-500">No questions</div>;
  }

  const answers = submissions
    .map((sub) => {
      const answer = sub.answers.find((a) => a.questionId === currentQuestion.id);
      return answer ? { value: answer.value, submissionId: sub.id } : null;
    })
    .filter(Boolean) as Array<{ value: any; submissionId: string }>;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onIndexChange(currentIndex - 1)}
          disabled={currentIndex === 0}
          leftIcon={<IconChevronLeft size={18} />}
        >
          Previous
        </Button>
        <span className="text-body-sm text-gray-500">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onIndexChange(currentIndex + 1)}
          disabled={currentIndex === questions.length - 1}
          rightIcon={<IconChevronRight size={18} />}
        >
          Next
        </Button>
      </div>

      <QuestionSummaryCard question={currentQuestion} answers={answers} />
    </motion.div>
  );
}

// Individual View - View individual submissions
interface IndividualViewProps {
  questions: Question[];
  submissions: Submission[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

function IndividualView({ questions, submissions, currentIndex, onIndexChange }: IndividualViewProps) {
  const currentSubmission = submissions[currentIndex];
  
  if (!currentSubmission) {
    return <div className="text-center py-8 text-gray-500">No submissions</div>;
  }

  const submittedAt = new Date(currentSubmission.submittedAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onIndexChange(currentIndex - 1)}
          disabled={currentIndex === 0}
          leftIcon={<IconChevronLeft size={18} />}
        >
          Previous
        </Button>
        <span className="text-body-sm text-gray-500">
          {currentIndex + 1} of {submissions.length}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onIndexChange(currentIndex + 1)}
          disabled={currentIndex === submissions.length - 1}
          rightIcon={<IconChevronRight size={18} />}
        >
          Next
        </Button>
      </div>

      {/* Submission Details */}
      <Card>
        <div className="mb-6 pb-4 border-b border-gray-100">
          <p className="text-body-sm text-gray-500">Submission ID</p>
          <p className="text-body font-mono font-medium text-ecx-black">{currentSubmission.id}</p>
          <p className="text-caption text-gray-400 mt-1">{submittedAt}</p>
        </div>

        <div className="space-y-6">
          {questions.map((question) => {
            const answer = currentSubmission.answers.find((a) => a.questionId === question.id);
            return (
              <div key={question.id}>
                <p className="text-body-sm font-medium text-gray-600 mb-1">
                  {question.title}
                </p>
                <p className="text-body text-ecx-black">
                  {answer ? formatAnswer(answer.value) : <span className="text-gray-400">No answer</span>}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}

function formatAnswer(value: any): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (typeof value === 'object' && value !== null) {
    if (value.fileName) {
      return value.fileName;
    }
    return JSON.stringify(value);
  }
  return String(value || '—');
}

