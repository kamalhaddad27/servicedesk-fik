"use server";

import prisma from "@/lib/prisma";
import { PriorityTicket, Prisma, RoleUser, StatusTicket } from "@prisma/client";
import { getProfile } from "./user.action";
import { revalidatePath } from "next/cache";
import { TCreateTicketSchema } from "../validator/ticket";
import { createNotification } from "./notification.action";
import { responAction } from "./responseAction";

interface GetTicketsParams {
  page?: number;
  limit?: number;
  query?: string;
  status?: StatusTicket;
  priority?: PriorityTicket;
  categoryId?: string;
  assignment?: "me" | "unassigned";
}

export async function getTickets({
  page = 1,
  limit = 10,
  query,
  status,
  priority,
  categoryId,
  assignment,
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
    if (user.role === "staff" && assignment === "me") {
      filterConditions.assignedToId = user.id;
    } else if (assignment === "unassigned") {
      filterConditions.assignedToId = null;
    }

    const where: Prisma.TicketWhereInput = {};
    if (user.role === "dosen" || user.role === "mahasiswa") {
      where.AND = [filterConditions, { userId: user.id }];
    } else if (user.role === "staff" && assignment !== "me") {
      where.AND = [
        filterConditions,
        { OR: [{ assignedToId: user.id }, { assignedToId: null }] },
      ];
    } else {
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
            attachments: true,
          },
        },
        attachments: {
          select: {
            id: true,
            fileName: true,
            fileUrl: true,
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

export async function createTicket(
  values: TCreateTicketSchema & {
    attachment: { fileName: string; fileUrl: string } | null;
  }
) {
  try {
    const user = await getProfile();
    if (!user) throw new Error("Anda harus login untuk membuat tiket.");

    const dataTicket = await prisma.ticket.create({
      data: {
        subject: values.subject,
        description: values.description,
        type: values.type,
        department: values.department,
        priority: values.priority,
        userId: user.id,
        categoryId: values.categoryId,
        subcategoryId: values.subcategoryId,
        status: "pending",
        attachments: {
          create: values.attachment
            ? {
                fileName: values.attachment.fileName,
                fileUrl: values.attachment.fileUrl,
              }
            : undefined,
        },
      },
    });

    const adminsAndStaff = await prisma.user.findMany({
      where: { role: { in: ["admin", "staff"] } },
      select: { id: true },
    });

    for (const recipient of adminsAndStaff) {
      await createNotification({
        userId: recipient.id,
        title: "Tiket Baru Dibuat",
        message: `Tiket "${dataTicket.subject.substring(
          0,
          30
        )}..." telah dibuat oleh ${user.name}.`,
        url: `/tickets/${dataTicket.id}`,
        type: "TICKET",
      });
    }

    revalidatePath("/tickets");
    revalidatePath("/dashboard");

    return responAction({
      statusSuccess: true,
      messageSuccess: "ticket berhasil dibuat",
    });
  } catch (error: any) {
    return responAction({
      statusError: true,
      messageError: "Gagal membuat tiket",
    });
  }
}

export async function getRelatedTickets(userId: string) {
  try {
    // Cek izin, hanya admin yang boleh melihat tiket orang lain
    const currentUser = await getProfile();
    if (
      !currentUser ||
      (currentUser.role !== "admin" && currentUser.id !== userId)
    ) {
      throw new Error("Akses ditolak.");
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        OR: [{ userId: userId }, { assignedToId: userId }],
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 10,
      include: {
        category: { select: { name: true } },
      },
    });

    return { success: true, data: tickets };
  } catch (error: any) {
    return { success: false, message: error.message, data: [] };
  }
}
