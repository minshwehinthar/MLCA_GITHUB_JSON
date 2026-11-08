"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ExternalLink, Eye } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { withLocale } from "@/lib/api";
import type { Video } from "@/lib/types";
import { useLocale } from "@/providers/locale-provider";
import { formatDate } from "@/lib/utils";
import { ShareButtons } from "@/components/site/related-share";
import { ErrorState, PageSpinner } from "@/components/site/content-states";
import { Badge } from "@/components/ui/badge";

export default function VideoDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { locale, t } = useLocale();
  const { data: video, loading, error, refetch } = useApi<Video>(slug ? withLocale(`/videos/${slug}`, locale) : null);

  if (loading) return <PageSpinner />;
  if (error || !video) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState message={error ?? "Video not found"} onRetry={refetch} />
        <div className="mt-6 text-center">
          <Link href="/videos" className="text-sm font-semibold text-burgundy hover:text-gold">← {t("back")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-burgundy-900 pb-20 text-white">
        <div className="mx-auto max-w-5xl px-4 pt-10">
          <Link href="/videos" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/60 hover:text-gold-light">
            <ArrowLeft className="h-3.5 w-3.5" /> {t("videos")}
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge variant="gold" className="capitalize">{video.type}</Badge>
            {video.category && <Badge variant="outline" className="border-white/30 text-white">{video.category.name}</Badge>}
          </div>
          <h1 className="mt-3 font-display text-2xl font-bold leading-tight md:text-4xl">{video.title}</h1>
          <p className="mt-2 flex items-center gap-4 text-xs text-white/60">
            <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5 text-gold" />{video.views} views</span>
            {video.published_at && <span>{formatDate(video.published_at, locale)}</span>}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4">
        <div className="-mt-12 overflow-hidden rounded-2xl bg-black shadow-xl">
          {video.embed_url ? (
            <div className="aspect-video w-full">
              <iframe
                src={video.embed_url}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          ) : video.video_url ? (
            <video src={video.video_url} controls className="aspect-video w-full bg-black" />
          ) : (
            <div className="flex aspect-video items-center justify-center text-white/50">Video unavailable</div>
          )}
        </div>

        <article className="mt-8">
          {video.description && <div className="rich-content" dangerouslySetInnerHTML={{ __html: video.description }} />}
          {video.external_url && (
            <a href={video.external_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-burgundy hover:text-gold">
              <ExternalLink className="h-4 w-4" /> Open original video
            </a>
          )}
          <div className="mt-8"><ShareButtons title={video.title} /></div>
        </article>
      </div>
    </div>
  );
}
