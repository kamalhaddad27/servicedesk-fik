"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getTickets } from "@/lib/action/ticket.action";
import { PageTitle } from "@/components/ui/page-title";
import { TicketList } from "@/components/tickets/ticket-list";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PriorityTicket, StatusTicket, Ticket } from "@prisma/client";
import { PaginationControls } from "@/components/ui/pagination";
import { TicketFilters } from "@/components/tickets/ticket-filter";
import { TicketQuickFilters } from "@/components/tickets/ticket-quick-filters";
import { useSession } from "@/context/SessionContext";

// Tipe untuk data tiket yang akan disimpan di state
type TicketData = Ticket & {
  user: { name: string | null };
  assignedTo: { name: string | null } | null;
  category: { name: string };
};

function TicketsPageClient() {
  const { user: currentUser } = useSession();
  const searchParams = useSearchParams();
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
  const categoryId = searchParams.get("categoryId") || undefined;
  const assignment = searchParams.get("assignment") as
    | "me"
    | "unassigned"
    | undefined;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await getTickets({
          page,
          query,
          status,
          priority,
          categoryId,
          assignment,
        });
        setTickets(result.data);
        setPagination({
          totalPages: result.totalPages,
          totalItems: result.totalItems,
        });
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [assignment, categoryId, page, priority, query, searchParams, status]);

  const pageTitle =
    currentUser?.role === "dosen" || currentUser?.role === "mahasiswa"
      ? "Tiket Saya"
      : "Daftar Tiket";
  const pageDescription =
    currentUser?.role === "dosen" || currentUser?.role === "mahasiswa"
      ? "Lihat semua riwayat tiket yang pernah Anda buat."
      : "Kelola dan pantau semua tiket dalam sistem.";

  return (
    <div className="space-y-6">
      <PageTitle title={pageTitle} description={pageDescription} />

      {(currentUser?.role === "admin" || currentUser?.role === "staff") && (
        <TicketQuickFilters />
      )}

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

export default function TicketsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <TicketsPageClient />
    </Suspense>
  );
}
