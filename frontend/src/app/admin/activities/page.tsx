"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { buildQuery } from "@/lib/api";
import type { Activity } from "@/lib/types";
import { formatShortDate, statusColor, storageUrl } from "@/lib/utils";
import { PageHeader } from "@/components/admin/form-parts";
import { DeleteButton, EmptyRow, ListToolbar, Thumb, useDebouncedValue } from "@/components/admin/list-helpers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { ErrorState } from "@/components/site/content-states";

export default function AdminActivitiesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const query = useDebouncedValue(search);

  const path = useMemo(
    () => `/admin/activities${buildQuery({ search: query || undefined, status: status || undefined, page, per_page: 12 })}`,
    [query, status, page]
  );

  const { data, meta, loading, error, refetch } = useApi<Activity[]>(path);

  return (
    <div>
      <PageHeader
        title="Activities"
        description="Manage programs, projects and initiatives."
        action={<Button asChild><Link href="/admin/activities/new"><Plus /> New Activity</Link></Button>}
      />

      <ListToolbar search={search} onSearch={(value) => { setSearch(value); setPage(1); }}>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-40">
          <option value="">All statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
        </Select>
      </ListToolbar>

      <div className="overflow-hidden rounded-2xl border border-burgundy/10 bg-white shadow-sm">
        {loading ? <TableSkeleton /> : error ? (
          <div className="p-4"><ErrorState message={error} onRetry={refetch} /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.length ? data.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Thumb src={storageUrl(activity.cover_image || activity.cover_path)} alt={activity.title} className="h-11 w-14" />
                      <div className="min-w-0">
                        <p className="max-w-[320px] truncate font-semibold text-burgundy-800">{activity.title}</p>
                        <p className="text-[11px] text-muted">{activity.category?.name ?? activity.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge className={`capitalize ${statusColor(activity.status)}`}>{activity.status}</Badge></TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted">{formatShortDate(activity.start_date)}</TableCell>
                  <TableCell className="max-w-[180px] truncate text-xs text-muted">{activity.location ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="icon-sm" title="Edit"><Link href={`/admin/activities/${activity.id}/edit`}><Pencil /></Link></Button>
                      <DeleteButton endpoint={`/admin/activities/${activity.id}`} name={`“${activity.title}”`} onDeleted={refetch} />
                    </div>
                  </TableCell>
                </TableRow>
              )) : <EmptyRow colSpan={5} title="No activities found" />}
            </TableBody>
          </Table>
        )}
      </div>

      <Pagination meta={meta} onPageChange={setPage} className="mt-5" />
    </div>
  );
}
