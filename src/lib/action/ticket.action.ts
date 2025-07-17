"use server";

import prisma from "@/lib/prisma";
import { PriorityTicket, Prisma, RoleUser, StatusTicket } from "@prisma/client";
import { getProfile } from "./user.action";
import { revalidatePath } from "next/cache";
import { TCreateTicketSchema } from "../validator/ticket";

interface GetTicketsParams {
  page?: number;
  limit?: number;
  query?: string;
  status?: StatusTicket;
  priority?: PriorityTicket;
  categoryId?: string;
}

export async function getTickets({
  page = 1,
  limit = 10,
  query,
  status,
  priority,
  categoryId,
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
    if (categoryId) {
      filterConditions.categoryId = categoryId;
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
          category: { select: { name: true } },
          subcategory: { select: { name: true } },
        },
      }),
      prisma.ticket.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

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
        category: { select: { name: true } },
        subcategory: { select: { name: true } },
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

export async function getAssignedTickets({
  page = 1,
  limit = 10,
  query,
  status,
  priority,
  categoryId,
}: GetTicketsParams) {
  try {
    const user = await getProfile();
    // Pastikan hanya staf yang bisa mengakses
    if (!user || user.role !== RoleUser.staff) {
      throw new Error("Hanya staf yang dapat mengakses halaman ini.");
    }

    const skip = (page - 1) * limit;

    const where: Prisma.TicketWhereInput = {
      assignedToId: user.id,
    };

    if (query) {
      where.subject = { contains: query };
    }
    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [tickets, totalItems] = await prisma.$transaction([
      prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          user: { select: { name: true } },
          assignedTo: { select: { name: true } },
          category: { select: { name: true } },
        },
      }),
      prisma.ticket.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return { data: tickets, totalPages, totalItems };
  } catch (error: any) {
    console.error("GET_ASSIGNED_TICKETS_ERROR:", error);
    if (error.message.includes("Hanya staf")) {
      throw error;
    }
    return { data: [], totalPages: 0, totalItems: 0 };
  }
}

export async function createTicket(values: TCreateTicketSchema) {
  try {
    const user = await getProfile();
    if (!user) throw new Error("Anda harus login untuk membuat tiket.");

    await prisma.ticket.create({
      data: {
        subject: values.subject,
        description: values.description,
        type: values.type,
        department: values.department,
        priority: values.priority,
        userId: user.id, // ID pengguna yang sedang login
        categoryId: values.categoryId,
        subcategoryId: values.subcategoryId,
        status: "pending", // Status default saat dibuat
      },
    });

    revalidatePath("/tickets");
    revalidatePath("/dashboard");
  } catch (error: any) {
    return { error: error.message || "Gagal membuat tiket." };
  }
}
