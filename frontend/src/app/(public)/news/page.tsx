"use client";

import { useEffect, useMemo, useState } from "react";
import { Newspaper } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { buildQuery, withLocale } from "@/lib/api";
import type { Category, Post } from "@/lib/types";
import { useLocale } from "@/providers/locale-provider";
import { PageHero } from "@/components/site/page-hero";
import { PostCard } from "@/components/site/cards";
import { ErrorState, LoadingGrid } from "@/components/site/content-states";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { SearchField } from "@/components/site/search-field";
import { Select } from "@/components/ui/select";

export default function NewsPage() {
  const { locale, t } = useLocale();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const categories = useApi<Category[]>(withLocale("/categories", locale));

  const path = useMemo(
    () =>
      withLocale(
        `/posts${buildQuery({ search: query || undefined, category: category || undefined, page, per_page: 9 })}`,
        locale
      ),
    [locale, query, category, page]
  );

  const { data, meta, loading, error, refetch } = useApi<Post[]>(path);

  const filteredCategories = categories.data?.filter((item) => ["post", "announcement"].includes(item.type)) ?? [];

  return (
    <div>
      <PageHero
        title={t("news")}
        description="Stories, updates and official announcements from the association."
        breadcrumb={[{ label: t("news") }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchField value={search} onChange={setSearch} className="sm:max-w-xs" />
          <Select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
            className="sm:w-56"
          >
            <option value="">{t("all")} {t("category")}</option>
            {filteredCategories.map((item) => (
              <option key={item.id} value={item.slug}>{item.name}</option>
            ))}
          </Select>
        </div>

        {loading ? (
          <LoadingGrid count={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : data?.length ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((post) => <PostCard key={post.id} post={post} />)}
            </div>
            <Pagination meta={meta} onPageChange={setPage} className="mt-10" />
          </>
        ) : (
          <EmptyState title={t("noData")} icon={Newspaper} />
        )}
      </div>
    </div>
  );
}
