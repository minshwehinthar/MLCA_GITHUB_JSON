"use client";

import { useParams } from "next/navigation";
import { GalleryForm } from "@/components/admin/forms/gallery-form";

export default function EditAlbumPage() {
  const params = useParams<{ id: string }>();
  return <GalleryForm id={Number(params?.id)} />;
}
