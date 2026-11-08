"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  Download,
  Eye,
  FileText,
  Images,
  MapPin,
  Newspaper,
  Play,
  Users,
} from "lucide-react";
import type { Achievement, Activity, DocumentItem, EventItem, GalleryAlbum, Member, Post, Video } from "@/lib/types";
import { cn, excerpt, formatBytes, formatShortDate, formatTime, initials, statusColor, storageUrl } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import { Badge } from "@/components/ui/badge";
import { ZoomableImage } from "@/components/site/zoomable-image";

function CoverPlaceholder({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center bg-gradient-to-br from-burgundy to-burgundy-900", className)}>
      <Newspaper className="h-10 w-10 text-gold/70" />
    </div>
  );
}

export function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  const { t } = useLocale();
  const image = storageUrl(post.cover_image || post.cover_path);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-burgundy/10 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/news/${post.slug}`} className="relative block overflow-hidden">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={post.title}
            className={cn("w-full object-cover transition-transform duration-500 group-hover:scale-105", featured ? "h-64" : "h-48")}
          />
        ) : (
          <CoverPlaceholder className={featured ? "h-64" : "h-48"} />
        )}
        {post.category && (
          <span className="absolute left-3 top-3 rounded-full bg-burgundy/90 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
            {post.category.name}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-3 text-[11px] font-medium uppercase tracking-wide text-muted">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5 text-gold" />
            {formatShortDate(post.published_at ?? post.created_at)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5 text-gold" />
            {post.views}
          </span>
        </div>
        <h3 className="font-display text-lg font-bold leading-snug text-burgundy-800">
          <Link href={`/news/${post.slug}`} className="transition-colors hover:text-burgundy">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted line-clamp-3">
          {post.excerpt || excerpt(post.content)}
        </p>
        <Link href={`/news/${post.slug}`} className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-burgundy hover:text-gold">
          {t("readMore")} →
        </Link>
      </div>
    </article>
  );
}

export function ActivityCard({ activity }: { activity: Activity }) {
  const { t } = useLocale();
  const image = storageUrl(activity.cover_image || activity.cover_path);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-burgundy/10 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/activities/${activity.slug}`} className="relative block overflow-hidden">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={activity.title} className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <CoverPlaceholder className="h-44" />
        )}
        <Badge variant="warning" className={cn("absolute right-3 top-3 capitalize", statusColor(activity.status))}>
          {t(activity.status as "upcoming")}
        </Badge>
        <div className="absolute bottom-3 left-3 rounded-xl bg-white/95 px-3 py-1.5 text-center shadow">
          <span className="block font-display text-lg font-bold leading-none text-burgundy">{new Date(activity.start_date).getDate()}</span>
          <span className="text-[10px] font-bold uppercase tracking-wide text-muted">
            {new Date(activity.start_date).toLocaleDateString("en-GB", { month: "short" })}
          </span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-base font-bold leading-snug text-burgundy-800">
          <Link href={`/activities/${activity.slug}`} className="hover:text-burgundy">{activity.title}</Link>
        </h3>
        <p className="mt-2 flex-1 text-sm text-muted line-clamp-2">{activity.description || excerpt(activity.content, 120)}</p>
        <div className="mt-3 space-y-1.5 text-xs text-muted">
          {activity.location && (
            <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-gold" />{activity.location}</p>
          )}
          {activity.start_time && (
            <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-gold" />{formatTime(activity.start_time)}{activity.end_time ? ` - ${formatTime(activity.end_time)}` : ""}</p>
          )}
        </div>
      </div>
    </article>
  );
}

export function EventCard({ event }: { event: EventItem }) {
  const { t } = useLocale();
  const image = storageUrl(event.cover_image || event.cover_path);
  const date = new Date(event.start_date);

  return (
    <article className="group flex h-full gap-4 overflow-hidden rounded-2xl border border-burgundy/10 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex h-20 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-burgundy text-white">
        <span className="font-display text-2xl font-bold leading-none">{date.getDate()}</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gold-light">
          {date.toLocaleDateString("en-GB", { month: "short" })}
        </span>
        <span className="text-[10px] text-white/60">{date.getFullYear()}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("capitalize", statusColor(event.status))}>{t(event.status as "upcoming")}</Badge>
          {event.start_time && <span className="text-[11px] text-muted">{formatTime(event.start_time)}</span>}
        </div>
        <h3 className="mt-1.5 font-display text-base font-bold leading-snug text-burgundy-800">
          <Link href={`/events/${event.slug}`} className="hover:text-burgundy">{event.title}</Link>
        </h3>
        {event.location && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-muted"><MapPin className="h-3.5 w-3.5 shrink-0 text-gold" />{event.location}</p>
        )}
      </div>
      <Link href={`/events/${event.slug}`} className="hidden self-center text-xs font-semibold text-burgundy sm:block">→</Link>
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={event.title} className="hidden h-20 w-24 rounded-lg object-cover lg:block" />
      )}
    </article>
  );
}

