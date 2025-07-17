"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User2 } from "lucide-react";
import { FullTicket } from "./ticket-detail";
import { StatusTicket, PriorityTicket, User } from "@prisma/client";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TicketInfoCardProps {
  ticket: FullTicket;
  canEdit: boolean;
  isUpdating: boolean;
  isDirty: boolean;
  currentUser: User | null;
  staffList: { id: string; name: string | null }[];
  draftStatus?: StatusTicket;
  draftPriority?: PriorityTicket;
  draftAssigneeId?: string | null;
  setDraftStatus: (status: StatusTicket) => void;
  setDraftPriority: (priority: PriorityTicket) => void;
  setDraftAssigneeId: (id: string) => void;
  onUpdate: () => void;
}

export function TicketInfoCard({
  ticket,
  canEdit,
  isUpdating,
  currentUser,
  isDirty,
  staffList,
  draftStatus,
  draftPriority,
  draftAssigneeId,
  setDraftStatus,
  setDraftPriority,
  setDraftAssigneeId,
  onUpdate,
}: TicketInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Informasi Tiket</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-xs font-medium text-muted-foreground mb-1">
            Status
          </h3>
          <Select
            value={draftStatus}
            onValueChange={(v) => setDraftStatus(v as StatusTicket)}
            disabled={!canEdit || isUpdating}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value={StatusTicket.pending}>Pending</SelectItem>
              <SelectItem value={StatusTicket.progress}>In Progress</SelectItem>
              <SelectItem value={StatusTicket.done}>Completed</SelectItem>
              <SelectItem value={StatusTicket.cancel}>Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <h3 className="text-xs font-medium text-muted-foreground mb-1">
            Prioritas
          </h3>
          <Select
            value={draftPriority}
            onValueChange={(v) => setDraftPriority(v as PriorityTicket)}
            disabled={!canEdit || isUpdating}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Prioritas</SelectItem>
              <SelectItem value={PriorityTicket.low}>Low</SelectItem>
              <SelectItem value={PriorityTicket.medium}>Medium</SelectItem>
              <SelectItem value={PriorityTicket.high}>High</SelectItem>
              <SelectItem value={PriorityTicket.urgent}>Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {currentUser?.role === "admin" && (
          <div>
            <h3 className="text-xs font-medium text-muted-foreground mb-1">
              Ditangani oleh
            </h3>
            <Select
              value={draftAssigneeId || ""}
              onValueChange={(v) => setDraftAssigneeId(v)}
              disabled={!canEdit || isUpdating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tugaskan ke staf..." />
              </SelectTrigger>
              <SelectContent>
                {staffList.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <h3 className="text-xs font-medium text-muted-foreground">
            Kategori
          </h3>
          <p className="mt-1 text-sm">
            {ticket.category?.name}
            {ticket.subcategory?.name && ` > ${ticket.subcategory?.name}`}
          </p>
        </div>
        {ticket.department && (
          <div>
            <h3 className="text-xs font-medium text-muted-foreground">
              Departemen
            </h3>
            <p className="mt-1 text-sm">{ticket.department}</p>
          </div>
        )}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h3 className="text-xs font-medium text-muted-foreground">
              Dibuat oleh
            </h3>
            <div className="mt-1 flex items-center">
              <User2 className="h-4 w-4 mr-2 text-muted-foreground" />
              <p className="text-sm">{ticket.user?.name}</p>
            </div>
          </div>
          {ticket.assignedTo && (
            <div>
              <h3 className="text-xs font-medium text-muted-foreground">
                Ditangani oleh
              </h3>
              <div className="mt-1 flex items-center">
                <User2 className="h-4 w-4 mr-2 text-muted-foreground" />
                <p className="text-sm">{ticket.assignedTo?.name}</p>
              </div>
            </div>
          )}
        </div>
        <div>
          <h3 className="text-xs font-medium text-muted-foreground">
            Diperbarui
          </h3>
          <p className="mt-1 text-sm">
            {formatDate(ticket.updatedAt, "dd MMM yyyy, HH:mm")}
          </p>
        </div>
      </CardContent>
      {canEdit && (
        <CardFooter>
          <Button
            className="w-full"
            onClick={onUpdate}
            disabled={!isDirty || isUpdating}
          >
            {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
