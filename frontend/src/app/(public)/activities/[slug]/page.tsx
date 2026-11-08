"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, MapPin } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { withLocale } from "@/lib/api";
import type { Activity } from "@/lib/types";
import { useLocale } from "@/providers/locale-provider";
import { formatDate, formatTime, statusColor, storageUrl } from "@/lib/utils";
import { ShareButtons } from "@/components/site/related-share";
import { ErrorState, PageSpinner } from "@/components/site/content-states";
import { Badge } from "@/components/ui/badge";
import { ZoomableImage, ZoomableImageGrid } from "@/components/site/zoomable-image";

export default function ActivityDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { locale, t } = useLocale();
  const { data: activity, loading, error, refetch } = useApi<Activity>(slug ? withLocale(`/activities/${slug}`, locale) : null);

  if (loading) return <PageSpinner />;
  if (error || !activity) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState message={error ?? "Activity not found"} onRetry={refetch} />
        <div className="mt-6 text-center">
          <Link href="/activities" className="text-sm font-semibold text-burgundy hover:text-gold">← {t("back")}</Link>
        </div>
      </div>
    );
  }

  const cover = storageUrl(activity.cover_image || activity.cover_path);

  return (
    <div>
      <div className="bg-burgundy-900 pb-24 text-white">
        <div className="mx-auto max-w-4xl px-4 pt-10">
          <Link href="/activities" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/60 hover:text-gold-light">
            <ArrowLeft className="h-3.5 w-3.5" /> {t("activities")}
          </Link>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Badge className={statusColor(activity.status)}>{t(activity.status as "upcoming")}</Badge>
            {activity.category && <Badge variant="gold">{activity.category.name}</Badge>}
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight md:text-4xl">{activity.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-white/70">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-gold" />{formatDate(activity.start_date, locale)}{activity.end_date ? ` – ${formatDate(activity.end_date, locale)}` : ""}</span>
            {activity.start_time && <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-gold" />{formatTime(activity.start_time)}{activity.end_time ? ` – ${formatTime(activity.end_time)}` : ""}</span>}
            {activity.location && <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gold" />{activity.location}</span>}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4">
        {cover && (
          <ZoomableImage
            src={cover}
            alt={activity.title}
            className="-mt-16 h-[300px] w-full rounded-2xl shadow-xl md:h-[420px]"
          />
        )}

        <article className="mt-8">
          {activity.description && <p className="mb-6 border-l-4 border-gold pl-4 text-lg font-medium leading-relaxed text-burgundy-800">{activity.description}</p>}
          {activity.content && <div className="rich-content" dangerouslySetInnerHTML={{ __html: activity.content }} />}

          {activity.media?.length > 0 && (
            <ZoomableImageGrid
              className="mt-8 grid gap-3 sm:grid-cols-2"
              items={activity.media
                .filter((item) => item.type === "image")
                .map((item) => ({ url: storageUrl(item.file_path), alt: item.original_name }))}
            />
          )}

          <div className="mt-8"><ShareButtons title={activity.title} /></div>
        </article>
      </div>
    </div>
  );
}
