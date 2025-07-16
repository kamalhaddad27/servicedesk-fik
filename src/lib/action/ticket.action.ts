// lib/actions/ticket.actions.ts
"use server";

import prisma from "@/lib/prisma";
import { Prisma, StatusTicket, PriorityTicket } from "@prisma/client";
import { getProfile } from "./user.action";

// ACTION UNTUK MENGAMBIL DAFTAR TIKET (DENGAN FILTER & PAGINASI)
interface GetTicketsParams {
  query?: string;
  status?: StatusTicket;
  priority?: PriorityTicket;
  page?: number;
  limit?: number;
}

export async function getTickets({
  query,
  status,
  priority,
  page = 1,
  limit = 10,
}: GetTicketsParams) {
  try {
    const user = await getProfile();

    if (!user) {
      throw new Error("Anda harus login untuk melihat tiket.");
    }

    const skip = (page - 1) * limit;

    // Objek 'where' dinamis berdasarkan filter dan peran pengguna
    const where: Prisma.TicketWhereInput = {};

    // 1. Terapkan filter berdasarkan pencarian (query)
    if (query) {
      where.OR = [
        { subject: { contains: query } },
        { description: { contains: query } },
      ];
    }

    // 2. Terapkan filter status dan prioritas
    if (status) where.status = status;
    if (priority) where.priority = priority;

    // 3. Terapkan filter berdasarkan peran (Role-Based Access Control)
    if (user.role === "user") {
      // User hanya bisa melihat tiket yang mereka buat
      where.userId = user.id;
    } else if (user.role === "staff") {
      // Staf bisa melihat tiket yang ditugaskan kepada mereka ATAU yang belum ditugaskan
      where.OR = [
        ...(where.OR || []),
        { assignedToId: user.id },
        { assignedToId: null },
      ];
    }
    // Admin tidak perlu filter tambahan, bisa melihat semua tiket

    // Ambil data tiket dengan paginasi dan relasi
    const tickets = await prisma.ticket.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: { select: { name: true } }, // Pembuat tiket
        assignedTo: { select: { name: true } }, // Yang ditugaskan
      },
    });

    // Hitung total tiket untuk paginasi
    const totalTickets = await prisma.ticket.count({ where });
    const totalPages = Math.ceil(totalTickets / limit);

    return {
      data: tickets,
      totalPages,
    };
  } catch (error) {
    console.error("GET_TICKETS_ERROR:", error);
    return { data: [], totalPages: 0 };
  }
}

// ACTION UNTUK MENGAMBIL DETAIL SATU TIKET
export async function getTicketById(id: string) {
  try {
    const user = await getProfile();
    if (!user) {
      throw new Error("Tidak terautentikasi");
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        assignedTo: { select: { name: true, email: true } },
        message: {
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { name: true, role: true } }, // Sertakan detail pengirim pesan
          },
        },
      },
    });

    if (!ticket) return null;

    // Cek hak akses
    const isAdmin = user.role === "admin";
    const isCreator = ticket.userId === user.id;
    const isAssignedTo = ticket.assignedToId === user.id;

    if (isAdmin || isCreator || isAssignedTo) {
      return ticket;
    }

    // Jika tidak punya hak akses
    return null;
  } catch (error) {
    console.error("GET_TICKET_BY_ID_ERROR:", error);
    return null;
  }
}
