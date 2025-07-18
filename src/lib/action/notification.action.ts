"use server";

import prisma from "@/lib/prisma";
import { getProfile } from "./user.action";
import { revalidatePath } from "next/cache";
import { NotificationType, Prisma } from "@prisma/client";

interface CreateNotificationPayload {
  userId: string;
  title: string;
  message: string;
  url: string;
  type: NotificationType;
}

export async function createNotification(payload: CreateNotificationPayload) {
  try {
    await prisma.notification.create({
      data: payload,
    });
  } catch (error) {
    console.error("CREATE_NOTIFICATION_ERROR:", error);
  }
}

export async function getNotifications() {
  try {
    const user = await getProfile();
    if (!user) return { unreadCount: 0, notifications: [] };

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    });

    return { unreadCount, notifications };
  } catch (error) {
    return { unreadCount: 0, notifications: [] };
  }
}

export async function markNotificationsAsRead() {
  try {
    const user = await getProfile();
    if (!user) return;

    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });

    revalidatePath("/");
  } catch (error) {
    console.error("MARK_NOTIFICATIONS_READ_ERROR:", error);
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const user = await getProfile();
    if (!user) throw new Error("Tidak terautentikasi.");

    await prisma.notification.update({
      where: { id: notificationId, userId: user.id },
      data: { isRead: true },
    });
    revalidatePath("/");
  } catch (error) {
    console.error("MARK_ONE_NOTIFICATION_READ_ERROR:", error);
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    const user = await getProfile();
    if (!user) throw new Error("Tidak terautentikasi.");

    await prisma.notification.delete({
      where: { id: notificationId, userId: user.id },
    });
    revalidatePath("/");
  } catch (error) {
    console.error("DELETE_NOTIFICATION_ERROR:", error);
  }
}

export async function getUrgentTicketsForUser() {
  try {
    const user = await getProfile();
    if (!user || (user.role !== "admin" && user.role !== "staff")) {
      return [];
    }

    const where: Prisma.TicketWhereInput = {
      priority: "urgent",
      status: { not: "done" },
    };

    if (user.role === "staff") {
      where.assignedToId = user.id;
    }

    const tickets = await prisma.ticket.findMany({
      where,
      select: {
        id: true,
        subject: true,
      },
    });

    return tickets;
  } catch (error) {
    return [];
  }
}
