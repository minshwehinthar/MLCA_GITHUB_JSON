"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Images, Pencil, Plus } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { buildQuery } from "@/lib/api";
import type { GalleryAlbum } from "@/lib/types";
import { formatShortDate, storageUrl } from "@/lib/utils";
import { PageHeader } from "@/components/admin/form-parts";
import { DeleteButton, EmptyRow, ListToolbar, Thumb, useDebouncedValue } from "@/components/admin/list-helpers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { ErrorState } from "@/components/site/content-states";

export default function AdminGalleryPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const query = useDebouncedValue(search);

  const path = useMemo(
    () => `/admin/gallery/albums${buildQuery({ search: query || undefined, page, per_page: 12 })}`,
    [query, page]
  );

  const { data, meta, loading, error, refetch } = useApi<GalleryAlbum[]>(path);

  return (
    <div>
      <PageHeader
        title="Gallery"
        description="Manage photo albums and images."
        action={<Button asChild><Link href="/admin/gallery/new"><Plus /> New Album</Link></Button>}
      />

      <ListToolbar search={search} onSearch={(value) => { setSearch(value); setPage(1); }} />

      <div className="overflow-hidden rounded-2xl border border-burgundy/10 bg-white shadow-sm">
        {loading ? <TableSkeleton /> : error ? (
          <div className="p-4"><ErrorState message={error} onRetry={refetch} /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Album</TableHead>
                <TableHead>Photos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.length ? data.map((album) => (
                <TableRow key={album.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Thumb src={storageUrl(album.cover_image || album.images?.[0]?.url || album.cover_path)} alt={album.title} className="h-11 w-14" />
                      <div className="min-w-0">
                        <p className="max-w-[320px] truncate font-semibold text-burgundy-800">{album.title}</p>
                        <p className="text-[11px] text-muted">{album.category?.name ?? album.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary" className="gap-1"><Images className="h-3 w-3" />{album.images_count}</Badge></TableCell>
                  <TableCell><Badge className={album.is_published ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-stone-200 text-stone-700 border-stone-300"}>{album.is_published ? "Published" : "Draft"}</Badge></TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted">{formatShortDate(album.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="icon-sm" title="Edit"><Link href={`/admin/gallery/${album.id}/edit`}><Pencil /></Link></Button>
                      <DeleteButton endpoint={`/admin/gallery/albums/${album.id}`} name={`“${album.title}”`} onDeleted={refetch} />
                    </div>
                  </TableCell>
                </TableRow>
              )) : <EmptyRow colSpan={5} title="No albums found" />}
            </TableBody>
          </Table>
        )}
      </div>

      <Pagination meta={meta} onPageChange={setPage} className="mt-5" />
    </div>
  );
}
