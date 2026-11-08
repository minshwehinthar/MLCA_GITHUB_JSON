"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Images } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { withLocale } from "@/lib/api";
import type { GalleryAlbum } from "@/lib/types";
import { useLocale } from "@/providers/locale-provider";
import { formatDate } from "@/lib/utils";
import { Lightbox } from "@/components/site/lightbox";
import { ErrorState, PageSpinner } from "@/components/site/content-states";
import { PageHero } from "@/components/site/page-hero";

export default function AlbumDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { locale, t } = useLocale();
  const { data: album, loading, error, refetch } = useApi<GalleryAlbum>(slug ? withLocale(`/gallery/albums/${slug}`, locale) : null);
  const [lightbox, setLightbox] = useState<{ open: boolean; index: number }>({ open: false, index: 0 });

  if (loading) return <PageSpinner />;
  if (error || !album) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState message={error ?? "Album not found"} onRetry={refetch} />
        <div className="mt-6 text-center">
          <Link href="/gallery" className="text-sm font-semibold text-burgundy hover:text-gold">← {t("back")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHero
        title={album.title}
        description={album.description ?? undefined}
        breadcrumb={[{ label: t("gallery"), href: "/gallery" }, { label: album.title }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/gallery" className="inline-flex items-center gap-1.5 text-sm font-semibold text-burgundy hover:text-gold">
            <ArrowLeft className="h-4 w-4" /> {t("back")}
          </Link>
          <p className="flex items-center gap-2 text-sm text-muted">
            <Images className="h-4 w-4 text-gold" />
            {album.images_count} photos
            {album.created_at && <span>· {formatDate(album.created_at, locale)}</span>}
          </p>
        </div>

        {album.images.length ? (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
            {album.images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setLightbox({ open: true, index })}
                className="group block w-full overflow-hidden rounded-xl bg-cream-dark shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.caption ?? album.title}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-muted">{t("noData")}</p>
        )}
      </div>

      <Lightbox
        images={album.images}
        initialIndex={lightbox.index}
        open={lightbox.open}
        onOpenChange={(open) => setLightbox((value) => ({ ...value, open }))}
      />
    </div>
  );
}
