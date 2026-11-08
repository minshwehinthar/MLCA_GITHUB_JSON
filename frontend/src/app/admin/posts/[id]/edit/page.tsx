"use client";

import { useParams } from "next/navigation";
import { PostForm } from "@/components/admin/forms/post-form";

export default function EditPostPage() {
  const params = useParams<{ id: string }>();
  return <PostForm id={Number(params?.id)} />;
}
