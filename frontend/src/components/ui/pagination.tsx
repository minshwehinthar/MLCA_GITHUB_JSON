"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import type { PaginationMeta } from "@/lib/types";

interface PaginationProps {
  meta?: PaginationMeta | null;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ meta, onPageChange, className }: PaginationProps) {
  if (!meta || meta.last_page <= 1) return null;

  const pages = Array.from({ length: meta.last_page }, (_, i) => i + 1).filter(
    (page) => page === 1 || page === meta.last_page || Math.abs(page - meta.current_page) <= 1
  );

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 ${className ?? ""}`}>
      <p className="text-xs text-muted">
        Showing {meta.from ?? 0}-{meta.to ?? 0} of {meta.total} results
      </p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon-sm" disabled={meta.current_page <= 1} onClick={() => onPageChange(meta.current_page - 1)}>
          <ChevronLeft />
        </Button>
        {pages.map((page, index) => {
          const previous = pages[index - 1];
          return (
            <span key={page} className="flex items-center gap-1">
              {previous && page - previous > 1 && <span className="px-1 text-xs text-muted">…</span>}
              <Button
                variant={page === meta.current_page ? "default" : "outline"}
                size="icon-sm"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            </span>
          );
        })}
        <Button
          variant="outline"
          size="icon-sm"
          disabled={meta.current_page >= meta.last_page}
          onClick={() => onPageChange(meta.current_page + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
