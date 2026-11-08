"use client";

import { useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { buildQuery, withLocale } from "@/lib/api";
import type { Member } from "@/lib/types";
import { useLocale } from "@/providers/locale-provider";
import { PageHero } from "@/components/site/page-hero";
import { MemberCard } from "@/components/site/cards";
import { ErrorState, LoadingGrid } from "@/components/site/content-states";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { SearchField } from "@/components/site/search-field";
import { Select } from "@/components/ui/select";

export default function MembersPage() {
  const { locale, t } = useLocale();
  const [tab, setTab] = useState<"all" | "executive">("executive");
  const [year, setYear] = useState("");
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

  const { data: years } = useApi<string[]>("/members/years");

  const path = useMemo(
    () =>
      withLocale(
        `/members${buildQuery({
          search: query || undefined,
          executive: tab === "executive" ? 1 : undefined,
          academic_year: year || undefined,
          page,
          per_page: 12,
        })}`,
        locale
      ),
    [locale, query, tab, year, page]
  );

  const { data, meta, loading, error, refetch } = useApi<Member[]>(path);

  return (
    <div>
      <PageHero
        title={t("members")}
        description="Meet the dedicated students and leaders who make our association thrive."
        breadcrumb={[{ label: t("members") }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1 rounded-lg bg-cream-dark p-1">
            <button
              type="button"
              onClick={() => { setTab("executive"); setPage(1); }}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${tab === "executive" ? "bg-white text-burgundy shadow-sm" : "text-muted hover:text-burgundy"}`}
            >
              {t("executiveCommittee")}
            </button>
            <button
              type="button"
              onClick={() => { setTab("all"); setPage(1); }}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${tab === "all" ? "bg-white text-burgundy shadow-sm" : "text-muted hover:text-burgundy"}`}
            >
              {t("allMembers")}
            </button>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select
              value={year}
              onChange={(event) => { setYear(event.target.value); setPage(1); }}
              className="sm:w-48"
              aria-label="Filter by year"
            >
              <option value="">All years / terms</option>
              {(years ?? []).map((item) => <option key={item} value={item}>{item}</option>)}
            </Select>
            <SearchField value={search} onChange={setSearch} className="sm:max-w-xs" />
          </div>
        </div>

        {loading ? (
          <LoadingGrid count={6} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : data?.length ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.map((member) => <MemberCard key={member.id} member={member} />)}
            </div>
            <Pagination meta={meta} onPageChange={setPage} className="mt-10" />
          </>
        ) : (
          <EmptyState title={t("noData")} icon={Users} />
        )}
      </div>
    </div>
  );
}
