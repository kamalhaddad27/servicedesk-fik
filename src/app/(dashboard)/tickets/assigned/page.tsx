"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getAssignedTickets } from "@/lib/action/ticket.action";
import { PriorityTicket, StatusTicket, Ticket, User } from "@prisma/client";
import { PageTitle } from "@/components/ui/page-title";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TicketList } from "@/components/tickets/ticket-list";
import { TicketFilters } from "@/components/tickets/TicketFilter";
import { PaginationControls } from "@/components/ui/pagination";

// Tipe untuk data tiket yang akan disimpan di state
type TicketData = Ticket & {
  user: { name: string | null };
  assignedTo: { name: string | null } | null;
  category: { name: string };
};

function AssignedTicketsPageClient() {
  const searchParams = useSearchParams();

  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [pagination, setPagination] = useState({
    totalPages: 0,
    totalItems: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = Number(searchParams.get("page")) || 1;
  const query = searchParams.get("query") || undefined;
  const status = (searchParams.get("status") as StatusTicket) || undefined;
  const priority =
    (searchParams.get("priority") as PriorityTicket) || undefined;
  const categoryId = searchParams.get("categoryId") || undefined;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getAssignedTickets({
          page,
          query,
          status,
          priority,
          categoryId,
        });
        setTickets(result.data as TicketData[]);
        setPagination({
          totalPages: result.totalPages,
          totalItems: result.totalItems,
        });
      } catch (err: any) {
        setError(err.message);
        setTickets([]); // Kosongkan data jika error
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchParams, page, query, status, priority, categoryId]);

  return (
    <div className="space-y-6">
      <PageTitle
        title="Tiket Ditugaskan kepada Saya"
        description="Daftar semua tiket yang menjadi tanggung jawab Anda."
      />

      <TicketFilters />

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-center py-10 text-red-500">
          <p>Error: {error}</p>
        </div>
      ) : (
        <>
          <TicketList tickets={tickets} />
          <PaginationControls
            currentPage={page}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsOnPage={tickets.length}
          />
        </>
      )}
    </div>
  );
}

export default function AssignedTicketsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AssignedTicketsPageClient />
    </Suspense>
  );
}
