"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, Download, Eye, User } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { withLocale } from "@/lib/api";
import type { Post } from "@/lib/types";
import { useLocale } from "@/providers/locale-provider";
import { formatBytes, formatDate, storageUrl } from "@/lib/utils";
import { PostCard } from "@/components/site/cards";
import { ShareButtons } from "@/components/site/related-share";
import { ErrorState, PageSpinner } from "@/components/site/content-states";
import { Badge } from "@/components/ui/badge";
import { ZoomableImage, ZoomableImageGrid } from "@/components/site/zoomable-image";

interface PostDetail {
  post: Post;
  related: Post[];
}

export default function NewsDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { locale, t } = useLocale();
  const { data, loading, error, refetch } = useApi<PostDetail>(slug ? withLocale(`/posts/${slug}`, locale) : null);

  if (loading) return <PageSpinner />;
  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState message={error ?? "Post not found"} onRetry={refetch} />
        <div className="mt-6 text-center">
          <Link href="/news" className="text-sm font-semibold text-burgundy hover:text-gold">← {t("back")}</Link>
        </div>
      </div>
    );
  }

  const { post, related } = data;
  const cover = storageUrl(post.cover_image || post.cover_path);

  return (
    <div>
      <div className="bg-burgundy-900 pb-24 text-white">
        <div className="mx-auto max-w-4xl px-4 pt-10">
          <Link href="/news" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/60 hover:text-gold-light">
            <ArrowLeft className="h-3.5 w-3.5" /> {t("news")}
          </Link>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {post.category && <Badge variant="gold">{post.category.name}</Badge>}
            {post.is_featured && <Badge variant="outline" className="border-white/30 text-white">Featured</Badge>}
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight md:text-4xl">{post.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-white/60">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-gold" />{formatDate(post.published_at ?? post.created_at, locale)}</span>
            {post.author?.name && <span className="inline-flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-gold" />{post.author.name}</span>}
            <span className="inline-flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-gold" />{post.views} views</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4">
        {cover && (
          <ZoomableImage
            src={cover}
            alt={post.title}
            className="-mt-16 h-[300px] w-full rounded-2xl shadow-xl md:h-[420px]"
          />
        )}

        <article className="mt-8">
          {post.excerpt && <p className="mb-6 border-l-4 border-gold pl-4 text-lg font-medium leading-relaxed text-burgundy-800">{post.excerpt}</p>}
          {post.content && <div className="rich-content" dangerouslySetInnerHTML={{ __html: post.content }} />}

          {post.media?.length > 0 && (
            <div className="mt-8 rounded-2xl border border-burgundy/10 bg-white p-5">
              <h2 className="mb-3 font-display text-base font-bold text-burgundy-800">{t("attachments")}</h2>
              <ZoomableImageGrid
                className="mb-3 grid gap-3 sm:grid-cols-2"
                imageClassName="h-44"
                items={post.media
                  .filter((item) => item.type === "image")
                  .map((item) => ({ url: storageUrl(item.file_path), alt: item.original_name }))}
              />
              <div className="space-y-2">
                {post.media.filter((item) => item.type !== "image").map((item) => (
                  <a
                    key={item.id ?? item.file_path}
                    href={storageUrl(item.file_path)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-burgundy/10 px-3 py-2 text-sm transition-colors hover:bg-cream"
                  >
                    <Download className="h-4 w-4 text-gold" />
                    <span className="flex-1 truncate">{item.original_name || item.file_name}</span>
                    <span className="text-xs text-muted">{formatBytes(item.size)}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <ShareButtons title={post.title} />
          </div>
        </article>
      </div>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14">
          <h2 className="mb-6 font-display text-2xl font-bold text-burgundy-800">{t("relatedPosts")}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => <PostCard key={item.id} post={item} />)}
          </div>
        </section>
      )}
    </div>
  );
}
