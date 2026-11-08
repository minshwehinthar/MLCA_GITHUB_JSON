"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { GalleryImage } from "@/lib/types";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function Lightbox({ images, initialIndex = 0, open, onOpenChange }: {
  images: GalleryImage[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  const current = images[index];
  if (!current) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl border-none bg-transparent p-0 shadow-none" overlayClassName="bg-white/80 backdrop-blur-md" hideClose>
        <div className="relative overflow-hidden rounded-2xl bg-transparent">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.url} alt={current.caption ?? "Gallery image"} className="max-h-[88vh] w-full object-contain" />
          {current.caption && (
            <p className="absolute inset-x-0 bottom-0 rounded-b-2xl bg-gradient-to-t from-white via-white/85 to-transparent px-6 pb-4 pt-10 text-center text-sm font-medium text-burgundy-800">
              {current.caption}
            </p>
          )}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-burgundy text-white shadow-lg transition-colors hover:bg-burgundy-700"
            aria-label="Close"
          >
            ✕
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setIndex((value) => (value - 1 + images.length) % images.length)}
                className={cn("absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-burgundy text-white shadow-lg transition-colors hover:bg-burgundy-700")}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setIndex((value) => (value + 1) % images.length)}
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-burgundy text-white shadow-lg transition-colors hover:bg-burgundy-700"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <span className="absolute left-4 top-4 rounded-full bg-burgundy px-2.5 py-1 text-xs font-semibold text-white shadow">
                {index + 1} / {images.length}
              </span>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
