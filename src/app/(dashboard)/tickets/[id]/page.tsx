"use client";

import { useParams } from "next/navigation";
import { TicketDetail } from "@/components/tickets/ticket-detail";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = Array.isArray(params.id) ? params.id[0] : params.id;

  if (!ticketId) {
    return <LoadingSpinner />;
  }

  return <TicketDetail ticketId={ticketId} />;
}
