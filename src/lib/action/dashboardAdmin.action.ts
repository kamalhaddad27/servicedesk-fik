"use server";

import prisma from "@/lib/prisma";
import { getProfile } from "./user.action";
import { RoleUser, StatusTicket } from "@prisma/client";

export async function getDashboardAdminStats() {
  try {
    const user = await getProfile();

    if (!user || user.role !== RoleUser.admin) {
      throw new Error("Tidak diizinkan");
    }

    const totalTickets = await prisma.ticket.count();
    const completedTickets = await prisma.ticket.count({
      where: {
        status: StatusTicket.done,
      },
    });
    const activeTickets = await prisma.ticket.count({
      where: {
        status: {
          notIn: [StatusTicket.cancel],
        },
      },
    });
    const totalUsers = await prisma.user.count();
    const ticketsByStatusRaw = await prisma.ticket.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
      orderBy: {
        _count: {
          status: "desc",
        },
      },
    });
    const ticketsByStatus = ticketsByStatusRaw.map((item) => ({
      status: item.status,
      count: item._count.status,
    }));
    const ticketsByPriorityRaw = await prisma.ticket.groupBy({
      by: ["priority"],
      _count: {
        priority: true,
      },
      orderBy: {
        _count: {
          priority: "desc",
        },
      },
    });
    const ticketsByPriority = ticketsByPriorityRaw.map((item) => ({
      priority: item.priority,
      count: item._count.priority,
    }));
    const recentTickets = await prisma.ticket.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: { select: { name: true } },
      },
    });

    return {
      totalTickets,
      completedTickets,
      activeTickets,
      totalUsers,
      ticketsByStatus,
      ticketsByPriority,
      recentTickets,
    };
  } catch (error) {
    console.error("GET_DASHBOARD_STATS_ERROR:", error);
    // Kembalikan nilai default jika terjadi error
    return {
      totalTickets: 0,
      completedTickets: 0,
      activeTickets: 0,
      totalUsers: 0,
      ticketsByStatus: [],
      ticketsByPriority: [],
      recentTickets: [],
    };
  }
}
