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

// Format relative time (e.g., "5 minutes ago")
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: id });
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
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
    case "user":
      return "bg-green-100 text-green-800";
  }
};

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

// Check if user has permission
export function hasPermission(
  userRole: string,
  requiredRoles: string[]
): boolean {
  return requiredRoles.includes(userRole);
}
