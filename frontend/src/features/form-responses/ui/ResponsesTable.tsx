"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Submission } from "@/entities/submission";
import { Question } from "@/entities/question";
import { Card, Button, IconDownload, Spinner } from "@/shared/ui";
import { cn } from "@/shared/lib";

interface ResponsesTableProps {
  submissions: Submission[];
  questions: Question[];
  isLoading?: boolean;
  onExport?: (format: "xlsx" | "json") => void;
  isExporting?: boolean;
}

export function ResponsesTable({
  submissions,
  questions,
  isLoading,
  onExport,
  isExporting,
}: ResponsesTableProps) {
  const columns = useMemo(() => {
    return [
      { id: "id", label: "Submission ID", width: 160 },
      { id: "submittedAt", label: "Submitted", width: 160 },
      ...questions.map((q) => ({
        id: q.id,
        label: q.title,
        width: 200,
      })),
    ];
  }, [questions]);

  const rows = useMemo(() => {
    return submissions.map((submission) => {
      const row: Record<string, string> = {
        id: submission.id,
        submittedAt: new Date(submission.submittedAt).toLocaleString(),
      };

      submission.answers.forEach((answer) => {
        if (Array.isArray(answer.value)) {
          row[answer.questionId] = answer.value.join(", ");
        } else {
          row[answer.questionId] = answer.value || "-";
        }
      });

      return row;
    });
  }, [submissions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <Card className="text-center py-12">
        <p className="text-gray-500 font-inter">No responses yet</p>
        <p className="text-body-sm text-gray-400 mt-1">
          Responses will appear here once people submit the form
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-heading-4 font-varela text-ecx-black">
            {submissions.length} response{submissions.length !== 1 ? "s" : ""}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport?.("xlsx")}
            isLoading={isExporting}
            leftIcon={<IconDownload size={16} />}
          >
            Export Excel
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onExport?.("json")}
            isLoading={isExporting}
          >
            JSON
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {columns.map((col, index) => (
                  <th
                    key={col.id}
                    className={cn(
                      "px-4 py-3 text-left text-body-sm font-medium text-gray-600",
                      index === 0 && "sticky left-0 bg-gray-50 z-10",
                    )}
                    style={{ minWidth: col.width }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: rowIndex * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={col.id}
                      className={cn(
                        "px-4 py-3 text-body-sm text-ecx-gray",
                        colIndex === 0 &&
                          "sticky left-0 bg-white z-10 font-mono text-ecx-blue",
                      )}
                    >
                      <span className="line-clamp-2">{row[col.id] || "-"}</span>
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
