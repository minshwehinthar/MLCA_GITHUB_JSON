"use client";

import { useParams } from "next/navigation";
import { EventForm } from "@/components/admin/forms/event-form";

export default function EditEventPage() {
  const params = useParams<{ id: string }>();
  return <EventForm id={Number(params?.id)} />;
}
