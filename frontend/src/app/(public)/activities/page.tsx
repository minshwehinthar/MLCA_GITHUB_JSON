"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { buildQuery, withLocale } from "@/lib/api";
import type { Activity } from "@/lib/types";
import { useLocale } from "@/providers/locale-provider";
import { PageHero } from "@/components/site/page-hero";
import { ActivityCard } from "@/components/site/cards";
import { ErrorState, LoadingGrid } from "@/components/site/content-states";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { SearchField } from "@/components/site/search-field";

const statuses = ["", "upcoming", "ongoing", "completed"] as const;

export default function ActivitiesPage() {
  const { locale, t } = useLocale();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const path = useMemo(
    () => withLocale(`/activities${buildQuery({ search: query || undefined, status: status || undefined, page, per_page: 9 })}`, locale),
    [locale, query, status, page]
  );

  const { data, meta, loading, error, refetch } = useApi<Activity[]>(path);

  return (
    <div>
      <PageHero
        title={t("activities")}
        description="Programs, cultural projects and community initiatives organized by MLCA."
        breadcrumb={[{ label: t("activities") }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-lg bg-cream-dark p-1">
            {statuses.map((item) => (
              <button
                key={item || "all"}
                type="button"
                onClick={() => { setStatus(item); setPage(1); }}
                className={`whitespace-nowrap rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  status === item ? "bg-white text-burgundy shadow-sm" : "text-muted hover:text-burgundy"
                }`}
              >
                {item ? t(item as "upcoming") : t("all")}
              </button>
            ))}
          </div>
          <SearchField value={search} onChange={setSearch} className="lg:max-w-xs" />
        </div>

        {loading ? (
          <LoadingGrid count={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : data?.length ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((activity) => <ActivityCard key={activity.id} activity={activity} />)}
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
