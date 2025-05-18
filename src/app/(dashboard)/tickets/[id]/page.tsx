"use client"

import { useParams } from "next/navigation"
import { TicketDetail } from "@/components/tickets/ticket-detail"

export default function TicketDetailPage() {
  const params = useParams()
  const ticketId = Number(params.id)

  return <TicketDetail ticketId={ticketId} />
}
