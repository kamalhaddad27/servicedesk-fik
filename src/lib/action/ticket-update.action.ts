"use server";

import prisma from "@/lib/prisma";
import { StatusTicket, PriorityTicket } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getProfile } from "./user.action";
import { createNotification } from "./notification.action";

// Helper function untuk cek izin
async function checkPermission(ticketId: string) {
  const user = await getProfile();
  if (!user || (user.role !== "admin" && user.role !== "staff")) {
    throw new Error("Anda tidak diizinkan melakukan aksi ini.");
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (user.role === "staff" && ticket?.assignedToId !== user.id) {
    throw new Error("Anda bukan penanggung jawab tiket ini.");
  }
  return { user, ticket };
}

export interface UpdateTicketPayload {
  status?: StatusTicket;
  priority?: PriorityTicket;
  assignedToId?: string;
}

export async function updateTicketDetails({
  ticketId,
  payload,
}: {
  ticketId: string;
  payload: UpdateTicketPayload;
}) {
  try {
    const { user: updater, ticket: originalTicket } = await checkPermission(
      ticketId
    );
    if (!originalTicket) throw new Error("Tiket tidak ditemukan.");

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: payload,
    });

    if (payload.assignedToId) {
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        select: { subject: true },
      });
      await createNotification({
        userId: payload.assignedToId,
        title: "Anda Mendapat Tugas Baru",
        message: `Anda telah ditugaskan untuk menangani tiket "${ticket?.subject.substring(
          0,
          30
        )}...".`,
        url: `/tickets/${ticketId}`,
        type: "TICKET",
      });
    }

    if (originalTicket.userId !== updater.id) {
      let notifMessage = "";
      let notifTitle = "Tiket Anda Diperbarui";

      if (payload.status && payload.status !== originalTicket.status) {
        notifMessage = `Status tiket "${originalTicket.subject.substring(
          0,
          20
        )}..." diubah menjadi ${payload.status}.`;
      } else if (
        payload.priority &&
        payload.priority !== originalTicket.priority
      ) {
        notifMessage = `Prioritas tiket "${originalTicket.subject.substring(
          0,
          20
        )}..." diubah menjadi ${payload.priority}.`;
      } else if (
        payload.assignedToId &&
        payload.assignedToId !== originalTicket.assignedToId
      ) {
        notifTitle = "Tiket Anda Sedang Diproses";
        notifMessage = `Tiket Anda telah ditugaskan kepada staf untuk ditangani.`;
      }

      // Kirim notifikasi jika ada pesan yang relevan
      if (notifMessage) {
        await createNotification({
          userId: originalTicket.userId,
          title: notifTitle,
          message: notifMessage,
          url: `/tickets/${ticketId}`,
          type: "TICKET",
        });
      }
    }

    revalidatePath(`/tickets/${ticketId}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Tiket berhasil diperbarui.",
      data: updatedTicket,
    };
  } catch (error: any) {
    return { success: false, message: error.message, data: null };
  }
}
