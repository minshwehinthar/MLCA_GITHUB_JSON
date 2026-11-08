"use client";

import { useState } from "react";
import { ZoomIn } from "lucide-react";
import type { GalleryImage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Lightbox } from "@/components/site/lightbox";

export interface ZoomImageItem {
  url: string;
  alt?: string;
  caption?: string | null;
}

function toGalleryImage(item: ZoomImageItem, index: number): GalleryImage {
  return { id: index, image_path: "", url: item.url, caption: item.caption ?? item.alt ?? null, order: index };
}

export function ZoomableImage({
  src,
  alt,
  caption,
  className,
  imgClassName,
  onError,
}: {
  src: string;
  alt: string;
  caption?: string | null;
  className?: string;
  imgClassName?: string;
  onError?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={cn("group relative block overflow-hidden", className)} aria-label="View full image">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} onError={onError} className={cn("h-full w-full object-cover", imgClassName)} />
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/25 group-hover:opacity-100">
          <span className="rounded-full bg-white/90 p-2 text-burgundy shadow">
            <ZoomIn className="h-5 w-5" />
          </span>
        </span>
      </button>
      <Lightbox images={[toGalleryImage({ url: src, alt, caption }, 0)]} open={open} onOpenChange={setOpen} />
    </>
  );
}

export function ZoomableImageGrid({
  items,
  className,
  imageClassName,
}: {
  items: ZoomImageItem[];
  className?: string;
  imageClassName?: string;
}) {
  const [lightbox, setLightbox] = useState<{ open: boolean; index: number }>({ open: false, index: 0 });
  const images = items.map(toGalleryImage);

  if (!items.length) return null;

  return (
    <>
      <div className={className}>
        {items.map((item, index) => (
          <button
            key={`${item.url}-${index}`}
            type="button"
            onClick={() => setLightbox({ open: true, index })}
            className="group relative block overflow-hidden rounded-xl bg-cream-dark"
            aria-label="View full image"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt={item.alt ?? ""} className={cn("h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105", imageClassName)} />
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/25 group-hover:opacity-100">
              <span className="rounded-full bg-white/90 p-2 text-burgundy shadow">
                <ZoomIn className="h-5 w-5" />
              </span>
            </span>
          </button>
        ))}
      </div>
      <Lightbox
        images={images}
        initialIndex={lightbox.index}
        open={lightbox.open}
        onOpenChange={(open) => setLightbox((value) => ({ ...value, open }))}
      />
    </>
  );
}
