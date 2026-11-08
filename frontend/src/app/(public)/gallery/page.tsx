"use client";

import { useEffect, useMemo, useState } from "react";
import { Images } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { buildQuery, withLocale } from "@/lib/api";
import type { GalleryAlbum } from "@/lib/types";
import { useLocale } from "@/providers/locale-provider";
import { PageHero } from "@/components/site/page-hero";
import { AlbumCard } from "@/components/site/cards";
import { ErrorState, LoadingGrid } from "@/components/site/content-states";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { SearchField } from "@/components/site/search-field";

export default function GalleryPage() {
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
    () => withLocale(`/gallery/albums${buildQuery({ search: query || undefined, page, per_page: 9 })}`, locale),
    [locale, query, page]
  );

  const { data, meta, loading, error, refetch } = useApi<GalleryAlbum[]>(path);

  return (
    <div>
      <PageHero
        title={t("gallery")}
        description="A visual journey through our festivals, activities and memorable moments."
        breadcrumb={[{ label: t("gallery") }]}
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
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((album) => <AlbumCard key={album.id} album={album} />)}
            </div>
            <Pagination meta={meta} onPageChange={setPage} className="mt-10" />
          </>
        ) : (
          <EmptyState title={t("noData")} icon={Images} />
        )}
      </div>
    </div>
  );
}
