"use client";

import { useParams } from "next/navigation";
import { VideoForm } from "@/components/admin/forms/video-form";

export default function EditVideoPage() {
  const params = useParams<{ id: string }>();
  return <VideoForm id={Number(params?.id)} />;
}
