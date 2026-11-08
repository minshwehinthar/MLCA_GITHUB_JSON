"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Pencil, Plus } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { buildQuery } from "@/lib/api";
import type { DocumentItem } from "@/lib/types";
import { formatBytes, formatShortDate } from "@/lib/utils";
import { PageHeader } from "@/components/admin/form-parts";
import { DeleteButton, EmptyRow, ListToolbar, useDebouncedValue } from "@/components/admin/list-helpers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { ErrorState } from "@/components/site/content-states";

export default function AdminDocumentsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const query = useDebouncedValue(search);

  const path = useMemo(
    () => `/admin/documents${buildQuery({ search: query || undefined, page, per_page: 12 })}`,
    [query, page]
  );

  const { data, meta, loading, error, refetch } = useApi<DocumentItem[]>(path);

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Manage downloadable publications and forms."
        action={<Button asChild><Link href="/admin/documents/new"><Plus /> New Document</Link></Button>}
      />

      <ListToolbar search={search} onSearch={(value) => { setSearch(value); setPage(1); }} />

      <div className="overflow-hidden rounded-2xl border border-burgundy/10 bg-white shadow-sm">
        {loading ? <TableSkeleton /> : error ? (
          <div className="p-4"><ErrorState message={error} onRetry={refetch} /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.length ? data.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-burgundy/10 text-burgundy">
                        <FileText className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="max-w-[320px] truncate font-semibold text-burgundy-800">{document.title}</p>
                        <p className="text-[11px] text-muted">{document.category?.name ?? formatShortDate(document.created_at)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="uppercase">{document.extension}</Badge></TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted">{formatBytes(document.file_size)}</TableCell>
                  <TableCell className="text-xs text-muted">{document.downloads}</TableCell>
                  <TableCell><Badge className={document.is_published ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-stone-200 text-stone-700 border-stone-300"}>{document.is_published ? "Published" : "Draft"}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="icon-sm" title="Edit"><Link href={`/admin/documents/${document.id}/edit`}><Pencil /></Link></Button>
                      <DeleteButton endpoint={`/admin/documents/${document.id}`} name={`“${document.title}”`} onDeleted={refetch} />
                    </div>
                  </TableCell>
                </TableRow>
              )) : <EmptyRow colSpan={6} title="No documents found" />}
            </TableBody>
          </Table>
        )}
      </div>

      <Pagination meta={meta} onPageChange={setPage} className="mt-5" />
    </div>
  );
}
