"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  FileText,
  GraduationCap,
  HandHeart,
  Images,
  Play,
  Sparkles,
  Users,
} from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { withLocale } from "@/lib/api";
import type { HomeData } from "@/lib/types";
import { useLocale } from "@/providers/locale-provider";
import { storageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/section-heading";
import {
  AchievementCard,
  ActivityCard,
  AlbumCard,
  DocumentRow,
  EventCard,
  MemberCard,
  PostCard,
  StatBar,
  VideoCard,
} from "@/components/site/cards";
import { ErrorState, PageSpinner } from "@/components/site/content-states";
import { EmptyState } from "@/components/ui/empty-state";

export default function HomePage() {
  const { locale, t } = useLocale();
  const { data, loading, error, refetch } = useApi<HomeData>(withLocale("/home", locale));

  if (loading) return <PageSpinner />;
  if (error || !data) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorState message={error} onRetry={refetch} /></div>;

  const { settings, stats } = data;
  const heroImage = storageUrl(settings.hero_image || settings.hero_background);
  const aboutImage = storageUrl(settings.about_image);
  const news = data.latest_announcements.length ? data.latest_announcements : data.recent_posts;

  const pillars = [
    { icon: BookOpen, title: "Preserve Heritage", text: "Keeping Mon literature, language and traditional arts alive for future generations." },
    { icon: GraduationCap, title: "Support Education", text: "Encouraging academic excellence, leadership and lifelong learning among members." },
    { icon: HandHeart, title: "Serve Community", text: "Building unity through cultural events, outreach and meaningful partnerships." },
  ];

  return (
    <div>
      <section className="relative overflow-hidden bg-burgundy-900">
        {heroImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        )}
        <div className="hero-pattern absolute inset-0" />
        <div className="mon-pattern absolute inset-0 opacity-20" />
        <div className="relative mx-auto max-w-7xl px-4 pb-28 pt-20 text-white md:pb-36 md:pt-28">
          <div className="max-w-3xl animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-light">
              <Sparkles className="h-3.5 w-3.5" />
              {settings.university_name ?? "University of Computer Studies - Hpa-An"}
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight md:text-6xl">
              {settings.hero_title ?? settings.site_name ?? "Mon Literature and Culture Association"}
            </h1>
            <p className="mt-3 text-lg font-medium text-gold-light md:text-xl">
              {settings.hero_subtitle ?? settings.site_tagline}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70 md:text-base">
              {settings.hero_description ?? settings.site_description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="gold">
                <Link href={settings.hero_cta_url || "/activities"}>
                  {settings.hero_cta_label || t("activities")}
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Link href="/about">{t("about")}</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="relative mx-auto max-w-7xl px-4 pb-16">
          <StatBar
            stats={[
              { label: t("news"), value: stats.posts, icon: BookOpen },
              { label: t("activities"), value: stats.activities, icon: CalendarDays },
              { label: t("members"), value: stats.members, icon: Users },
              { label: t("gallery"), value: stats.gallery_images, icon: Images },
            ]}
          />
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-2">
          <div className="relative">
            {aboutImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={aboutImage} alt="About MLCA" className="h-[340px] w-full rounded-3xl object-cover shadow-xl" />
            ) : (
              <div className="flex h-[340px] w-full items-center justify-center rounded-3xl bg-burgundy">
                <BookOpen className="h-16 w-16 text-gold/60" />
              </div>
            )}
            <div className="absolute -bottom-6 right-2 z-10 rounded-2xl bg-gold px-4 py-3 text-burgundy-900 shadow-lg sm:px-6 sm:py-4">
              <p className="font-display text-3xl font-bold">{settings.established_year ?? "2015"}</p>
              <p className="text-xs font-semibold uppercase tracking-wide">Established</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">{t("about")}</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-burgundy-800 md:text-4xl">
              {settings.home_about_title ?? "Rooted in Heritage, Growing Together"}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted md:text-base">
              {settings.about_excerpt ?? settings.site_description}
            </p>
            <div className="mt-6 space-y-4">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div key={pillar.title} className="flex gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-burgundy/10 text-burgundy">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-burgundy-800">{pillar.title}</p>
                      <p className="text-sm text-muted">{pillar.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button asChild className="mt-6">
              <Link href="/about">{t("readMore")}<ArrowRight /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionHeading eyebrow="Stay Updated" title={t("latestNews")} href="/news" />
        {news.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.slice(0, 6).map((post) => <PostCard key={post.id} post={post} />)}
          </div>
        ) : (
          <EmptyState title={t("noData")} />
        )}
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading eyebrow="Get Involved" title={t("upcomingActivities")} href="/activities" />
              {data.upcoming_activities.length ? (
                <div className="grid gap-5 sm:grid-cols-2">
                  {data.upcoming_activities.slice(0, 4).map((activity) => <ActivityCard key={activity.id} activity={activity} />)}
                </div>
              ) : (
                <EmptyState title={t("noData")} icon={CalendarDays} />
              )}
            </div>
            <div>
              <SectionHeading eyebrow="Mark Your Calendar" title={t("upcomingEvents")} href="/events" />
              {data.upcoming_events.length ? (
                <div className="space-y-4">
                  {data.upcoming_events.map((event) => <EventCard key={event.id} event={event} />)}
                </div>
              ) : (
                <EmptyState title={t("noData")} icon={CalendarDays} />
              )}
              {data.recent_events.length > 0 && (
                <div className="mt-8">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gold">{t("recentEvents")}</h3>
                  <div className="space-y-3">
                    {data.recent_events.map((event) => <EventCard key={event.id} event={event} />)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionHeading eyebrow="Memories" title={t("photoGallery")} href="/gallery" />
        {data.gallery.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.gallery.slice(0, 6).map((album) => <AlbumCard key={album.id} album={album} />)}
          </div>
        ) : (
          <EmptyState title={t("noData")} icon={Images} />
        )}
      </section>

      <section className="relative overflow-hidden bg-burgundy-900 py-16 text-white">
        <div className="mon-pattern absolute inset-0 opacity-20" />
        <div className="relative mx-auto max-w-7xl px-4">
          <SectionHeading eyebrow="Watch & Learn" title={t("videoGallery")} href="/videos" invert />
          {data.videos.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.videos.map((video) => <VideoCard key={video.id} video={video} />)}
            </div>
          ) : (
            <EmptyState title={t("noData")} icon={Play} />
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Resources" title={t("importantDocuments")} href="/documents" />
            {data.documents.length ? (
              <div className="space-y-3">
                {data.documents.map((document) => <DocumentRow key={document.id} document={document} />)}
              </div>
            ) : (
              <EmptyState title={t("noDocuments")} icon={FileText} />
            )}
          </div>
          <div>
            <SectionHeading eyebrow="Milestones" title={t("achievements")} />
            {data.achievements.length ? (
              <div className="space-y-4">
                {data.achievements.slice(0, 4).map((achievement) => <AchievementCard key={achievement.id} achievement={achievement} />)}
              </div>
            ) : (
              <EmptyState title={t("noData")} />
            )}
          </div>
        </div>
      </section>

      <section className="bg-cream-dark/60 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading eyebrow={`Current Academic Year ${data.current_academic_year}`} title={t("executiveCommittee")} href="/members" description={`Showing the ${data.current_academic_year} committee. Browse all past committees on the members page.`} align="center" />
          {data.executives.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {data.executives.map((member) => <MemberCard key={member.id} member={member} />)}
            </div>
          ) : (
            <EmptyState title={t("noData")} />
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="hero-pattern overflow-hidden rounded-3xl bg-burgundy px-8 py-12 text-center text-white shadow-xl md:px-16">
          <h2 className="font-display text-3xl font-bold md:text-4xl">{t("contactTitle")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/70">
            Join us in celebrating and preserving Mon literature and culture. Reach out for membership, partnerships or inquiries.
          </p>
          <Button asChild size="lg" variant="gold" className="mt-6">
            <Link href="/contact">{t("contact")}<ArrowRight /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
