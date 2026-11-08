"use client";

import { useEffect, useMemo, useState } from "react";
import { Play } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { buildQuery, withLocale } from "@/lib/api";
import type { Video } from "@/lib/types";
import { useLocale } from "@/providers/locale-provider";
import { PageHero } from "@/components/site/page-hero";
import { VideoCard } from "@/components/site/cards";
import { ErrorState, LoadingGrid } from "@/components/site/content-states";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { SearchField } from "@/components/site/search-field";

export default function VideosPage() {
  const { locale, t } = useLocale();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const path = useMemo(
    () => withLocale(`/videos${buildQuery({ search: query || undefined, page, per_page: 9 })}`, locale),
    [locale, query, page]
  );

  const { data, meta, loading, error, refetch } = useApi<Video[]>(path);

  return (
    <div>
      <PageHero
        title={t("videos")}
        description="Watch cultural performances, documentaries and event highlights."
        breadcrumb={[{ label: t("videos") }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex justify-end">
          <SearchField value={search} onChange={setSearch} className="w-full sm:max-w-xs" />
        </div>

        {loading ? (
          <LoadingGrid count={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : data?.length ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((video) => <VideoCard key={video.id} video={video} />)}
            </div>
            <Pagination meta={meta} onPageChange={setPage} className="mt-10" />
          </>
        ) : (
          <EmptyState title={t("noData")} icon={Play} />
        )}
      </div>
    </div>
  );
}
