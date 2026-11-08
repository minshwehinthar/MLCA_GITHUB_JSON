"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { buildQuery, withLocale } from "@/lib/api";
import type { EventItem } from "@/lib/types";
import { useLocale } from "@/providers/locale-provider";
import { PageHero } from "@/components/site/page-hero";
import { EventCard } from "@/components/site/cards";
import { ErrorState, LoadingGrid } from "@/components/site/content-states";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { SearchField } from "@/components/site/search-field";

const periods = [
  { value: "upcoming", label: "upcoming" },
  { value: "past", label: "past" },
  { value: "", label: "all" },
] as const;

export default function EventsPage() {
  const { locale, t } = useLocale();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<string>("upcoming");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const path = useMemo(
    () => withLocale(`/events${buildQuery({ search: query || undefined, period: period || undefined, page, per_page: 9 })}`, locale),
    [locale, query, period, page]
  );

  const { data, meta, loading, error, refetch } = useApi<EventItem[]>(path);

  return (
    <div>
      <PageHero
        title={t("events")}
        description="Cultural festivals, ceremonies, competitions and gatherings organized by the association."
        breadcrumb={[{ label: t("events") }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-1 rounded-lg bg-cream-dark p-1">
            {periods.map((item) => (
              <button
                key={item.value || "all"}
                type="button"
                onClick={() => { setPeriod(item.value); setPage(1); }}
                className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${period === item.value ? "bg-white text-burgundy shadow-sm" : "text-muted hover:text-burgundy"}`}
              >
                {t(item.label)}
              </button>
            ))}
          </div>
          <SearchField value={search} onChange={setSearch} className="lg:max-w-xs" />
        </div>

        {loading ? (
          <LoadingGrid count={6} className="grid gap-4" />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : data?.length ? (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              {data.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
            <Pagination meta={meta} onPageChange={setPage} className="mt-10" />
          </>
        ) : (
          <EmptyState title={t("noData")} icon={CalendarDays} />
        )}
      </div>
    </div>
  );
}
