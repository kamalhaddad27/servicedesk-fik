"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getTickets } from "@/lib/action/ticket.action";
import { PageTitle } from "@/components/ui/page-title";
import { TicketList } from "@/components/tickets/ticket-list";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PriorityTicket, StatusTicket, Ticket } from "@prisma/client";
import { PaginationControls } from "@/components/ui/pagination";
import { TicketFilters } from "@/components/tickets/TicketFilter";

// Tipe untuk data tiket yang akan disimpan di state
type TicketData = Ticket & {
  user: { name: string | null };
  assignedTo: { name: string | null } | null;
};

// Wrapper Suspense untuk memastikan useSearchParams bekerja dengan benar
function TicketsPageClient() {
  const searchParams = useSearchParams();

  // State untuk menyimpan data, paginasi, dan status loading
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [pagination, setPagination] = useState({
    totalPages: 0,
    totalItems: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const page = Number(searchParams.get("page")) || 1;
  const query = searchParams.get("query") || undefined;
  const status = (searchParams.get("status") as StatusTicket) || undefined;
  const priority =
    (searchParams.get("priority") as PriorityTicket) || undefined;

  // useEffect akan berjalan setiap kali searchParams berubah
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await getTickets({ page, query, status, priority });
        setTickets(result.data);
        setPagination({
          totalPages: result.totalPages,
          totalItems: result.totalItems,
        });
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
        // Handle error jika perlu, misalnya dengan toast
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [page, priority, query, searchParams, status]); // <-- Kunci: effect ini bergantung pada searchParams

  return (
    <div className="space-y-6">
      <PageTitle
        title="Daftar Tiket"
        description="Kelola dan pantau semua tiket dalam sistem."
      />

      <TicketFilters />

      {isLoading ? (
        <LoadingSpinner />
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

// Komponen ekspor utama sekarang hanya membungkus dengan Suspense
export default function TicketsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <TicketsPageClient />
    </Suspense>
  );
}
