"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getRelatedTickets } from "@/lib/action/ticket.action";
import { Ticket } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { getTicketPriorityColor, getTicketStatusColor } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

type TicketWithCategory = Ticket & {
  category: { name: string };
};

export function UserTicketsTab({ userId }: { userId: string }) {
  const [tickets, setTickets] = useState<TicketWithCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      const result = await getRelatedTickets(userId);
      if (result.success) {
        setTickets(result.data as TicketWithCategory[]);
      }
      setIsLoading(false);
    };
    fetchTickets();
  }, [userId]);

  if (isLoading) {
    return <LoadingSpinner className="mt-4" />;
  }

  if (tickets.length === 0) {
    return (
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Tidak ada tiket terkait.
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className="flex items-center justify-between rounded-md border p-3"
        >
          <div className="space-y-1">
            <Link
              href={`/tickets/${ticket.id}`}
              className="font-medium hover:underline"
            >
              {ticket.subject}
            </Link>
            <p className="text-xs text-muted-foreground">
              #{ticket.id.slice(-6).toUpperCase()} • {ticket.category.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getTicketStatusColor(ticket.status)}>
              {ticket.status}
            </Badge>
            <Badge className={getTicketPriorityColor(ticket.priority)}>
              {ticket.priority}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
