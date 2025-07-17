"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getProfile } from "./user.action";
import { Prisma } from "@prisma/client";

export async function getTicketMessages(ticketId: string) {
  try {
    const user = await getProfile();
    if (!user) throw new Error("Tidak terautentikasi");

    const where: Prisma.TicketMessageWhereInput = {
      ticketId: ticketId,
    };

    // Jika pengguna adalah 'user', jangan tampilkan pesan internal
    if (user.role === "user") {
      where.isInternal = false;
    }

    const messages = await prisma.ticketMessage.findMany({
      where,
      include: {
        user: {
          // Ambil info pengirim pesan
          select: { name: true, role: true },
        },
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

interface AddMessagePayload {
  ticketId: string;
  message: string;
  isInternal: boolean;
}

export async function addTicketMessage({
  ticketId,
  message,
  isInternal,
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
      },
    });

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
