import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { PriorityTicket, RoleUser, StatusTicket } from "@prisma/client";

// Combine class names with tailwind-merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date with Indonesian locale
export function formatDate(
  date: Date | string,
  formatStr: string = "PPP"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, formatStr, { locale: id });
}

// Generate ticket badge color based on status
export function getTicketStatusColor(status: StatusTicket) {
  switch (status) {
    case "progress":
      return "bg-blue-200";
    case "pending":
      return "bg-yellow-200";
    case "done":
      return "bg-green-200";
    default:
      return "bg-gray-200";
  }
}

// Generate ticket priority color
export function getTicketPriorityColor(priority: PriorityTicket) {
  switch (priority) {
    case "low":
      return "bg-sky-200";
    case "medium":
      return "bg-amber-200";
    case "high":
      return "bg-orange-200";
    case "urgent":
      return "bg-red-200";
    default:
      return "bg-gray-200";
  }
}

// Generate SLA status color
export const getRoleBadgeColor = (role: RoleUser) => {
  switch (role) {
    case "admin":
      return "bg-purple-100 text-purple-800";
    case "staff":
      return "bg-amber-100 text-amber-800";
    case "dosen":
      return "bg-green-100 text-green-800";
    case "mahasiswa":
      return "bg-sky-100 text-sky-800";
  }
};
