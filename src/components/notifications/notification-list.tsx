"use client"

import { motion } from "framer-motion"
import { useNotification } from "@/providers/notification-provider"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { formatRelativeTime } from "@/lib/utils"
import { Bell, Check, Trash2 } from "lucide-react"

interface NotificationListProps {
  onClose: () => void
}

export function NotificationList({ onClose }: NotificationListProps) {
  const { notifications, isLoading, markAsRead, markAllAsRead, deleteNotification } = useNotifications()

  if (isLoading) {
    return (
      <div className="p-4">
        <LoadingSpinner />
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center">
        <Bell className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">Tidak ada notifikasi</p>
      </div>
    )
  }

  return (
    <div className="max-h-96 overflow-y-auto p-2">
      <div className="flex items-center justify-between p-2">
        <h3 className="font-medium">Notifikasi</h3>
        <Button variant="ghost" size="sm" onClick={() => markAllAsRead.mutate()} disabled={markAllAsRead.isPending}>
          <Check className="mr-1 h-4 w-4" />
          <span className="text-xs">Tandai semua dibaca</span>
        </Button>
      </div>

      <motion.ul
        className="space-y-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.05 }}
      >
        {notifications.map((notification) => (
          <motion.li
            key={notification.id}
            className="relative rounded-md p-3 hover:bg-muted"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start gap-2">
              <div className={`h-2 w-2 mt-2 rounded-full ${notification.isRead ? "bg-transparent" : "bg-primary"}`} />
              <div className="flex-1">
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="text-xs text-muted-foreground">{notification.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(notification.createdAt)}</p>
              </div>
              <div className="flex gap-1">
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => markAsRead.mutate(notification.id)}
                    disabled={markAsRead.isPending}
                  >
                    <Check className="h-4 w-4" />
                    <span className="sr-only">Mark as read</span>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => deleteNotification.mutate(notification.id)}
                  disabled={deleteNotification.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  )
}
