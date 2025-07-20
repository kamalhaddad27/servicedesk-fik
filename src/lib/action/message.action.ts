"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getProfile } from "./user.action";
import { Prisma } from "@prisma/client";
import { createNotification } from "./notification.action";

interface AddMessagePayload {
  ticketId: string;
  message: string;
  isInternal: boolean;
  attachment: { fileName: string; fileUrl: string } | null;
}

export async function getTicketMessages(ticketId: string) {
  try {
    const user = await getProfile();
    if (!user) throw new Error("Tidak terautentikasi");

    const where: Prisma.TicketMessageWhereInput = {
      ticketId: ticketId,
    };

    // Jika pengguna adalah 'user', jangan tampilkan pesan internal
    if (user.role === "mahasiswa" || user.role === "dosen") {
      where.isInternal = false;
    }

    const messages = await prisma.ticketMessage.findMany({
      where,
      include: {
        user: {
          select: { name: true, role: true },
        },
        attachments: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    const canView =
      user.role === "admin" ||
      user.role === "staff" ||
      ticket?.userId === user.id;

    if (!canView) throw new Error("Anda tidak punya akses ke tiket ini.");

    return { success: true, data: messages };
  } catch (error: any) {
    return { success: false, message: error.message, data: [] };
  }
}

export async function addTicketMessage({
  ticketId,
  message,
  isInternal,
  attachment,
}: AddMessagePayload) {
  try {
    const user = await getProfile();
    if (!user) throw new Error("Tidak terautentikasi");

    if (isInternal && user.role !== "admin" && user.role !== "staff") {
      throw new Error(
        "Hanya admin dan staf yang bisa mengirim pesan internal."
      );
    }

    const newMessage = await prisma.ticketMessage.create({
      data: {
        ticketId,
        userId: user.id,
        message,
        isInternal,
        attachments: {
          create: attachment
            ? {
                fileName: attachment.fileName,
                fileUrl: attachment.fileUrl,
              }
            : undefined,
        },
      },
    });

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { userId: true, assignedToId: true, subject: true },
    });
    if (!ticket) return;

    const recipients = new Set<string>();
    if (ticket.userId !== user.id) {
      recipients.add(ticket.userId);
    }
    if (ticket.assignedToId && ticket.assignedToId !== user.id) {
      recipients.add(ticket.assignedToId);
    }

    if (user.role !== "admin") {
      const admins = await prisma.user.findMany({
        where: { role: "admin" },
        select: { id: true },
      });
      admins.forEach((admin) => recipients.add(admin.id));
    }

    for (const recipientId of recipients) {
      if (recipientId === user.id) continue;

      await createNotification({
        userId: recipientId,
        title: "Pesan Baru di Tiket",
        message: `${
          user.name
        } mengirim pesan di tiket "${ticket.subject.substring(0, 20)}...".`,
        url: `/tickets/${ticketId}`,
        type: "MESSAGE",
      });
    }

    revalidatePath(`/tickets/${ticketId}`);

    return {
      success: true,
      message: "Pesan berhasil dikirim.",
      data: newMessage,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mengirim pesan.",
    };
  }
}
