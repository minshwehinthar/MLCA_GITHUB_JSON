"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, Info, MapPin } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { withLocale } from "@/lib/api";
import type { EventItem } from "@/lib/types";
import { useLocale } from "@/providers/locale-provider";
import { formatDate, formatTime, statusColor, storageUrl } from "@/lib/utils";
import { ShareButtons } from "@/components/site/related-share";
import { ErrorState, PageSpinner } from "@/components/site/content-states";
import { Badge } from "@/components/ui/badge";
import { ZoomableImage, ZoomableImageGrid } from "@/components/site/zoomable-image";

export default function EventDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { locale, t } = useLocale();
  const { data: event, loading, error, refetch } = useApi<EventItem>(slug ? withLocale(`/events/${slug}`, locale) : null);

  if (loading) return <PageSpinner />;
  if (error || !event) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState message={error ?? "Event not found"} onRetry={refetch} />
        <div className="mt-6 text-center">
          <Link href="/events" className="text-sm font-semibold text-burgundy hover:text-gold">← {t("back")}</Link>
        </div>
      </div>
    );
  }

  const cover = storageUrl(event.cover_image || event.cover_path);

  return (
    <div>
      <div className="bg-burgundy-900 pb-24 text-white">
        <div className="mx-auto max-w-4xl px-4 pt-10">
          <Link href="/events" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/60 hover:text-gold-light">
            <ArrowLeft className="h-3.5 w-3.5" /> {t("events")}
          </Link>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Badge className={statusColor(event.status)}>{t(event.status === "cancelled" ? "completed" : (event.status as "upcoming"))}</Badge>
            {event.category && <Badge variant="gold">{event.category.name}</Badge>}
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight md:text-4xl">{event.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-white/70">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-gold" />{formatDate(event.start_date, locale)}{event.end_date ? ` – ${formatDate(event.end_date, locale)}` : ""}</span>
            {event.start_time && <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-gold" />{formatTime(event.start_time)}{event.end_time ? ` – ${formatTime(event.end_time)}` : ""}</span>}
            {event.location && <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gold" />{event.location}</span>}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4">
        {cover && (
          <ZoomableImage
            src={cover}
            alt={event.title}
            className="-mt-16 h-[300px] w-full rounded-2xl shadow-xl md:h-[420px]"
          />
        )}

        <article className="mt-8">
          {event.description && <p className="mb-6 border-l-4 border-gold pl-4 text-lg font-medium leading-relaxed text-burgundy-800">{event.description}</p>}

          {event.registration_info && (
            <div className="mb-6 flex gap-3 rounded-xl border border-gold/30 bg-gold/10 p-4 text-sm text-[#6b4f12]">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <div>
                <p className="font-semibold">Registration Information</p>
                <p className="mt-1">{event.registration_info}</p>
              </div>
            </div>
          )}

          {event.content && <div className="rich-content" dangerouslySetInnerHTML={{ __html: event.content }} />}

          {event.media?.length > 0 && (
            <ZoomableImageGrid
              className="mt-8 grid gap-3 sm:grid-cols-2"
              items={event.media
                .filter((item) => item.type === "image")
                .map((item) => ({ url: storageUrl(item.file_path), alt: item.original_name }))}
            />
          )}

          <div className="mt-8"><ShareButtons title={event.title} /></div>
        </article>
      </div>
    </div>
  );
}
