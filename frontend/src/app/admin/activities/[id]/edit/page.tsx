"use client";

import { useParams } from "next/navigation";
import { ActivityForm } from "@/components/admin/forms/activity-form";

export default function EditActivityPage() {
  const params = useParams<{ id: string }>();
  return <ActivityForm id={Number(params?.id)} />;
}
