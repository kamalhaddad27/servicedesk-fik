"use client"

import { motion } from "framer-motion"
import { useNotifications } from "@/hooks/use-notification"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { formatRelativeTime } from "@/lib/utils"
import { Bell, Check, Trash2, FileText, MessageSquare, Info } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface NotificationListProps {
  onClose: () => void
}

// Animation variants
const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
}

export function NotificationList({ onClose }: NotificationListProps) {
  const { notifications, isLoading, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
  const [activeTab, setActiveTab] = useState("all")

  // Get notification type icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ticket":
        return <FileText className="h-4 w-4 text-primary-600" />
      case "message":
        return <MessageSquare className="h-4 w-4 text-info" />
      case "system":
        return <Bell className="h-4 w-4 text-accent-500" />
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />
    }
  }

  // Get notification color based on type
  const getNotificationColor = (type: string) => {
    switch (type) {
      case "ticket":
        return "bg-primary-50 text-primary-600 border-primary-100"
      case "message":
        return "bg-info-light text-info border-info/20"
      case "system":
        return "bg-accent-50 text-accent-600 border-accent-100"
      default:
        return "bg-muted text-muted-foreground border-muted"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner className="h-8 w-8 text-primary-500" />
      </div>
    )
  }

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.isRead
    return notification.type === activeTab
  })

  const unreadCount = notifications.filter((notification) => !notification.isRead).length

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600 mb-4">
          <Bell className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-medium">Tidak ada notifikasi</h3>
        <p className="text-sm text-muted-foreground mt-1">Anda belum memiliki notifikasi</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between p-2 border-b">
          <TabsList className="grid grid-cols-4 h-9 bg-muted">
            <TabsTrigger
              value="all"
              className="text-xs data-[state=active]:bg-primary-50 data-[state=active]:text-primary-600 data-[state=active]:shadow-none"
            >
              Semua
              {unreadCount > 0 && (
                <Badge
                  variant="outline"
                  className="ml-1.5 h-4 min-w-4 rounded-full px-1 py-0 text-[10px] bg-primary-50 text-primary-600 border-primary-100"
                >
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="ticket"
              className="text-xs data-[state=active]:bg-primary-50 data-[state=active]:text-primary-600 data-[state=active]:shadow-none"
            >
              Tiket
            </TabsTrigger>
            <TabsTrigger
              value="message"
              className="text-xs data-[state=active]:bg-primary-50 data-[state=active]:text-primary-600 data-[state=active]:shadow-none"
            >
              Pesan
            </TabsTrigger>
            <TabsTrigger
              value="unread"
              className="text-xs data-[state=active]:bg-primary-50 data-[state=active]:text-primary-600 data-[state=active]:shadow-none"
            >
              Belum Dibaca
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-0 flex-1 overflow-y-auto max-h-[400px] p-2">
          {filteredNotifications.length > 0 ? (
            <motion.ul variants={listVariants} initial="hidden" animate="visible" className="space-y-2">
              {filteredNotifications.map((notification) => (
                <motion.li
                  key={notification.id}
                  variants={itemVariants}
                  className={cn(
                    "relative rounded-lg p-3 transition-all",
                    notification.isRead ? "bg-white" : "bg-primary-50",
                    "hover:bg-primary-50/80 group",
                  )}
                >
                  <div className="flex gap-3">
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full",
                        getNotificationColor(notification.type || "default"),
                      )}
                    >
                      {getNotificationIcon(notification.type || "default")}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4
                            className={cn(
                              "text-sm font-medium",
                              notification.isRead ? "text-foreground" : "text-primary-700",
                            )}
                          >
                            {notification.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {formatRelativeTime(notification.createdAt)}
                          </span>
                          {!notification.isRead && (
                            <Badge
                              variant="outline"
                              className="h-1.5 w-1.5 rounded-full p-0 bg-primary-500 border-primary-500"
                            />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        {notification.actionUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs border-primary-200 text-primary-600 hover:bg-primary-50"
                            onClick={() => {
                              markAsRead.mutate(notification.id)
                              onClose()
                            }}
                            asChild
                          >
                            <a href={notification.actionUrl}>Lihat Detail</a>
                          </Button>
                        )}

                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-muted-foreground hover:text-primary-600 hover:bg-primary-50"
                            onClick={() => markAsRead.mutate(notification.id)}
                            disabled={markAsRead.isPending}
                          >
                            <Check className="mr-1 h-3 w-3" />
                            Tandai Dibaca
                          </Button>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 absolute top-2 right-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-primary-100 hover:text-primary-600"
                      onClick={() => deleteNotification.mutate(notification.id)}
                      disabled={deleteNotification.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600 mb-4">
                <Bell className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium">Tidak ada notifikasi</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {activeTab === "unread"
                  ? "Semua notifikasi telah dibaca"
                  : activeTab === "all"
                    ? "Anda belum memiliki notifikasi"
                    : `Anda belum memiliki notifikasi ${
                        activeTab === "ticket" ? "tiket" : activeTab === "message" ? "pesan" : "sistem"
                      }`}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {notifications.length > 0 && (
        <div className="mt-auto pt-4 border-t border-primary-100 flex justify-between p-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-primary-600 hover:bg-primary-50"
            onClick={() => notifications.forEach((n) => deleteNotification.mutate(n.id))}
          >
            Hapus Semua
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs border-primary-200 text-primary-600 hover:bg-primary-50"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
          >
            <Check className="mr-1 h-3.5 w-3.5" />
            Tandai Semua Dibaca
          </Button>
        </div>
      )}
    </div>
  )
}