export function AlbumCard({ album }: { album: GalleryAlbum }) {
  const image = storageUrl(album.cover_image || album.images?.[0]?.url || album.cover_path);

  return (
    <Link href={`/gallery/${album.slug}`} className="group relative block overflow-hidden rounded-2xl bg-burgundy shadow-sm">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={album.title} className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      ) : (
        <div className="flex h-56 items-center justify-center bg-gradient-to-br from-burgundy to-burgundy-900">
          <Images className="h-10 w-10 text-gold/70" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-burgundy-900/90 via-burgundy-900/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="font-display text-base font-bold text-white">{album.title}</h3>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-white/70">
          <Images className="h-3.5 w-3.5 text-gold" />
          {album.images_count} photo{album.images_count === 1 ? "" : "s"}
        </p>
      </div>
    </Link>
  );
}

export function VideoCard({ video }: { video: Video }) {
  const image = storageUrl(video.thumbnail || video.thumbnail_path);

  return (
    <Link href={`/videos/${video.slug}`} className="group block overflow-hidden rounded-2xl border border-burgundy/10 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={video.title} className="h-44 w-full object-cover" />
        ) : (
          <div className="flex h-44 items-center justify-center bg-gradient-to-br from-burgundy to-burgundy-900">
            <Play className="h-10 w-10 text-gold/70" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-burgundy-900/30 transition-colors group-hover:bg-burgundy-900/50">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-burgundy-900 shadow-lg transition-transform group-hover:scale-110">
            <Play className="ml-0.5 h-5 w-5 fill-current" />
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display text-base font-bold leading-snug text-burgundy-800 line-clamp-2">{video.title}</h3>
        <p className="mt-1.5 flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted">
          <Eye className="h-3.5 w-3.5 text-gold" />{video.views} views
          {video.published_at && <span>· {formatShortDate(video.published_at)}</span>}
        </p>
      </div>
    </Link>
  );
}

export function DocumentRow({ document }: { document: DocumentItem }) {
  const { t } = useLocale();

  return (
    <div className="flex items-center gap-4 rounded-xl border border-burgundy/10 bg-white p-4 shadow-sm transition-colors hover:border-burgundy/25">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-burgundy/10 text-burgundy">
        <FileText className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-burgundy-800">{document.title}</h3>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-[11px] text-muted">
          <span className="font-bold text-gold">{document.extension}</span>
          <span>{formatBytes(document.file_size)}</span>
          <span>{document.downloads} downloads</span>
          {document.category && <span>{document.category.name}</span>}
        </p>
      </div>
      <a
        href={document.download_url}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-burgundy px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-burgundy-700"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">{t("download")}</span>
      </a>
    </div>
  );
}

export function MemberCard({ member }: { member: Member }) {
  const [broken, setBroken] = useState(false);
  const photo = storageUrl(member.photo_path || member.photo);

  return (
    <div className="group overflow-hidden rounded-2xl border border-burgundy/10 bg-white text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-28 bg-gradient-to-br from-burgundy to-burgundy-900">
        <div className="mon-pattern absolute inset-0 opacity-40" />
      </div>
      <div className="-mt-12 px-5 pb-5">
        {photo && !broken ? (
          <ZoomableImage
            src={photo}
            alt={member.name}
            caption={member.name}
            className="mx-auto h-24 w-24 rounded-full border-4 border-white shadow"
            imgClassName="object-cover"
            onError={() => setBroken(true)}
          />
        ) : (
          <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-cream-dark font-display text-2xl font-bold text-burgundy shadow">
            {initials(member.name)}
          </span>
        )}
        <h3 className="mt-3 font-display text-base font-bold text-burgundy-800">{member.name}</h3>
        {member.position && <p className="text-xs font-semibold uppercase tracking-wide text-gold">{member.position}</p>}
        {member.department && <p className="mt-1 text-xs text-muted">{member.department}</p>}
        {member.academic_year && <p className="text-[11px] text-muted">{member.academic_year}</p>}
        {member.facebook && (
          <a href={member.facebook} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[11px] font-semibold text-burgundy hover:text-gold">
            Facebook
          </a>
        )}
      </div>
    </div>
  );
}

export function AchievementCard({ achievement }: { achievement: Achievement }) {
  const image = storageUrl(achievement.image);

  return (
    <div className="flex h-full gap-4 rounded-2xl border border-burgundy/10 bg-white p-5 shadow-sm">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gold/15 text-gold">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={achievement.title} className="h-full w-full object-cover" />
        ) : (
          <span className="font-display text-lg font-bold">{achievement.year?.slice(-2) ?? "★"}</span>
        )}
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-gold">{achievement.year}</p>
        <h3 className="mt-0.5 font-display text-base font-bold text-burgundy-800">{achievement.title}</h3>
        {achievement.description && <p className="mt-1 text-sm leading-relaxed text-muted line-clamp-3">{achievement.description}</p>}
      </div>
    </div>
  );
}

export function ExecutivesStrip({ members }: { members: Member[] }) {
  if (!members.length) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {members.map((member) => (
        <MemberCard key={member.id} member={member} />
      ))}
    </div>
  );
}

export function StatBar({ stats }: { stats: { label: string; value: number; icon?: React.ComponentType<{ className?: string }> }[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon ?? Users;
        return (
          <div key={stat.label} className="rounded-2xl border border-white/20 bg-white p-5 text-center shadow-lg">
            <Icon className="mx-auto mb-2 h-6 w-6 text-gold" />
            <p className="font-display text-3xl font-bold text-burgundy-800">{stat.value}</p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}
