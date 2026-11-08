"use client";

import Link from "next/link";
import {
  Activity as ActivityIcon,
  CalendarDays,
  FileText,
  Images,
  Mail,
  Newspaper,
  Play,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useApi } from "@/hooks/use-api";
import type { DashboardData } from "@/lib/types";
import { formatShortDate, statusColor } from "@/lib/utils";
import { PageHeader } from "@/components/admin/form-parts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/site/content-states";
import { EmptyState } from "@/components/ui/empty-state";

export default function AdminDashboardPage() {
  const { data, loading, error, refetch } = useApi<DashboardData>("/admin/dashboard");

  if (loading) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Overview of your website content and activity." />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <PageHeader title="Dashboard" />
        <ErrorState message={error ?? "Unable to load dashboard."} onRetry={refetch} />
      </div>
    );
  }

  const { stats } = data;
  const cards = [
    { label: "Total Posts", value: stats.posts, sub: `${stats.published_posts} published · ${stats.draft_posts} drafts`, icon: Newspaper, href: "/admin/posts", tone: "bg-burgundy/10 text-burgundy" },
    { label: "Activities", value: stats.activities, sub: "Programs & projects", icon: ActivityIcon, href: "/admin/activities", tone: "bg-sky-100 text-sky-700" },
    { label: "Events", value: stats.events, sub: "Ceremonies & festivals", icon: CalendarDays, href: "/admin/events", tone: "bg-amber-100 text-amber-700" },
    { label: "Gallery Images", value: stats.gallery_images, sub: `${stats.gallery_albums} albums`, icon: Images, href: "/admin/gallery", tone: "bg-purple-100 text-purple-700" },
    { label: "Videos", value: stats.videos, sub: "Published videos", icon: Play, href: "/admin/videos", tone: "bg-rose-100 text-rose-700" },
    { label: "Documents", value: stats.documents, sub: "Downloadable files", icon: FileText, href: "/admin/documents", tone: "bg-emerald-100 text-emerald-700" },
    { label: "Members", value: stats.members, sub: "Registered members", icon: Users, href: "/admin/members", tone: "bg-teal-100 text-teal-700" },
    { label: "Unread Messages", value: stats.unread_messages, sub: "Contact inquiries", icon: Mail, href: "/admin/messages", tone: "bg-red-100 text-red-700" },
  ];

  const maxMonthly = Math.max(1, ...data.monthly_posts.map((item) => item.total));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your website content and activity."
        action={
          <Badge variant="gold" className="gap-1.5 px-3 py-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> {stats.administrators} administrators
          </Badge>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href} className="group rounded-2xl border border-burgundy/10 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">{card.label}</p>
                  <p className="mt-1 font-display text-3xl font-bold text-burgundy-800">{card.value}</p>
                  <p className="mt-0.5 text-[11px] text-muted">{card.sub}</p>
                </div>
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {data.recent_posts.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recent_posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="max-w-[240px]"><Link href={`/admin/posts/${post.id}/edit`} className="line-clamp-1 font-medium text-burgundy-800 hover:text-burgundy">{post.title}</Link></TableCell>
                      <TableCell><Badge className={`capitalize ${statusColor(post.status)}`}>{post.status}</Badge></TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted">{formatShortDate(post.published_at ?? post.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-5"><EmptyState title="No posts yet" /></div>
            )}
            <div className="border-t border-burgundy/10 p-3 text-right">
              <Link href="/admin/posts" className="text-xs font-semibold text-burgundy hover:text-gold">View all posts →</Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {data.recent_logs.length ? (
              <ul className="divide-y divide-stone-100">
                {data.recent_logs.map((log) => (
                  <li key={log.id} className="flex items-start gap-3 px-5 py-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-ink">{log.description ?? `${log.action} ${log.model_type ?? ""}`}</p>
                      <p className="text-[11px] text-muted">
                        {log.user?.name ?? "System"} · {formatShortDate(log.created_at)}
                      </p>
                    </div>
                    <Badge variant="muted" className="capitalize">{log.action}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-5"><EmptyState title="No activity yet" /></div>
            )}
            <div className="border-t border-burgundy/10 p-3 text-right">
              <Link href="/admin/logs" className="text-xs font-semibold text-burgundy hover:text-gold">View all logs →</Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Posts Created (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            {data.monthly_posts.length ? (
              <div className="flex h-48 items-end gap-3">
                {data.monthly_posts.map((item) => (
                  <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-burgundy">{item.total}</span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-burgundy to-burgundy/60 transition-all"
                      style={{ height: `${Math.max(8, (item.total / maxMonthly) * 140)}px` }}
                    />
                    <span className="text-[10px] text-muted">{item.month}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No data yet" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.upcoming_events.length ? (
              data.upcoming_events.map((event) => (
                <Link key={event.id} href={`/admin/events/${event.id}/edit`} className="flex items-center gap-3 rounded-lg border border-burgundy/10 p-2.5 transition-colors hover:bg-cream">
                  <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-burgundy text-white">
                    <span className="font-display text-base font-bold leading-none">{new Date(event.start_date).getDate()}</span>
                    <span className="text-[9px] uppercase text-gold-light">{new Date(event.start_date).toLocaleDateString("en-GB", { month: "short" })}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-burgundy-800">{event.title}</span>
                    <span className="block truncate text-[11px] text-muted">{event.location ?? "—"}</span>
                  </span>
                </Link>
              ))
            ) : (
              <EmptyState title="No upcoming events" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
