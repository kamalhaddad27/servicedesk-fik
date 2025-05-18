import { PageTitle } from "@/components/ui/page-title"
import { TicketForm } from "@/components/tickets/ticket-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Buat Tiket - Service Desk FIK",
  description: "Buat tiket baru di Service Desk FIK",
}

export default function CreateTicketPage() {
  return (
    <div className="space-y-6">
      <PageTitle title="Buat Tiket Baru" description="Buat tiket baru untuk melaporkan masalah atau permintaan." />
      <TicketForm />
    </div>
  )
}
