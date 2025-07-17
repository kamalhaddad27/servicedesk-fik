"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Ticket,
  TicketMessage,
  StatusTicket,
  PriorityTicket,
} from "@prisma/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TicketHeader } from "./ticket-header";
import { TicketMainCard } from "./ticket-main-card";
import { TicketInfoCard } from "./ticket-info-card";
import { useSession } from "@/context/SessionContext";
import { getTicketById } from "@/lib/action/ticket.action";
import { getAvailableStaff } from "@/lib/action/user.action";
import {
  updateTicketDetails,
  UpdateTicketPayload,
} from "@/lib/action/ticket-update.action";

export type FullTicket = Ticket & {
  user: { name: string | null; email: string | null };
  assignedTo: { name: string | null; email: string | null } | null;
  message: (TicketMessage & { user: { name: string | null; role: string } })[];
  category: { name: string };
  subcategory: { name: string };
};

export function TicketDetail({ ticketId }: { ticketId: string }) {
  const { user: currentUser } = useSession();
  const [ticket, setTicket] = useState<FullTicket | null>(null);
  const [staffList, setStaffList] = useState<
    { id: string; name: string | null }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [draftStatus, setDraftStatus] = useState<StatusTicket | undefined>();
  const [draftPriority, setDraftPriority] = useState<
    PriorityTicket | undefined
  >();
  const [draftAssigneeId, setDraftAssigneeId] = useState<
    string | null | undefined
  >();

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      const [fetchedTicket, availableStaff] = await Promise.all([
        getTicketById(ticketId),
        getAvailableStaff(),
      ]);
      setTicket(fetchedTicket as FullTicket);
      setStaffList(availableStaff);
      setIsLoading(false);
    };
    fetchInitialData();
  }, [ticketId]);

  useEffect(() => {
    if (ticket) {
      setDraftStatus(ticket.status);
      setDraftPriority(ticket.priority);
      setDraftAssigneeId(ticket.assignedToId);
    }
  }, [ticket]);

  // Handler utama untuk menyimpan semua perubahan
  const handleUpdateTicket = async () => {
    if (!ticket) return;
    setIsUpdating(true);

    const payload: UpdateTicketPayload = {};
    if (draftStatus !== ticket.status) payload.status = draftStatus;
    if (draftPriority !== ticket.priority) payload.priority = draftPriority;
    if (draftAssigneeId !== ticket.assignedToId)
      payload.assignedToId = draftAssigneeId ?? "";

    if (Object.keys(payload).length === 0) {
      toast.info("Tidak ada perubahan untuk disimpan.");
      setIsUpdating(false);
      return;
    }

    const result = await updateTicketDetails({
      ticketId: ticket.id,
      payload,
    });

    if (result.success && result.data) {
      toast.success(result.message);
      setTicket(result.data as FullTicket);
      window.location.reload();
    } else {
      toast.error(result.message);
    }
    setIsUpdating(false);
  };

  if (isLoading) return <LoadingSpinner />;
  if (!ticket)
    return <div>Tiket tidak ditemukan atau Anda tidak memiliki hak akses.</div>;

  const canEdit =
    currentUser?.role === "admin" || currentUser?.id === ticket.assignedToId;
  const isDirty =
    draftStatus !== ticket.status ||
    draftPriority !== ticket.priority ||
    draftAssigneeId !== ticket.assignedToId;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <TicketHeader />
      <div className="grid gap-6 items-start md:grid-cols-3">
        <TicketMainCard ticket={ticket} />
        <TicketInfoCard
          ticket={ticket}
          canEdit={canEdit}
          currentUser={currentUser}
          isUpdating={isUpdating}
          isDirty={isDirty}
          staffList={staffList}
          draftStatus={draftStatus}
          draftPriority={draftPriority}
          draftAssigneeId={draftAssigneeId}
          setDraftStatus={setDraftStatus}
          setDraftPriority={setDraftPriority}
          setDraftAssigneeId={setDraftAssigneeId}
          onUpdate={handleUpdateTicket}
        />
      </div>
    </motion.div>
  );
}
