"use server";

import prisma from "@/lib/prisma";
import { PriorityTicket, Prisma, StatusTicket } from "@prisma/client";
import { getProfile } from "./user.action";

// Definisikan interface untuk parameter yang diterima
interface GetTicketsParams {
  page?: number;
  limit?: number;
  query?: string;
  status?: StatusTicket;
  priority?: PriorityTicket;
}

export async function getTickets({
  page = 1,
  limit = 10, // Default 10 item per halaman
  query,
  status,
  priority,
}: GetTicketsParams) {
  try {
    const user = await getProfile();
    if (!user) {
      throw new Error("Anda harus login untuk melihat tiket.");
    }

    const skip = (page - 1) * limit;

    const filterConditions: Prisma.TicketWhereInput = {};
    if (query) {
      filterConditions.subject = { contains: query };
    }
    if (status) {
      filterConditions.status = status;
    }
    if (priority) {
      filterConditions.priority = priority;
    }

    const where: Prisma.TicketWhereInput = {};

    if (user.role === "user") {
      where.AND = [filterConditions, { userId: user.id }];
    } else if (user.role === "staff") {
      where.AND = [
        filterConditions,
        { OR: [{ assignedToId: user.id }, { assignedToId: null }] },
      ];
    } else {
      // Admin
      Object.assign(where, filterConditions);
    }

    // 4. Gunakan $transaction untuk mengambil data dan total hitungan secara efisien
    const [tickets, totalItems] = await prisma.$transaction([
      prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          user: { select: { name: true } },
          assignedTo: { select: { name: true } },
        },
      }),
      prisma.ticket.count({ where }),
    ]);

    // 5. Hitung total halaman
    const totalPages = Math.ceil(totalItems / limit);

    // 6. Kembalikan data beserta informasi paginasi
    return {
      data: tickets,
      totalPages,
      totalItems,
    };
  } catch (error) {
    console.error("GET_TICKETS_ERROR:", error);
    return { data: [], totalPages: 0, totalItems: 0 };
  }
}

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
            user: { select: { name: true, role: true } },
          },
        },
      },
    });

    if (!ticket) {
      return null;
    }

    // Cek hak akses untuk melihat tiket
    const isAdmin = user.role === "admin";
    const isCreator = ticket.userId === user.id;
    const isAssignedTo = ticket.assignedToId === user.id;

    if (isAdmin || isCreator || isAssignedTo) {
      return ticket;
    }

    // Jika tidak punya hak akses, kembalikan null
    return null;
  } catch (error) {
    console.error("GET_TICKET_BY_ID_ERROR:", error);
    return null;
  }
}
