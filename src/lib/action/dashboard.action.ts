"use server";

import prisma from "@/lib/prisma";
import { getProfile } from "./user.action";
import { PriorityTicket, RoleUser, StatusTicket } from "@prisma/client";

export async function getAdminDashboardStats() {
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
        category: { select: { name: true } },
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

export async function getStaffDashboardStats() {
  try {
    const user = await getProfile();
    if (!user || user.role !== RoleUser.staff) {
      throw new Error("Hanya staf yang diizinkan");
    }

    // Hitung tiket aktif yang ditugaskan ke staf ini
    const myActiveTickets = await prisma.ticket.count({
      where: {
        assignedToId: user.id,
        status: { not: StatusTicket.done },
      },
    });

    // Hitung tiket prioritas tinggi yang ditugaskan ke staf ini
    const myUrgentTickets = await prisma.ticket.count({
      where: {
        assignedToId: user.id,
        status: { not: StatusTicket.done },
        priority: { in: [PriorityTicket.urgent, PriorityTicket.high] },
      },
    });

    // Hitung tiket yang diselesaikan oleh staf ini
    const myCompletedTickets = await prisma.ticket.count({
      where: {
        assignedToId: user.id,
        status: StatusTicket.done,
      },
    });

    // Hitung tiket yang belum ditugaskan sama sekali
    const unassignedTickets = await prisma.ticket.count({
      where: { assignedToId: null },
    });

    // Ambil 5 tiket teratas yang ditugaskan ke staf ini
    const myRecentTasks = await prisma.ticket.findMany({
      where: {
        assignedToId: user.id,
        status: { not: StatusTicket.done },
      },
      take: 5,
      orderBy: [
        { priority: "desc" }, // Tampilkan urgent & high terlebih dahulu
        { updatedAt: "desc" },
      ],
      include: {
        user: { select: { name: true } }, // Pembuat tiket
      },
    });

    return {
      myActiveTickets,
      myUrgentTickets,
      myCompletedTickets,
      unassignedTickets,
      myRecentTasks,
    };
  } catch (error) {
    console.error("GET_STAFF_STATS_ERROR:", error);
    return {
      myActiveTickets: 0,
      myUrgentTickets: 0,
      myCompletedTickets: 0,
      unassignedTickets: 0,
      myRecentTasks: [],
    };
  }
}

export async function getUserDashboardStats() {
  try {
    const user = await getProfile();
    if (!user) {
      throw new Error("Anda harus login.");
    }

    const whereClause = { userId: user.id };

    // Hitung tiket aktif milik user
    const myActiveTickets = await prisma.ticket.count({
      where: {
        ...whereClause,
        status: { not: StatusTicket.done },
      },
    });

    // Hitung tiket selesai milik user
    const myCompletedTickets = await prisma.ticket.count({
      where: {
        ...whereClause,
        status: StatusTicket.done,
      },
    });

    // Hitung total tiket
    const totalTickets = await prisma.ticket.count({ where: whereClause });

    // Ambil 5 tiket terbaru milik user
    const recentTickets = await prisma.ticket.findMany({
      where: whereClause,
      take: 5,
      orderBy: {
        updatedAt: "desc",
      },
    });

    return {
      myActiveTickets,
      myCompletedTickets,
      totalTickets,
      recentTickets,
    };
  } catch (error) {
    console.error("GET_USER_STATS_ERROR:", error);
    return {
      myActiveTickets: 0,
      myCompletedTickets: 0,
      totalTickets: 0,
      recentTickets: [],
    };
  }
}
