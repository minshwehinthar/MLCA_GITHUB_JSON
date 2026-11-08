"use client";

import { BookOpen, Compass, Flag, Target } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { withLocale } from "@/lib/api";
import type { Achievement, Page } from "@/lib/types";
import { useLocale } from "@/providers/locale-provider";
import { PageHero } from "@/components/site/page-hero";
import { AchievementCard } from "@/components/site/cards";
import { ErrorState, PageSpinner } from "@/components/site/content-states";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/site/section-heading";

export default function AboutPage() {
  const { locale, t } = useLocale();
  const page = useApi<Page>(withLocale("/pages/about", locale));
  const achievements = useApi<Achievement[]>(withLocale("/achievements", locale));

  return (
    <div>
      <PageHero
        title={page.data?.title ?? t("about")}
        description={page.data?.excerpt}
        breadcrumb={[{ label: t("about") }]}
      />

      {page.loading ? (
        <PageSpinner />
      ) : page.error ? (
        <div className="mx-auto max-w-3xl px-4 py-16">
          <ErrorState message={page.error} onRetry={page.refetch} />
        </div>
      ) : page.data ? (
        <div className="mx-auto max-w-7xl px-4 py-14">
          {page.data.content && (
            <div className="rich-content mx-auto max-w-4xl" dangerouslySetInnerHTML={{ __html: page.data.content }} />
          )}

          {page.data.history && (
            <section className="mt-14 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-3xl bg-burgundy p-8 text-white">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-gold">
                  <BookOpen className="h-6 w-6" />
                </span>
                <h2 className="mt-5 font-display text-2xl font-bold">Our History</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  A journey of passion, culture and community — discover how MLCA grew from a small circle of students into a vibrant cultural family.
                </p>
              </div>
              <div className="rich-content" dangerouslySetInnerHTML={{ __html: page.data.history }} />
            </section>
          )}

          <section className="mt-14 grid gap-6 md:grid-cols-2">
            {page.data.vision && (
              <div className="rounded-2xl border border-burgundy/10 bg-white p-7 shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/15 text-gold"><Compass className="h-5 w-5" /></span>
                <h2 className="mt-4 font-display text-xl font-bold text-burgundy-800">Our Vision</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{page.data.vision}</p>
              </div>
            )}
            {page.data.mission && (
              <div className="rounded-2xl border border-burgundy/10 bg-white p-7 shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/15 text-gold"><Flag className="h-5 w-5" /></span>
                <h2 className="mt-4 font-display text-xl font-bold text-burgundy-800">Our Mission</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{page.data.mission}</p>
              </div>
            )}
          </section>

          {page.data.objectives && (
            <section className="mt-14 rounded-3xl bg-cream-dark/60 p-8 md:p-10">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-burgundy text-gold"><Target className="h-5 w-5" /></span>
                <h2 className="font-display text-2xl font-bold text-burgundy-800">Our Objectives</h2>
              </div>
              <div className="rich-content" dangerouslySetInnerHTML={{ __html: page.data.objectives }} />
            </section>
          )}

          <section className="mt-16">
            <SectionHeading eyebrow="Milestones" title={t("achievements")} align="center" />
            {achievements.loading ? (
              <PageSpinner />
            ) : achievements.data?.length ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {achievements.data.map((achievement) => <AchievementCard key={achievement.id} achievement={achievement} />)}
              </div>
            ) : (
              <EmptyState title={t("noData")} />
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
