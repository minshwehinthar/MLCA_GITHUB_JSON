"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { buildQuery } from "@/lib/api";
import type { Video } from "@/lib/types";
import { formatShortDate, storageUrl } from "@/lib/utils";
import { PageHeader } from "@/components/admin/form-parts";
import { DeleteButton, EmptyRow, ListToolbar, Thumb, useDebouncedValue } from "@/components/admin/list-helpers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { ErrorState } from "@/components/site/content-states";

export default function AdminVideosPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const query = useDebouncedValue(search);

  const path = useMemo(
    () => `/admin/videos${buildQuery({ search: query || undefined, page, per_page: 12 })}`,
    [query, page]
  );

  const { data, meta, loading, error, refetch } = useApi<Video[]>(path);

  return (
    <div>
      <PageHeader
        title="Videos"
        description="Manage the video gallery."
        action={<Button asChild><Link href="/admin/videos/new"><Plus /> New Video</Link></Button>}
      />

      <ListToolbar search={search} onSearch={(value) => { setSearch(value); setPage(1); }} />

      <div className="overflow-hidden rounded-2xl border border-burgundy/10 bg-white shadow-sm">
        {loading ? <TableSkeleton /> : error ? (
          <div className="p-4"><ErrorState message={error} onRetry={refetch} /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Video</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.length ? data.map((video) => (
                <TableRow key={video.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Thumb src={storageUrl(video.thumbnail || video.thumbnail_path)} alt={video.title} className="h-11 w-16" />
                      <div className="min-w-0">
                        <p className="max-w-[320px] truncate font-semibold text-burgundy-800">{video.title}</p>
                        <p className="text-[11px] text-muted">{video.category?.name ?? video.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{video.type}</Badge></TableCell>
                  <TableCell><Badge className={video.is_published ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-stone-200 text-stone-700 border-stone-300"}>{video.is_published ? "Published" : "Draft"}</Badge></TableCell>
                  <TableCell className="text-xs text-muted">{video.views}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted">{formatShortDate(video.published_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="icon-sm" title="Edit"><Link href={`/admin/videos/${video.id}/edit`}><Pencil /></Link></Button>
                      <DeleteButton endpoint={`/admin/videos/${video.id}`} name={`“${video.title}”`} onDeleted={refetch} />
                    </div>
                  </TableCell>
                </TableRow>
              )) : <EmptyRow colSpan={6} title="No videos found" />}
            </TableBody>
          </Table>
        )}
      </div>

      <Pagination meta={meta} onPageChange={setPage} className="mt-5" />
    </div>
  );
}
