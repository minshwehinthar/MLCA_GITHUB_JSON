"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";

export function LoadingGrid({ count = 6, className = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" }: { count?: number; className?: string }) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string | null; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/60 px-6 py-12 text-center">
      <AlertCircle className="mb-3 h-8 w-8 text-red-500" />
      <p className="font-semibold text-red-700">{message ?? "Unable to load content."}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          <RefreshCw /> Try again
        </Button>
      )}
    </div>
  );
}

export function PageSpinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-burgundy/20 border-t-burgundy" />
    </div>
  );
}
