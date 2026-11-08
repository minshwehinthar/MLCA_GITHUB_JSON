"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { buildQuery, withLocale } from "@/lib/api";
import type { Category, DocumentItem } from "@/lib/types";
import { useLocale } from "@/providers/locale-provider";
import { PageHero } from "@/components/site/page-hero";
import { DocumentRow } from "@/components/site/cards";
import { ErrorState } from "@/components/site/content-states";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { SearchField } from "@/components/site/search-field";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentsPage() {
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

  const categories = useApi<Category[]>(withLocale("/categories?type=document", locale));

  const path = useMemo(
    () => withLocale(`/documents${buildQuery({ search: query || undefined, category: category || undefined, page, per_page: 12 })}`, locale),
    [locale, query, category, page]
  );

  const { data, meta, loading, error, refetch } = useApi<DocumentItem[]>(path);

  return (
    <div>
      <PageHero
        title={t("documents")}
        description="Official documents, reports, forms and resources available for download."
        breadcrumb={[{ label: t("documents") }]}
      />

      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchField value={search} onChange={setSearch} className="flex-1" />
          <Select
            value={category}
            onChange={(event) => { setCategory(event.target.value); setPage(1); }}
            className="sm:w-52"
          >
            <option value="">{t("all")} {t("category")}</option>
            {(categories.data ?? []).map((item) => (
              <option key={item.id} value={item.slug}>{item.name}</option>
            ))}
          </Select>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-20 w-full" />)}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : data?.length ? (
          <>
            <div className="space-y-3">
              {data.map((document) => <DocumentRow key={document.id} document={document} />)}
            </div>
            <Pagination meta={meta} onPageChange={setPage} className="mt-8" />
          </>
        ) : (
          <EmptyState title={t("noDocuments")} icon={FileText} />
        )}
      </div>
    </div>
  );
}
