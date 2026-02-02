"use client";

import { cn } from "../../lib/cn";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export function Skeleton({
  className,
  variant = "text",
  width,
  height,
  animation = "pulse",
}: SkeletonProps) {
  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-lg",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "skeleton-wave",
    none: "",
  };

  return (
    <div
      className={cn(
        "bg-gray-200",
        variantClasses[variant],
        animationClasses[animation],
        className,
      )}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
    />
  );
}

// Pre-built skeleton patterns
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height={16}
          className={cn(i === lines - 1 && "w-3/4")}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "p-4 border border-gray-200 rounded-card space-y-4",
        className,
      )}
    >
      <Skeleton variant="rounded" height={120} />
      <Skeleton variant="text" height={20} className="w-3/4" />
      <Skeleton variant="text" height={16} className="w-1/2" />
    </div>
  );
}

export function SkeletonTable({
  rows = 5,
  cols = 4,
  className,
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-gray-200">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} variant="text" height={20} className="flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              variant="text"
              height={16}
              className="flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonForm({
  fields = 4,
  className,
}: {
  fields?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton variant="text" height={14} className="w-24" />
          <Skeleton variant="rounded" height={44} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonResponseSummary({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton variant="text" height={32} className="w-48" />
        <Skeleton variant="rounded" height={40} className="w-32" />
      </div>

      {/* Question cards */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg border border-gray-200 p-6 space-y-4"
        >
          <Skeleton variant="text" height={20} className="w-2/3" />
          <Skeleton variant="text" height={14} className="w-24" />
          <div className="space-y-2 pt-2">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3">
                <Skeleton variant="text" height={16} className="flex-1" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonFormCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-white rounded-card border border-gray-200 p-5 space-y-4 min-h-[240px]",
        className,
      )}
    >
      {/* Color strip at top */}
      <Skeleton variant="rounded" height={8} className="w-16" />

      {/* Title */}
      <Skeleton variant="text" height={24} className="w-3/4" />

      {/* Description */}
      <div className="space-y-2">
        <Skeleton variant="text" height={14} className="w-full" />
        <Skeleton variant="text" height={14} className="w-2/3" />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 pt-4">
        <Skeleton variant="rounded" height={20} className="w-20" />
        <Skeleton variant="rounded" height={20} className="w-24" />
      </div>

      {/* Date */}
      <Skeleton variant="text" height={12} className="w-32 mt-auto" />
    </div>
  );
}

export function SkeletonFormGrid({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonFormCard key={i} />
      ))}
    </div>
  );
}
